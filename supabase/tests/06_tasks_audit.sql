-- LOCAL TEST ONLY. After 0002..0008 and the demo company.
\set ON_ERROR_STOP off
create or replace function as_email(e text) returns void language plpgsql security definer as $$ begin
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email=e limit 1), false); end $$;
grant execute on function as_email(text) to authenticated;
set role authenticated;
select as_email('owner@smartstock.test');
select reset_demo();
select generate_forecasts(true);

\echo == 1. generate tasks (expect open > 0), then again: no duplicates
select generate_tasks();
select count(*) as n1 from tasks;
select generate_tasks();
select count(*) as n2_same_as_n1 from tasks;
select kind, priority, audience, count(*) from tasks where status='open' group by 1,2,3 order by 1,2;

\echo == 2. staff: sees tasks, completes an everyone-task, cannot complete a manager task or write directly
select as_email('staff@smartstock.test');
select complete_task((select task_id from tasks where status='open' and audience='all' order by task_id limit 1));
select count(*) as done_by_staff from tasks where status='done' and done_by is not null;
select complete_task((select task_id from tasks where audience='manager' limit 1));
insert into tasks(company_id, title) values (auth_company_id(), 'sneaky');
update tasks set title = 'x';

\echo == 3. staff cannot create or cancel tasks, cannot read the audit feed (expect 3 errors)
select create_task('Wash crates');
select cancel_task((select task_id from tasks where status='open' limit 1));
select audit_feed();

\echo == 4. manager adds a task for staff; staff may tick it; another staff-assigned task cannot be ticked by someone else
select as_email('admin@smartstock.test');
select create_task('Wipe the display shelves', (select user_id from profiles where email='staff@smartstock.test'), current_date, 'high') as manual_id \gset
select title, kind, priority, assigned_to is not null as assigned from tasks where task_id = :manual_id;
select create_task('   ');
select create_task('x', '00000000-0000-0000-0000-000000000000');
select as_email('owner@smartstock.test');
select complete_task(:manual_id);   -- manager may complete any task
select status, done_by is not null from tasks where task_id = :manual_id;
select complete_task(:manual_id, false);
select status from tasks where task_id = :manual_id;
select cancel_task(:manual_id);
select status from tasks where task_id = :manual_id;

\echo == 5. tasks close themselves when the reason is gone (use up the first expiring item, expect auto_closed)
reset role;
update batches set current_quantity = 0, status = 'depleted' where expiry_date between current_date and current_date + 3;
set role authenticated;
select as_email('owner@smartstock.test');
select generate_tasks();
select count(*) filter (where auto_closed) as auto_closed from tasks;
select count(*) as use_first_still_open from tasks where kind='use_first' and status='open';

\echo == 6. audit feed (owner): has stock, audit and task events, newest first, paging works
select as_email('owner@smartstock.test');
select record_usage((select product_id from products where sku='FR-APL'), 1);
select jsonb_array_length(audit_feed(200)) as events;
select e->>'src' src, count(*) from jsonb_array_elements(audit_feed(200)) e group by 1 order by 1;
select (audit_feed(3)->0->>'at')::timestamptz >= (audit_feed(3)->2->>'at')::timestamptz as newest_first;
select jsonb_array_length(audit_feed(5, (audit_feed(5)->4->>'at')::timestamptz)) as page2_rows;
select e->>'who' who, e->>'type' type, e->>'qty' qty, e->>'product' product from jsonb_array_elements(audit_feed(3)) e limit 1;

\echo == 7. changing an item shows what changed (old and new)
update products set min_stock_threshold = 99 where sku = 'FR-APL';
select e->'changes' from jsonb_array_elements(audit_feed(10)) e where e->>'table'='products' and e->>'action'='UPDATE' limit 1;

\echo == 8. company isolation (expect 0 rows from our company)
reset role;
select as_email('other@smartstock.test');
set role authenticated;
select count(*) as foreign_events from jsonb_array_elements(audit_feed(200)) e where e->>'product' in (select product_name from products where company_id <> auth_company_id());
select count(*) as foreign_tasks from tasks where company_id <> auth_company_id();
