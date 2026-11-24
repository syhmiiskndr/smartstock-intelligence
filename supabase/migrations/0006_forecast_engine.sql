-- =====================================================================
-- SmartStock Intelligence — 0006 forecast engine v1 + automatic draft purchase orders
-- ADDITIVE and safe to re-run. Run AFTER 0005.
--
-- generate_forecasts() runs in SQL for the caller's company. For every product it works out:
--   * expected daily demand, from the company's own usage history (see the "learning ladder")
--   * how many days until stock runs out (day by day, so busy weekdays count more)
--   * how much stock will spoil before it can be used (FEFO: first expiry, first out)
--   * when to reorder (lead time + safety stock) and how much (capped by capacity and shelf life)
-- and, when stock is going to run short, drafts a purchase order into Approvals (never orders by itself).
--
-- Learning ladder (data_days = full days of usage history, max 28):
--   0      rules    : no history yet, uses the reorder level the owner set
--   1-6    average  : average daily use
--   7-13   trend    : 60% last 7 days + 40% all days
--   14+    weekday  : trend + a day-of-week factor (Mon..Sun, shrunk toward 1 when samples are few)
-- =====================================================================

alter table forecasts add column if not exists forecast_date date;
alter table forecasts add column if not exists avg_daily_demand numeric;
alter table forecasts add column if not exists on_hand numeric;
alter table forecasts add column if not exists incoming_qty numeric;
alter table forecasts add column if not exists days_to_stockout numeric;      -- null = more than 30 days
alter table forecasts add column if not exists stockout_date date;
alter table forecasts add column if not exists reorder_point numeric;
alter table forecasts add column if not exists safety_stock numeric;
alter table forecasts add column if not exists lead_time_days int;
alter table forecasts add column if not exists vendor_id bigint;
alter table forecasts add column if not exists data_days int;
alter table forecasts add column if not exists confidence numeric;           -- 0..1
alter table forecasts add column if not exists method text;                  -- rules | average | trend | weekday
alter table forecasts add column if not exists trend_pct numeric;
alter table forecasts add column if not exists at_risk_qty numeric;          -- expected to spoil before use
alter table forecasts add column if not exists reorder_needed boolean not null default false;
alter table forecasts add column if not exists urgency text;                 -- ok | soon | late
create unique index if not exists uq_forecast_day on forecasts(company_id, product_id, forecast_date);

create or replace function generate_forecasts(p_force boolean default false, p_draft boolean default true)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  c bigint := _need_member();
  tz text; today date;
  pr record; b record;
  n int := 0; drafted int := 0; updated int := 0; cleared int := 0;
  w int; mean_all numeric; sd numeric; mean7 numeric; mean_prev numeric; level numeric; trend numeric;
  factors numeric[]; f_avg numeric; cum numeric[]; pred numeric; run numeric;
  on_hand numeric; incoming numeric; dts numeric; sdate date; prior numeric; consumed numeric; at_risk numeric;
  lead int; vid bigint; safety numeric; rp numeric; cover numeric; target numeric; pos numeric; qty numeric;
  rp_dyn numeric; need boolean; urg text; meth text; conf numeric; cv numeric; ucost numeric; offd int; ix int; k int;
  aid bigint; np jsonb; daily numeric[]; dsum numeric[]; dn int[];
begin
  select coalesce(nullif(timezone,''), 'Asia/Kuala_Lumpur') into tz from companies where company_id = c;
  today := (now() at time zone coalesce(tz, 'Asia/Kuala_Lumpur'))::date;

  if not p_force and exists (select 1 from forecasts where company_id = c and forecast_date = today
                              and generated_at > now() - interval '10 minutes') then
    return jsonb_build_object('skipped', true);
  end if;

  for pr in select product_id, min_stock_threshold, capacity, shelf_life_days, unit_of_measure
              from products where company_id = c and deleted_at is null order by product_id
  loop
    -- ---- stock now and incoming ------------------------------------------------
    select coalesce(sum(current_quantity), 0) into on_hand from batches
     where company_id = c and product_id = pr.product_id and status = 'active' and deleted_at is null
       and (expiry_date is null or expiry_date >= today);
    select coalesce(sum(i.quantity), 0) into incoming
      from purchase_order_items i join purchase_orders o on o.po_id = i.po_id
     where i.company_id = c and i.product_id = pr.product_id and o.status = 'ordered';

    -- ---- usage history: completed days only (today is partial) ------------------
    select least(28, greatest(0, today - min((t.created_at at time zone coalesce(tz,'Asia/Kuala_Lumpur'))::date)))::int
      into w
      from stock_transactions t join batches bb on bb.batch_id = t.batch_id
     where t.company_id = c and bb.product_id = pr.product_id and t.transaction_type = 'usage'
       and t.created_at >= now() - interval '40 days';
    w := coalesce(w, 0);

    mean_all := 0; sd := 0; mean7 := 0; mean_prev := 0; trend := null;
    factors := array[1,1,1,1,1,1,1];
    daily := '{}';
    if w > 0 then
      select array_agg(coalesce(u.q, 0) order by g) into daily
        from generate_series(1, w) g
        left join (select (t.created_at at time zone coalesce(tz,'Asia/Kuala_Lumpur'))::date dy, sum(-t.quantity_change) q
                     from stock_transactions t join batches bb on bb.batch_id = t.batch_id
                    where t.company_id = c and bb.product_id = pr.product_id and t.transaction_type = 'usage'
                      and t.created_at >= now() - interval '40 days'
                    group by 1) u on u.dy = today - g;           -- daily[k] = units used k days ago
      mean_all := (select sum(x) / w from unnest(daily) x);
      if w > 1 then sd := sqrt((select sum((x - mean_all) ^ 2) from unnest(daily) x) / (w - 1)); end if;
      mean7 := (select avg(daily[i]) from generate_series(1, least(7, w)) i);
      if w >= 14 then mean_prev := (select avg(daily[i]) from generate_series(8, 14) i); end if;
    end if;

    if w = 0 then meth := 'rules'; level := 0;
    elsif w < 7 then meth := 'average'; level := mean_all;
    elsif w < 14 then meth := 'trend'; level := 0.6 * mean7 + 0.4 * mean_all;
    else
      meth := 'weekday'; level := 0.6 * mean7 + 0.4 * mean_all;
      if mean_prev > 0 then trend := round((mean7 / mean_prev - 1) * 100, 1); end if;
      if mean_all > 0 then
        dsum := array_fill(0::numeric, array[7]); dn := array_fill(0, array[7]);
        for k in 1..w loop
          ix := extract(dow from today - k)::int + 1;
          dsum[ix] := dsum[ix] + daily[k]; dn[ix] := dn[ix] + 1;
        end loop;
        for k in 1..7 loop
          factors[k] := case when dn[k] > 0
            then least(1.8, greatest(0.5, (dn[k] * (dsum[k] / dn[k] / mean_all) + 2) / (dn[k] + 2))) else 1 end;
        end loop;
        select avg(x) into f_avg from unnest(factors) x;
        for k in 1..7 loop factors[k] := factors[k] / f_avg; end loop;
      end if;
    end if;
    level := coalesce(level, 0);

    -- ---- project 30 days (day 1 = today) -----------------------------------------
    cum := array_fill(0::numeric, array[30]);
    run := 0;
    dts := null; sdate := null;
    for k in 1..30 loop
      pred := level * factors[extract(dow from today + k - 1)::int + 1];
      if dts is null and pred > 0 and run + pred >= on_hand then
        dts := round(((k - 1) + (on_hand - run) / pred)::numeric, 1);
        sdate := today + floor(dts)::int;
      end if;
      run := run + pred;
      cum[k] := run;
    end loop;
    if on_hand <= 0 and level > 0 then dts := 0; sdate := today; end if;

    -- ---- spoilage: batches that expire before FEFO consumption reaches them -------
    at_risk := 0;
    if w >= 3 and level > 0 then
      prior := 0;
      for b in select current_quantity q, expiry_date e from batches
                where company_id = c and product_id = pr.product_id and status = 'active' and deleted_at is null
                  and current_quantity > 0 and (expiry_date is null or expiry_date >= today)
                order by expiry_date nulls last, received_date, batch_id
      loop
        offd := case when b.e is null then null else b.e - today end;
        if offd is not null and offd <= 30 then
          ix := greatest(offd, 1);
          consumed := least(b.q, greatest(0, cum[ix] - prior));
          at_risk := at_risk + (b.q - consumed);
        end if;
        prior := prior + b.q;
      end loop;
    end if;

    -- ---- reorder point, target level, suggested quantity -----------------------------
    vid := null; lead := null;
    select v.vendor_id, coalesce(v.lead_time_days, 2) into vid, lead from vendors v
     where v.company_id = c and v.vendor_id = (
       select bb.vendor_id from batches bb where bb.company_id = c and bb.product_id = pr.product_id and bb.vendor_id is not null
        order by bb.received_date desc, bb.batch_id desc limit 1);
    if vid is null then
      select v.vendor_id, coalesce(v.lead_time_days, 2) into vid, lead from vendors v where v.company_id = c order by v.vendor_id limit 1;
    end if;
    lead := least(greatest(coalesce(lead, 2), 1), 14);

    select unit_cost into ucost from batches where company_id = c and product_id = pr.product_id and unit_cost is not null
     order by received_date desc, batch_id desc limit 1;

    if level > 0 then
      safety := greatest(level * 0.5, case when w >= 7 then 1.28 * sd * sqrt(lead) else level end);
      rp_dyn := cum[lead] + safety;
      rp := greatest(rp_dyn, coalesce(pr.min_stock_threshold, 0));
      cover := least(7, greatest(2, coalesce(pr.shelf_life_days, 7) / 2.0));
      target := cum[least(30, lead + ceil(cover)::int)] + safety;
    else
      safety := 0; rp_dyn := 0;
      rp := coalesce(pr.min_stock_threshold, 0);
      target := coalesce(pr.min_stock_threshold, 0) * 2;
    end if;
    pos := greatest(0, on_hand - at_risk) + incoming;
    qty := greatest(0, target - pos);
    if pr.capacity is not null and pr.capacity > 0 then qty := least(qty, greatest(0, pr.capacity - pos)); end if;
    qty := case when pr.unit_of_measure = 'pcs' then ceil(qty) else ceil(qty * 2) / 2 end;
    -- reorder when usable stock (minus what will spoil, plus what is on order) will not cover lead time + safety,
    -- or when raw stock is at or below the level the owner set
    need := (pos <= rp_dyn or on_hand + incoming <= coalesce(pr.min_stock_threshold, 0)) and qty > 0 and vid is not null;
    urg := case when dts is not null and dts < lead then 'late' when need then 'soon' else 'ok' end;
    cv := case when mean_all > 0 then sd / mean_all else 0 end;
    conf := round((least(1, w / 14.0) * (1 - least(0.4, cv / 2)))::numeric, 2);

    insert into forecasts(company_id, product_id, forecast_date, forecast_month, predicted_demand, predicted_spoilage_pct,
                          suggested_reorder_level, model_version, estimated_purchase_cost, suggested_order_qty,
                          avg_daily_demand, on_hand, incoming_qty, days_to_stockout, stockout_date, reorder_point, safety_stock,
                          lead_time_days, vendor_id, data_days, confidence, method, trend_pct, at_risk_qty, reorder_needed, urgency, generated_at)
    values (c, pr.product_id, today, date_trunc('month', today)::date, round(cum[30], 2),
            case when on_hand > 0 then round(least(100, at_risk / on_hand * 100), 1) else 0 end,
            round(rp, 2), 'stat-v1', case when need and ucost is not null then round(qty * ucost, 2) end, case when need then qty end,
            round(level, 3), on_hand, incoming, dts, sdate, round(rp, 2), round(safety, 2),
            lead, vid, w, conf, meth, trend, round(at_risk, 2), need, urg, now())
    on conflict (company_id, product_id, forecast_date) do update set
      predicted_demand = excluded.predicted_demand, predicted_spoilage_pct = excluded.predicted_spoilage_pct,
      suggested_reorder_level = excluded.suggested_reorder_level, model_version = excluded.model_version,
      estimated_purchase_cost = excluded.estimated_purchase_cost, suggested_order_qty = excluded.suggested_order_qty,
      avg_daily_demand = excluded.avg_daily_demand, on_hand = excluded.on_hand, incoming_qty = excluded.incoming_qty,
      days_to_stockout = excluded.days_to_stockout, stockout_date = excluded.stockout_date,
      reorder_point = excluded.reorder_point, safety_stock = excluded.safety_stock, lead_time_days = excluded.lead_time_days,
      vendor_id = excluded.vendor_id, data_days = excluded.data_days, confidence = excluded.confidence, method = excluded.method,
      trend_pct = excluded.trend_pct, at_risk_qty = excluded.at_risk_qty, reorder_needed = excluded.reorder_needed,
      urgency = excluded.urgency, generated_at = excluded.generated_at;
    n := n + 1;

    -- ---- draft purchase orders: suggest only, a person approves ------------------------
    if p_draft then
      select approval_id into aid from approvals
       where company_id = c and kind = 'purchase_order' and status = 'pending'
         and exists (select 1 from jsonb_array_elements(payload->'items') i where (i->>'product_id')::bigint = pr.product_id)
       order by approval_id limit 1;
      np := jsonb_build_object('vendor_id', vid, 'auto', true, 'note', 'SmartStock forecast',
                   'items', jsonb_build_array(jsonb_build_object('product_id', pr.product_id, 'quantity', qty, 'unit_cost', ucost)),
                   'why', jsonb_build_object('days_left', dts, 'lead', lead, 'method', meth, 'data_days', w, 'urgency', urg));
      if need then
        if aid is null then
          if not exists (select 1 from approvals where company_id = c and kind = 'purchase_order' and status = 'rejected'
                            and decided_at > now() - interval '1 day' and coalesce(reason,'') not like 'auto:%'
                            and exists (select 1 from jsonb_array_elements(payload->'items') i where (i->>'product_id')::bigint = pr.product_id)) then
            insert into approvals(company_id, kind, payload, requested_by) values (c, 'purchase_order', np, null);
            drafted := drafted + 1;
          end if;
        else
          update approvals set payload = np where approval_id = aid and (payload->>'auto')::boolean is true
            and payload is distinct from np;
          if found then updated := updated + 1; end if;
        end if;
      elsif aid is not null then
        update approvals set status = 'rejected', decided_at = now(), reason = 'auto: no longer needed'
         where approval_id = aid and (payload->>'auto')::boolean is true;
        if found then cleared := cleared + 1; end if;
      end if;
    end if;
  end loop;

  return jsonb_build_object('forecasts', n, 'drafted', drafted, 'updated', updated, 'cleared', cleared);
end $$;

revoke all on function generate_forecasts(boolean, boolean) from public, anon;
grant execute on function generate_forecasts(boolean, boolean) to authenticated;
