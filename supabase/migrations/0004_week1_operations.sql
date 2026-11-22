-- =====================================================================
-- SmartStock Intelligence — 0004 week-1 operations (ADDITIVE, safe to re-run)
-- Run AFTER 0002 (and 0003 if you want demo data).
--
--  * waste approvals: decide_approval can now approve a 'waste' request
--  * waste works on expired batches too, plus write_off_expired()
--  * cancel_purchase_order()
--  * adjust_stock(): stock count / correction with a reason
--  * refresh_alerts(): acknowledged alerts no longer come back as new ones
-- =====================================================================

-- ---------------------------------------------------------------------
-- Waste core (shared by the manual path and the approval path)
-- ---------------------------------------------------------------------
create or replace function _waste_batch(p_company bigint, p_user uuid, p_batch bigint, p_qty numeric,
                                         p_reason text, p_inspection bigint default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare b batches; tx bigint; wid bigint; cost numeric; why text;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be > 0'; end if;
  select * into b from batches where batch_id = p_batch and company_id = p_company and deleted_at is null for update;
  if not found then raise exception 'batch not found'; end if;
  if b.current_quantity < p_qty then raise exception 'batch only has % left', b.current_quantity; end if;
  cost := p_qty * coalesce(b.unit_cost, 0);
  why := case when p_reason in ('spoiled','expired','damaged') then p_reason else 'other' end;
  insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes)
    values (p_company, p_batch, p_user, 'waste', -p_qty, p_reason) returning transaction_id into tx;
  insert into waste_records(company_id, transaction_id, batch_id, user_id, inspection_id, wasted_quantity, waste_cost, wasted_reason)
    values (p_company, tx, p_batch, p_user, p_inspection, p_qty, cost, why) returning waste_id into wid;
  update batches set current_quantity = current_quantity - p_qty,
         status = case when current_quantity - p_qty <= 0 then 'depleted' else status end
   where batch_id = p_batch;
  return wid;
end $$;

-- take waste from the oldest-expiry batches first (expired batches included)
create or replace function _waste_fefo(p_company bigint, p_user uuid, p_product bigint, p_qty numeric, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare left_q numeric := p_qty; b record; take numeric; avail numeric;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be > 0'; end if;
  select coalesce(sum(current_quantity),0) into avail from batches
   where company_id = p_company and product_id = p_product and status in ('active','expired') and deleted_at is null;
  if avail < p_qty then raise exception 'not enough stock: % available, % requested', avail, p_qty; end if;
  for b in select batch_id, current_quantity from batches
            where company_id = p_company and product_id = p_product and status in ('active','expired')
              and deleted_at is null and current_quantity > 0
            order by expiry_date nulls last, received_date, batch_id for update
  loop
    exit when left_q <= 0;
    take := least(b.current_quantity, left_q);
    perform _waste_batch(p_company, p_user, b.batch_id, take, p_reason, null);
    left_q := left_q - take;
  end loop;
end $$;

create or replace function record_waste(p_batch bigint, p_qty numeric, p_reason text default null, p_inspection bigint default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); b batches; lim numeric; cost numeric;
begin
  select * into b from batches where batch_id = p_batch and company_id = c and deleted_at is null;
  if not found then raise exception 'batch not found'; end if;
  cost := coalesce(p_qty,0) * coalesce(b.unit_cost, 0);
  select waste_approval_limit into lim from company_settings where company_id = c;
  if not is_manager() and cost > coalesce(lim, 50) then
    raise exception 'waste value % is above your limit; ask an owner/admin (use request_approval)', cost;
  end if;
  return _waste_batch(c, auth.uid(), p_batch, p_qty, p_reason, p_inspection);
end $$;

-- waste of a product by quantity, FEFO; staff over the limit must go through an approval
create or replace function record_waste_product(p_product bigint, p_qty numeric, p_reason text default 'spoiled')
returns void language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); lim numeric; cost numeric;
begin
  if not exists (select 1 from products where product_id = p_product and company_id = c) then raise exception 'product not found'; end if;
  select coalesce(sum(b.current_quantity * coalesce(b.unit_cost,0)) / nullif(sum(b.current_quantity),0), 0) * coalesce(p_qty,0) into cost
    from batches b where b.company_id = c and b.product_id = p_product and b.status in ('active','expired') and b.deleted_at is null and b.current_quantity > 0;
  select waste_approval_limit into lim from company_settings where company_id = c;
  if not is_manager() and coalesce(cost,0) > coalesce(lim, 50) then
    raise exception 'waste value % is above your limit; ask an owner/admin', round(coalesce(cost,0),2);
  end if;
  perform _waste_fefo(c, auth.uid(), p_product, p_qty, p_reason);
end $$;

-- one call: write off every batch that is past its expiry date
create or replace function write_off_expired() returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); b record; n int := 0;
begin
  for b in select batch_id, current_quantity from batches
            where company_id = c and deleted_at is null and current_quantity > 0
              and status in ('active','expired') and expiry_date < current_date
            order by batch_id for update
  loop
    perform _waste_batch(c, auth.uid(), b.batch_id, b.current_quantity, 'expired', null);
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- Approvals: purchase_order (as before) and waste
-- payload for waste: {"product_id": 1, "qty": 3, "reason": "spoiled"}
-- ---------------------------------------------------------------------
create or replace function decide_approval(p_approval bigint, p_approve boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); a approvals;
begin
  select * into a from approvals where approval_id = p_approval and company_id = c for update;
  if not found then raise exception 'approval not found'; end if;
  if a.status <> 'pending' then raise exception 'already decided'; end if;
  if p_approve and a.kind = 'purchase_order' then
    perform _create_po(c, a.requested_by, (a.payload->>'vendor_id')::bigint, a.payload->'items', a.payload->>'note');
  elsif p_approve and a.kind = 'waste' then
    perform _waste_fefo(c, a.requested_by, (a.payload->>'product_id')::bigint, (a.payload->>'qty')::numeric,
                        coalesce(a.payload->>'reason', 'spoiled'));
  end if;
  update approvals set status = case when p_approve then 'approved' else 'rejected' end,
         decided_by = auth.uid(), decided_at = now(), reason = p_reason where approval_id = p_approval;
end $$;

create or replace function cancel_purchase_order(p_po bigint) returns void
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager();
begin
  update purchase_orders set status = 'cancelled' where po_id = p_po and company_id = c and status = 'ordered';
  if not found then raise exception 'order not found or already closed'; end if;
end $$;

-- ---------------------------------------------------------------------
-- Stock count: set the real quantity; the difference is recorded as 'adjust'
-- ---------------------------------------------------------------------
create or replace function adjust_stock(p_product bigint, p_counted numeric, p_reason text default 'stock count')
returns numeric language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); onhand numeric; diff numeric; left_q numeric; b record; take numeric; tgt bigint; shelf int; nb bigint;
begin
  if p_counted is null or p_counted < 0 then raise exception 'counted quantity must be 0 or more'; end if;
  select shelf_life_days into shelf from products where product_id = p_product and company_id = c and deleted_at is null;
  if not found then raise exception 'product not found'; end if;
  select coalesce(sum(current_quantity),0) into onhand from batches
   where company_id = c and product_id = p_product and status = 'active' and deleted_at is null
     and (expiry_date is null or expiry_date >= current_date);
  diff := p_counted - onhand;
  if diff = 0 then return 0; end if;
  if diff < 0 then
    left_q := -diff;
    for b in select batch_id, current_quantity from batches
              where company_id = c and product_id = p_product and status = 'active' and deleted_at is null
                and current_quantity > 0 and (expiry_date is null or expiry_date >= current_date)
              order by expiry_date nulls last, received_date, batch_id for update
    loop
      exit when left_q <= 0;
      take := least(b.current_quantity, left_q);
      insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes)
        values (c, b.batch_id, auth.uid(), 'adjust', -take, p_reason);
      update batches set current_quantity = current_quantity - take,
             status = case when current_quantity - take <= 0 then 'depleted' else status end where batch_id = b.batch_id;
      left_q := left_q - take;
    end loop;
  else
    select batch_id into tgt from batches
     where company_id = c and product_id = p_product and status = 'active' and deleted_at is null
       and (expiry_date is null or expiry_date >= current_date)
     order by received_date desc, batch_id desc limit 1;
    if tgt is null then
      insert into batches(company_id, product_id, batch_number, initial_quantity, current_quantity, received_date, expiry_date, status)
        values (c, p_product, 'ADJ' || to_char(current_date,'YYMMDD') || '-' || p_product, diff, diff, current_date,
                case when shelf is not null then current_date + shelf end, 'active')
        returning batch_id into nb;
      tgt := nb;
    else
      update batches set current_quantity = current_quantity + diff,
             initial_quantity = greatest(initial_quantity, current_quantity + diff) where batch_id = tgt;
    end if;
    insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes)
      values (c, tgt, auth.uid(), 'adjust', diff, p_reason);
  end if;
  return diff;
end $$;

-- ---------------------------------------------------------------------
-- Alerts: an acknowledged alert must not be recreated while it is still true.
-- low/out alerts are resolved (acknowledged ones too) once stock is back above the minimum.
-- ---------------------------------------------------------------------
create or replace function refresh_alerts() returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); soon int; n int := 0; k int;
begin
  select coalesce(expiring_soon_days,3) into soon from company_settings where company_id = c;
  soon := coalesce(soon, 3);

  update batches set status = 'expired'
   where company_id = c and status = 'active' and deleted_at is null and current_quantity > 0 and expiry_date < current_date;

  with onhand as (
    select p.product_id, p.min_stock_threshold,
           coalesce((select sum(current_quantity) from batches b
                      where b.product_id = p.product_id and b.status = 'active' and b.deleted_at is null
                        and (b.expiry_date is null or b.expiry_date >= current_date)), 0) q
      from products p where p.company_id = c and p.deleted_at is null)
  insert into alerts(company_id, product_id, alert_type, alert_status)
  select c, product_id, case when q <= 0 then 'out_of_stock' else 'low_stock' end, 'open'
    from onhand o
   where (q <= 0 or q < coalesce(min_stock_threshold, 0))
     and not exists (select 1 from alerts a where a.company_id = c and a.product_id = o.product_id
                        and a.alert_status in ('open','acknowledged')
                        and a.alert_type in ('low_stock','out_of_stock'));
  get diagnostics k = row_count; n := n + k;

  insert into alerts(company_id, batch_id, product_id, alert_type, alert_status)
  select c, b.batch_id, b.product_id, case when b.expiry_date < current_date then 'expired' else 'expiring_soon' end, 'open'
    from batches b
   where b.company_id = c and b.deleted_at is null and b.current_quantity > 0 and b.status in ('active','expired')
     and b.expiry_date is not null and b.expiry_date <= current_date + soon
     and not exists (select 1 from alerts a where a.batch_id = b.batch_id and a.alert_status in ('open','acknowledged')
                        and a.alert_type = case when b.expiry_date < current_date then 'expired' else 'expiring_soon' end);
  get diagnostics k = row_count; n := n + k;

  -- stock level changed class (low -> out, out -> low): close the old one so the right one shows
  update alerts a set alert_status = 'resolved'
   where a.company_id = c and a.alert_status in ('open','acknowledged') and a.alert_type in ('low_stock','out_of_stock')
     and (select coalesce(sum(current_quantity),0) from batches b
           where b.product_id = a.product_id and b.status = 'active' and b.deleted_at is null
             and (b.expiry_date is null or b.expiry_date >= current_date))
         >= coalesce((select min_stock_threshold from products p where p.product_id = a.product_id), 0);

  -- batch alerts end when the batch is empty
  update alerts a set alert_status = 'resolved'
   where a.company_id = c and a.alert_status in ('open','acknowledged') and a.alert_type in ('expiring_soon','expired')
     and not exists (select 1 from batches b where b.batch_id = a.batch_id and b.current_quantity > 0 and b.deleted_at is null);
  return n;
end $$;

create or replace function acknowledge_alerts(p_ids bigint[]) returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); n int;
begin
  update alerts set alert_status = 'acknowledged', acknowledged_by = auth.uid(), acknowledged_at = now()
   where alert_id = any(p_ids) and company_id = c and alert_status = 'open';
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon;
grant execute on function
  record_waste(bigint,numeric,text,bigint), record_waste_product(bigint,numeric,text), write_off_expired(),
  decide_approval(bigint,boolean,text), cancel_purchase_order(bigint), adjust_stock(bigint,numeric,text),
  refresh_alerts(), acknowledge_alerts(bigint[])
  to authenticated;
-- Internal helpers must NOT be callable from the browser. Supabase grants execute on new functions to
-- anon/authenticated by default, so revoke explicitly (this also closes the same gap for 0002's internals).
revoke execute on function
  _create_batch(bigint,bigint,bigint,numeric,numeric,date,uuid,text), _create_po(bigint,uuid,bigint,jsonb,text),
  _waste_batch(bigint,uuid,bigint,numeric,text,bigint), _waste_fefo(bigint,uuid,bigint,numeric,text),
  _need_member(), _need_manager(), audit_row()
  from public, anon, authenticated;
