-- =====================================================================
-- SmartStock Intelligence — 0007 real daily numbers for charts (ADDITIVE, safe to re-run). Run AFTER 0006.
--
-- daily_metrics(p_days) returns one JSON document for the caller's company:
--   today : today's date in the company's timezone
--   rows  : per day and product: units used, cost of usage, cost of waste, net stock value change
--   heat  : units used by weekday (0 = Sunday) and time slot over the last 28 days
--           slots: 0 morning (before 11), 1 lunch (11-14), 2 afternoon (14-18), 3 evening (18 onwards)
-- The app builds every chart (Cost, Analytics, item history, heat map) from this, so no numbers are invented.
-- =====================================================================
create or replace function daily_metrics(p_days int default 60) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c bigint := _need_member(); tz text; d int := least(greatest(coalesce(p_days, 60), 1), 120);
begin
  select coalesce(nullif(timezone, ''), 'Asia/Kuala_Lumpur') into tz from companies where company_id = c;
  tz := coalesce(tz, 'Asia/Kuala_Lumpur');
  return jsonb_build_object(
    'today', (now() at time zone tz)::date,
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('d', x.dy, 'p', x.pid, 'uq', x.uq, 'uc', x.uc, 'wc', x.wc, 'nc', x.nc) order by x.dy, x.pid)
        from (select (t.created_at at time zone tz)::date dy, b.product_id pid,
                     round(coalesce(sum(-t.quantity_change) filter (where t.transaction_type = 'usage'), 0), 3) uq,
                     round(coalesce(sum(-t.quantity_change * coalesce(b.unit_cost, 0)) filter (where t.transaction_type = 'usage'), 0), 2) uc,
                     round(coalesce(sum(-t.quantity_change * coalesce(b.unit_cost, 0)) filter (where t.transaction_type = 'waste'), 0), 2) wc,
                     round(coalesce(sum(t.quantity_change * coalesce(b.unit_cost, 0)), 0), 2) nc
                from stock_transactions t join batches b on b.batch_id = t.batch_id
               where t.company_id = c and t.created_at >= now() - make_interval(days => d)
               group by 1, 2) x), '[]'::jsonb),
    'heat', coalesce((
      select jsonb_agg(jsonb_build_object('dow', h.dw, 'slot', h.sl, 'qty', h.q))
        from (select extract(dow from t.created_at at time zone tz)::int dw,
                     case when extract(hour from t.created_at at time zone tz) < 11 then 0
                          when extract(hour from t.created_at at time zone tz) < 14 then 1
                          when extract(hour from t.created_at at time zone tz) < 18 then 2 else 3 end sl,
                     round(sum(-t.quantity_change), 2) q
                from stock_transactions t
               where t.company_id = c and t.transaction_type = 'usage' and t.created_at >= now() - interval '28 days'
               group by 1, 2) h), '[]'::jsonb));
end $$;

revoke all on function daily_metrics(int) from public, anon;
grant execute on function daily_metrics(int) to authenticated;
