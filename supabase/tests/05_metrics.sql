-- LOCAL TEST ONLY. After 0002..0007 and the demo company. Checks daily_metrics() against the raw transactions.
\set ON_ERROR_STOP off
create or replace function as_email(e text) returns void language plpgsql security definer as $$ begin
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email=e limit 1), false); end $$;
grant execute on function as_email(text) to authenticated;
set role authenticated;
select as_email('owner@smartstock.test');
select reset_demo();

\echo == totals from daily_metrics equal totals from the raw table (expect t, t)
with m as (select jsonb_array_elements(daily_metrics(60)->'rows') r)
select round(sum((r->>'uq')::numeric),2) = (select round(sum(-quantity_change),2) from stock_transactions where transaction_type='usage') as usage_matches,
       round(sum((r->>'uc')::numeric),2) = (select round(sum(-t.quantity_change*b.unit_cost),2) from stock_transactions t join batches b using (batch_id) where t.transaction_type='usage') as cost_matches
  from m;

\echo == rolling the net change back from the stock value now gives a non-negative value every day (expect t)
with m as (select (r->>'d')::date d, sum((r->>'nc')::numeric) nc from (select jsonb_array_elements(daily_metrics(60)->'rows') r) z group by 1),
     v as (select d, (select coalesce(sum(current_quantity*unit_cost),0) from batches where status='active' and deleted_at is null)
                     - coalesce((select sum(nc) from m m2 where m2.d > m.d),0) as val from m)
select bool_and(val >= -0.01) as never_negative, count(*) as days_with_activity from v;

\echo == heat map: 28 days of usage land in slots (expect rows > 0 and total = usage in last 28 days)
select jsonb_array_length(daily_metrics()->'heat') > 0 as has_heat,
       (select round(sum((h->>'qty')::numeric),2) from jsonb_array_elements(daily_metrics()->'heat') h)
     = (select round(sum(-quantity_change),2) from stock_transactions where transaction_type='usage' and created_at >= now() - interval '28 days') as heat_matches;

\echo == staff can read; another company only sees its own products (expect t, then 0 foreign rows)
select as_email('staff@smartstock.test');
select jsonb_array_length(daily_metrics()->'rows') > 0 as staff_reads;
reset role;
select as_email('other@smartstock.test');
set role authenticated;
select count(*) as foreign_rows from jsonb_array_elements(daily_metrics()->'rows') r
 where (r->>'p')::bigint not in (select product_id from products);
