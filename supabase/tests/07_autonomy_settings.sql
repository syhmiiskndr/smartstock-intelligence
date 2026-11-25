-- LOCAL TEST ONLY. After 0002..0009 and the demo company.
\set ON_ERROR_STOP off
create or replace function as_email(e text) returns void language plpgsql security definer as $$ begin
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email=e limit 1), false); end $$;
grant execute on function as_email(text) to authenticated;
set role authenticated;
select as_email('owner@smartstock.test');
select reset_demo();
select generate_forecasts(true);

\echo == 1. default is draft: drafts waiting, nothing placed
select autonomy, auto_order_limit, auto_order_daily_cap from company_settings;
select count(*) as pending_auto_drafts from approvals where kind='purchase_order' and status='pending' and (payload->>'auto')::boolean is true;
select count(*) as ai_placed from purchase_orders where note = 'SmartStock auto-order';

\echo == 2. only the owner can change rules; bad keys and values are refused (expect 5 errors)
select as_email('admin@smartstock.test');
select update_settings('{"autonomy":"auto"}');
select as_email('staff@smartstock.test');
select update_settings('{"low_alert":false}');
update company_settings set autonomy = 'auto';
select as_email('owner@smartstock.test');
select update_settings('{"nonsense":1}');
select update_settings('{"autonomy":"yolo"}');
select update_settings('{"auto_order_limit":-5}');
select update_settings('{"expiring_soon_days":99}');
select autonomy from company_settings;

\echo == 3. suggest only: existing AI drafts are withdrawn, none are created
select update_settings('{"autonomy":"suggest"}');
select count(*) as pending_after_suggest from approvals where kind='purchase_order' and status='pending' and (payload->>'auto')::boolean is true;
select generate_forecasts(true);
select count(*) as still_none from approvals where kind='purchase_order' and status='pending' and (payload->>'auto')::boolean is true;
select count(*) as forecasts_still_made from forecasts where forecast_date = current_date;

\echo == 4. back to draft: drafts return
select update_settings('{"autonomy":"draft"}');
select generate_forecasts(true);
select count(*) as pending_again from approvals where kind='purchase_order' and status='pending' and (payload->>'auto')::boolean is true;

\echo == 5. auto with a tiny per-order limit places nothing; a tiny daily cap places nothing
select update_settings('{"autonomy":"auto","auto_order_limit":0.5}');
select count(*) as placed_limit_tiny from purchase_orders where note = 'SmartStock auto-order';
select update_settings('{"auto_order_limit":100000,"auto_order_daily_cap":0}');
select count(*) as placed_cap_zero from purchase_orders where note = 'SmartStock auto-order';

\echo == 6. auto inside the limits: orders are placed, as SmartStock AI, once only (staff opening the app triggers it)
select update_settings('{"auto_order_limit":100000,"auto_order_daily_cap":100000}');
select count(*) as placed from purchase_orders where note = 'SmartStock auto-order';
select count(*) as approvals_marked from approvals where (payload->>'auto_placed')::boolean is true and status = 'approved';
select count(*) as unpriced_or_novendor_left from approvals where kind='purchase_order' and status='pending' and (payload->>'auto')::boolean is true;
select as_email('staff@smartstock.test');
select generate_forecasts(true);
select as_email('owner@smartstock.test');
select count(*) as placed_same_after_rerun from purchase_orders where note = 'SmartStock auto-order';
select count(*) filter (where who = 'SmartStock AI') as ai_events_in_feed from (select (e->>'who') who from jsonb_array_elements(audit_feed(200)) e where e->>'table' in ('purchase_orders','approvals')) x;

\echo == 7. daily cap: total auto spend stays within it
select reset_demo();
select update_settings('{"autonomy":"draft"}');
select generate_forecasts(true);
select update_settings('{"autonomy":"auto","auto_order_limit":100000,"auto_order_daily_cap":60}');
select coalesce(sum(i.quantity * i.unit_cost), 0) <= 60 as spend_within_cap, count(distinct o.po_id) as pos
  from purchase_orders o join purchase_order_items i on i.po_id = o.po_id where o.note = 'SmartStock auto-order';

\echo == 8. alert switches
select reset_demo();
reset role; delete from alerts; set role authenticated;
select update_settings('{"low_alert":false,"expiry_alert":false}');
select refresh_alerts() as new_alerts_when_off;
select update_settings('{"low_alert":true,"expiry_alert":true}');
select refresh_alerts() > 0 as new_alerts_when_on;
