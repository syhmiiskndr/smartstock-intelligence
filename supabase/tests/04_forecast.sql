-- LOCAL TEST ONLY. After 0002..0006 and the demo company (0003).
\set ON_ERROR_STOP off
create or replace function as_email(e text) returns void language plpgsql security definer as $$ begin
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email=e limit 1), false); end $$;
grant execute on function as_email(text) to authenticated;
set role authenticated;
select as_email('owner@smartstock.test');

\echo == 1. generate for the demo company (expect forecasts=10)
select generate_forecasts(true);
select p.product_name, f.method, f.data_days d, f.avg_daily_demand avg, f.on_hand, f.days_to_stockout dts, f.lead_time_days lead,
       f.reorder_point rp, f.at_risk_qty risk, f.reorder_needed need, f.suggested_order_qty qty, f.urgency, f.confidence conf, f.trend_pct trend
  from forecasts f join products p using (product_id) where f.forecast_date = current_date order by p.product_id;

\echo == 2. drafts are in Approvals, written by the system (requested_by null, auto=true)
select count(*) as drafts, count(*) filter (where requested_by is null and (payload->>'auto')::boolean) as auto_drafts
  from approvals where kind='purchase_order' and status='pending';

\echo == 3. running again does not duplicate (expect drafted 0)
select generate_forecasts(true);
select count(*) as drafts_after_rerun from approvals where kind='purchase_order' and status='pending';

\echo == 4. approving a draft creates the PO and the next forecast counts it as incoming (no new draft for that item)
select approval_id as a1, (payload->'items'->0->>'product_id')::bigint as pid from approvals
  where kind='purchase_order' and status='pending' order by approval_id limit 1 \gset
select decide_approval(:a1, true);
select generate_forecasts(true);
select incoming_qty, reorder_needed, urgency from forecasts where product_id = :pid and forecast_date = current_date;
select count(*) as pending_for_that_item from approvals where kind='purchase_order' and status='pending'
  and (payload->'items'->0->>'product_id')::bigint = :pid;

\echo == 5. rejecting a draft: not re-drafted for a day
select approval_id as a2, (payload->'items'->0->>'product_id')::bigint as pid2 from approvals
  where kind='purchase_order' and status='pending' order by approval_id limit 1 \gset
select decide_approval(:a2, false, 'not now');
select generate_forecasts(true);
select count(*) as pending_for_rejected_item from approvals where kind='purchase_order' and status='pending'
  and (payload->'items'->0->>'product_id')::bigint = :pid2;

\echo == 6. staff may refresh forecasts but cannot approve (expect ok, then error)
select as_email('staff@smartstock.test');
select generate_forecasts(true) is not null as staff_can_generate;
select decide_approval((select approval_id from approvals where status='pending' limit 1), true);

\echo == 7. company isolation: a different company sees none of these forecasts (expect 0)
reset role;
insert into auth.users(email) values ('other@smartstock.test');
select as_email('other@smartstock.test');
set role authenticated;
select create_company('Other Co', null, 'Other');
select count(*) as other_sees from forecasts;


\echo == 8. learning ladder in the new company (expect rules / average / trend / weekday, pcs rounded to whole numbers)
reset role;
select as_email('other@smartstock.test');
select auth_company_id() as oc \gset
insert into vendors(company_id, vendor_name, lead_time_days) values (:oc, 'V1', 2);
insert into products(company_id, sku, product_name, unit_of_measure, min_stock_threshold, shelf_life_days, capacity) values
  (:oc,'A','A rules','kg',5,7,100), (:oc,'B','B average','kg',3,7,100), (:oc,'C','C trend','kg',3,10,200), (:oc,'D','D weekday pcs','pcs',10,10,500);
set role authenticated;
select receive_stock(product_id, (select vendor_id from vendors where company_id=:oc), case sku when 'A' then 2 else 300 end, 1.5, null, null)
  from products where company_id=:oc;
-- usage: B 3 days, C 8 days, D 20 days (one row per day, moved into the past below)
select record_usage(product_id, 4) from products p, generate_series(1,3) where company_id=:oc and sku='B';
select record_usage(product_id, 5) from products p, generate_series(1,8) where company_id=:oc and sku='C';
select record_usage(product_id, 6) from products p, generate_series(1,20) where company_id=:oc and sku='D';
reset role;
with r as (select t.transaction_id, p.sku, row_number() over (partition by p.sku order by t.transaction_id) n
             from stock_transactions t join batches b using (batch_id) join products p using (product_id)
            where t.company_id=:oc and t.transaction_type='usage')
update stock_transactions t set created_at = now() - (r.n || ' days')::interval from r where r.transaction_id = t.transaction_id;
set role authenticated;
select generate_forecasts(true);
select p.sku, f.method, f.data_days, round(f.avg_daily_demand,2) avg, f.on_hand, f.days_to_stockout dts, f.reorder_needed need, f.suggested_order_qty qty
  from forecasts f join products p using (product_id) where f.company_id=:oc order by p.sku;

\echo == 9. rules method drafts from the reorder level only (A has 2 kg, level 5 -> draft 8 kg)
select payload->'items'->0->>'quantity' as qty_a, payload->'why'->>'method' as method
  from approvals where company_id=:oc and status='pending' and (payload->'items'->0->>'product_id')::bigint = (select product_id from products where sku='A' and company_id=:oc);

\echo == 10. a company with no vendor never drafts (expect 0 drafts, no error)
reset role;
select as_email('other@smartstock.test');
delete from approvals where company_id=:oc; delete from forecasts where company_id=:oc;
update batches set vendor_id=null where company_id=:oc;
delete from vendors where company_id=:oc;
set role authenticated;
select generate_forecasts(true);
select count(*) as drafts_without_vendor from approvals where company_id=:oc and status='pending';
