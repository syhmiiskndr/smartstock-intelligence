-- =====================================================================
-- SmartStock Intelligence — 0008 real tasks + audit feed (safe to re-run). Run AFTER 0007.
--
-- Tasks
--   generate_tasks()   builds today's task list from the stock itself and closes tasks that no longer apply:
--                      use-first (expiring), spoilage risk (forecast), low stock, deliveries to receive,
--                      expired stock to remove, approvals to review (managers only)
--   complete_task()    tick / untick. Staff: tasks assigned to them or to everyone. Managers: any task
--   create_task()      managers add their own task (optionally for one person, with a due date)
--   cancel_task()      managers remove a task
--   Tasks can no longer be written straight from the browser; everything goes through these functions.
--
-- Audit
--   audit_feed()       managers only: one list of who did what — stock movements, catalogue / supplier /
--                      order / approval / rule changes (audit_logs) and completed tasks, newest first.
-- =====================================================================

alter table tasks add column if not exists kind text not null default 'manual';   -- manual | use_first | spoil | low | receive | expired | review
alter table tasks add column if not exists audience text not null default 'all';  -- all | manager
alter table tasks add column if not exists priority text not null default 'normal'; -- normal | high
alter table tasks add column if not exists source_key text;
alter table tasks add column if not exists product_id bigint;
alter table tasks add column if not exists data jsonb not null default '{}'::jsonb;
alter table tasks add column if not exists done_by uuid;
alter table tasks add column if not exists done_at timestamptz;
alter table tasks add column if not exists auto_closed boolean not null default false;
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks add constraint tasks_status_check check (status in ('open','done','cancelled'));
create unique index if not exists uq_tasks_source on tasks(company_id, source_key) where source_key is not null;
create index if not exists idx_tasks_open on tasks(company_id, status, created_at);

-- tasks are changed only through the functions below
drop policy if exists tasks_write on tasks;
revoke insert, update, delete on tasks from authenticated;

create or replace function _put_task(c bigint, k text, p_kind text, p_title text, p_prio text, p_aud text, pid bigint, d jsonb, due date)
returns void language sql security definer set search_path = public as $$
  insert into tasks(company_id, title, kind, source_key, priority, audience, product_id, data, due_date, created_by)
  values (c, p_title, p_kind, k, p_prio, p_aud, pid, coalesce(d, '{}'), due, auth.uid())
  on conflict (company_id, source_key) where source_key is not null do nothing
$$;
revoke all on function _put_task(bigint, text, text, text, text, text, bigint, jsonb, date) from public, anon, authenticated;

create or replace function generate_tasks() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  c bigint := _need_member(); tz text; today date; soon int; keys text[] := array[]::text[]; r record; k text; closed int := 0; n int;
begin
  select coalesce(nullif(timezone,''), 'Asia/Kuala_Lumpur') into tz from companies where company_id = c;
  today := (now() at time zone coalesce(tz, 'Asia/Kuala_Lumpur'))::date;
  select coalesce(expiring_soon_days, 3) into soon from company_settings where company_id = c;
  soon := coalesce(soon, 3);

  -- 1. use first: stock expiring within the alert window
  for r in select p.product_id pid, p.product_name nm, p.unit_of_measure u, min(b.expiry_date) exp, sum(b.current_quantity) q
             from batches b join products p on p.product_id = b.product_id
            where b.company_id = c and b.status = 'active' and b.deleted_at is null and p.deleted_at is null
              and b.current_quantity > 0 and b.expiry_date >= today and b.expiry_date <= today + soon
            group by 1, 2, 3
  loop
    k := 'use:' || r.pid || ':' || r.exp; keys := keys || k;
    perform _put_task(c, k, 'use_first', 'Use first: ' || r.nm, case when r.exp - today <= 1 then 'high' else 'normal' end, 'all', r.pid,
                      jsonb_build_object('qty', r.q, 'days', r.exp - today), r.exp);
  end loop;

  -- 2. spoilage risk from today's forecast
  for r in select f.product_id pid, p.product_name nm, f.at_risk_qty q
             from forecasts f join products p on p.product_id = f.product_id
            where f.company_id = c and f.forecast_date = today and p.deleted_at is null and f.method <> 'rules' and f.at_risk_qty >= 1 and f.predicted_spoilage_pct >= 10
  loop
    k := 'spoil:' || r.pid || ':' || today; keys := keys || k;
    perform _put_task(c, k, 'spoil', 'Move or promote: ' || r.nm, 'normal', 'all', r.pid, jsonb_build_object('qty', r.q), today);
  end loop;

  -- 3. low stock (at or below the reorder level, usable stock only)
  for r in select p.product_id pid, p.product_name nm, p.min_stock_threshold lv,
                  coalesce((select sum(b.current_quantity) from batches b where b.product_id = p.product_id and b.status = 'active'
                              and b.deleted_at is null and (b.expiry_date is null or b.expiry_date >= today)), 0) q
             from products p where p.company_id = c and p.deleted_at is null and coalesce(p.min_stock_threshold, 0) > 0
  loop
    continue when r.q > r.lv;
    k := 'low:' || r.pid || ':' || today; keys := keys || k;
    perform _put_task(c, k, 'low', 'Check stock: ' || r.nm, case when r.q <= 0 then 'high' else 'normal' end, 'all', r.pid,
                      jsonb_build_object('qty', r.q, 'level', r.lv), today);
  end loop;

  -- 4. deliveries due (expected today or earlier)
  for r in select o.po_id, v.vendor_name vn, o.expected_date ed
             from purchase_orders o left join vendors v on v.vendor_id = o.vendor_id
            where o.company_id = c and o.status = 'ordered' and o.expected_date is not null and o.expected_date <= today
  loop
    k := 'receive:' || r.po_id; keys := keys || k;
    perform _put_task(c, k, 'receive', 'Receive delivery PO #' || r.po_id, case when r.ed < today then 'high' else 'normal' end, 'all', null,
                      jsonb_build_object('po', r.po_id, 'vendor', r.vn, 'late', today - r.ed), r.ed);
  end loop;

  -- 5. expired stock still on the shelf
  for r in select p.product_id pid, p.product_name nm, sum(b.current_quantity) q
             from batches b join products p on p.product_id = b.product_id
            where b.company_id = c and b.status = 'active' and b.deleted_at is null and b.current_quantity > 0 and b.expiry_date < today
            group by 1, 2
  loop
    k := 'expired:' || r.pid || ':' || today; keys := keys || k;
    perform _put_task(c, k, 'expired', 'Remove expired: ' || r.nm, 'high', 'all', r.pid, jsonb_build_object('qty', r.q), today);
  end loop;

  -- 6. approvals waiting (managers)
  select count(*) into n from approvals where company_id = c and status = 'pending';
  if n > 0 then
    k := 'review:' || today; keys := keys || k;
    perform _put_task(c, k, 'review', 'Review approvals', 'normal', 'manager', null, jsonb_build_object('n', n), today);
    update tasks set data = jsonb_build_object('n', n) where company_id = c and source_key = k and status = 'open';
  end if;

  -- close automatic tasks whose reason is gone (the stock was used, delivery received, ...)
  update tasks set status = 'done', done_at = now(), auto_closed = true
   where company_id = c and kind <> 'manual' and status = 'open' and source_key <> all(keys);
  get diagnostics closed = row_count;
  return jsonb_build_object('open', (select count(*) from tasks where company_id = c and status = 'open'), 'auto_closed', closed);
end $$;

create or replace function complete_task(p_task bigint, p_done boolean default true) returns void
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); t tasks;
begin
  select * into t from tasks where task_id = p_task and company_id = c;
  if not found then raise exception 'task not found'; end if;
  if t.status = 'cancelled' then raise exception 'task was cancelled'; end if;
  if not is_manager() then
    if t.audience = 'manager' then raise exception 'not allowed'; end if;
    if t.assigned_to is not null and t.assigned_to <> auth.uid() then raise exception 'this task is assigned to someone else'; end if;
  end if;
  if p_done then update tasks set status = 'done', done_by = auth.uid(), done_at = now(), auto_closed = false where task_id = p_task;
  else update tasks set status = 'open', done_by = null, done_at = null where task_id = p_task; end if;
end $$;

create or replace function create_task(p_title text, p_assigned uuid default null, p_due date default null, p_priority text default 'normal')
returns bigint language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); id bigint; ttl text := btrim(coalesce(p_title, ''));
begin
  if char_length(ttl) < 1 or char_length(ttl) > 120 then raise exception 'task title must be 1 to 120 characters'; end if;
  if p_assigned is not null and not exists (select 1 from profiles where user_id = p_assigned and company_id = c and coalesce(is_active, true)) then
    raise exception 'that person is not in this company';
  end if;
  insert into tasks(company_id, title, kind, priority, audience, assigned_to, due_date, created_by)
  values (c, ttl, 'manual', case when p_priority = 'high' then 'high' else 'normal' end, 'all', p_assigned, p_due, auth.uid())
  returning task_id into id;
  return id;
end $$;

create or replace function cancel_task(p_task bigint) returns void
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager();
begin
  update tasks set status = 'cancelled' where task_id = p_task and company_id = c and status = 'open';
  if not found then raise exception 'task not found or already closed'; end if;
end $$;

-- ---------------------------------------------------------------------
-- audit feed (managers only), newest first, paged with p_before
-- ---------------------------------------------------------------------
create or replace function audit_feed(p_limit int default 60, p_before timestamptz default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c bigint := _need_manager(); lim int := least(greatest(coalesce(p_limit, 60), 1), 200);
begin
  return coalesce((
    select jsonb_agg(x.e order by x.ts desc) from (select u.ts, u.e from (
      select * from (
        select t.created_at ts, jsonb_build_object('at', t.created_at, 'uid', t.user_id, 'who', coalesce(pf.full_name, 'System'), 'src', 'stock',
               'type', t.transaction_type, 'qty', abs(t.quantity_change), 'unit', p.unit_of_measure, 'product', p.product_name, 'pid', p.product_id) e
          from stock_transactions t join batches b on b.batch_id = t.batch_id join products p on p.product_id = b.product_id
          left join profiles pf on pf.user_id = t.user_id
         where t.company_id = c and (p_before is null or t.created_at < p_before)
         order by t.created_at desc limit lim) s
      union all
      select * from (
        select al.created_at ts, jsonb_build_object('at', al.created_at, 'uid', al.user_id,
               'who', coalesce(pf.full_name, case when al.user_id is null then 'SmartStock AI' else 'Former member' end), 'src', 'audit',
               'table', al.table_name, 'action', al.action, 'id', al.record_id,
               'name', coalesce(al.new_value->>'product_name', al.old_value->>'product_name', al.new_value->>'vendor_name', al.old_value->>'vendor_name'),
               'data', case when al.table_name in ('approvals', 'purchase_orders', 'stock_in_requests') then coalesce(al.new_value, al.old_value) end,
               'changes', case when al.action = 'UPDATE' then (
                   select jsonb_object_agg(n.key, jsonb_build_object('old', o.value, 'new', n.value))
                     from jsonb_each(al.new_value) n join jsonb_each(al.old_value) o on o.key = n.key
                    where n.value is distinct from o.value
                      and n.key not in ('updated_at', 'created_at', 'generated_at', 'decided_at', 'received_at', 'reviewed_at')) end) e
          from audit_logs al left join profiles pf on pf.user_id = al.user_id
         where al.company_id = c and (p_before is null or al.created_at < p_before)
           and al.table_name in ('products', 'vendors', 'purchase_orders', 'approvals', 'company_settings', 'stock_in_requests')
           and (al.action <> 'UPDATE' or exists (
                 select 1 from jsonb_each(al.new_value) n join jsonb_each(al.old_value) o on o.key = n.key
                  where n.value is distinct from o.value
                    and n.key not in ('updated_at', 'created_at', 'generated_at', 'decided_at', 'received_at', 'reviewed_at')))
         order by al.created_at desc limit lim) a
      union all
      select * from (
        select k.done_at ts, jsonb_build_object('at', k.done_at, 'uid', k.done_by, 'who', coalesce(pf.full_name, 'System'), 'src', 'task',
               'kind', k.kind, 'title', k.title, 'pid', k.product_id, 'product', p.product_name) e
          from tasks k left join profiles pf on pf.user_id = k.done_by left join products p on p.product_id = k.product_id
         where k.company_id = c and k.status = 'done' and k.done_by is not null and k.done_at is not null
           and (p_before is null or k.done_at < p_before)
         order by k.done_at desc limit lim) tk
    ) u order by u.ts desc limit lim) x
  ), '[]'::jsonb);
end $$;

revoke all on function generate_tasks(), complete_task(bigint, boolean), create_task(text, uuid, date, text), cancel_task(bigint),
                       audit_feed(int, timestamptz) from public, anon;
grant execute on function generate_tasks(), complete_task(bigint, boolean), create_task(text, uuid, date, text), cancel_task(bigint),
                          audit_feed(int, timestamptz) to authenticated;
