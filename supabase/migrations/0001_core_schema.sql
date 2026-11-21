-- SmartStock Intelligence: core schema v1 (proposal, review against the team's existing Supabase before running)
-- Multi-company (tenant) isolation by company_id, roles owner/admin/staff enforced by Row Level Security.
-- Stock is never stored as a number: it is the sum of the stock_movements ledger (view product_stock).
-- Run in the Supabase SQL editor on a DEV project first. Safe to re-run (idempotent where possible).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tenants and people
create table if not exists public.companies (
  company_id  uuid primary key default gen_random_uuid(),
  name        text not null,
  industry    text not null default 'general' check (industry in ('fnb','retail','warehouse','manufacturing','general')),
  currency    text not null default 'MYR',
  timezone    text not null default 'Asia/Kuala_Lumpur',
  logo_url    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  role        text not null default 'staff' check (role in ('owner','admin','staff')),
  full_name   text not null default '',
  can_see_finance boolean not null default false,   -- owner always sees finance; admin only if the owner allows it
  created_at  timestamptz not null default now()
);
create index if not exists profiles_company_idx on public.profiles(company_id);

create table if not exists public.company_settings (   -- the Rules page
  company_id        uuid primary key references public.companies(company_id) on delete cascade,
  low_stock_alert   boolean not null default true,
  expiry_alert      boolean not null default true,
  anomaly_alert     boolean not null default true,
  confirm_ai_actions boolean not null default true,
  writeoff_limit    numeric(12,2) not null default 15,
  admin_sees_finance boolean not null default false
);

create table if not exists public.locations (
  location_id uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  name        text not null,
  address     text
);
create index if not exists locations_company_idx on public.locations(company_id);

-- ---------------------------------------------------------------- catalogue
create table if not exists public.suppliers (
  supplier_id uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  name        text not null,
  contact     text,
  lead_time_days int not null default 2 check (lead_time_days >= 0),
  unique (company_id, name)
);

create table if not exists public.products (
  product_id  uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  location_id uuid references public.locations(location_id) on delete set null,
  supplier_id uuid references public.suppliers(supplier_id) on delete set null,
  sku         text,
  name        text not null,
  name_ms     text,
  unit        text not null default 'kg',
  category    text,
  reorder_level numeric(12,2) not null default 0,   -- "minimum stock"
  capacity    numeric(12,2),                         -- for the stock tile fill
  shelf_life_days int,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (company_id, sku)
);
create index if not exists products_company_idx on public.products(company_id);

-- unit cost lives in its own table so RLS can hide money from roles without finance permission
create table if not exists public.product_costs (
  product_id  uuid primary key references public.products(product_id) on delete cascade,
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  unit_cost   numeric(12,4) not null default 0
);

create table if not exists public.batches (          -- one row per delivery, carries the expiry date
  batch_id    uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  product_id  uuid not null references public.products(product_id) on delete cascade,
  received_qty numeric(12,2) not null,
  expiry_date date,
  received_at timestamptz not null default now()
);
create index if not exists batches_product_idx on public.batches(product_id);

-- ---------------------------------------------------------------- ledger (single source of truth)
create table if not exists public.stock_movements (
  movement_id bigint generated always as identity primary key,
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  product_id  uuid not null references public.products(product_id) on delete restrict,
  batch_id    uuid references public.batches(batch_id) on delete set null,
  type        text not null check (type in ('receive','usage','waste','adjust')),
  qty         numeric(12,2) not null check (qty <> 0),   -- always positive for receive/usage/waste; signed for adjust
  note        text,
  source      text not null default 'manual' check (source in ('manual','voice','import','ai','system')),
  created_by  uuid not null default auth.uid() references auth.users(id),
  created_at  timestamptz not null default now()
);
create index if not exists movements_product_idx on public.stock_movements(product_id, created_at desc);
create index if not exists movements_company_idx on public.stock_movements(company_id, created_at desc);

create or replace view public.product_stock with (security_invoker = true) as
  select p.product_id, p.company_id,
         coalesce(sum(case m.type when 'receive' then m.qty when 'usage' then -m.qty when 'waste' then -m.qty else m.qty end), 0) as qty
  from public.products p left join public.stock_movements m on m.product_id = p.product_id
  group by p.product_id, p.company_id;

-- ---------------------------------------------------------------- purchasing and approvals
create table if not exists public.purchase_orders (
  po_id       uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  po_no       bigint generated always as identity,
  supplier_id uuid not null references public.suppliers(supplier_id),
  status      text not null default 'pending_approval'
              check (status in ('draft','pending_approval','sent','confirmed','delivered','received','rejected','cancelled')),
  requested_by uuid not null default auth.uid() references auth.users(id),
  approved_by uuid references auth.users(id),
  expected_date date,
  created_at  timestamptz not null default now()
);
create table if not exists public.purchase_order_items (
  po_id       uuid not null references public.purchase_orders(po_id) on delete cascade,
  product_id  uuid not null references public.products(product_id),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  qty         numeric(12,2) not null check (qty > 0),
  unit_cost   numeric(12,4),
  primary key (po_id, product_id)
);

create table if not exists public.approvals (       -- anything that needs a human decision
  approval_id uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  kind        text not null check (kind in ('purchase','write_off')),
  po_id       uuid references public.purchase_orders(po_id) on delete cascade,
  product_id  uuid references public.products(product_id),
  qty         numeric(12,2),
  amount      numeric(12,2) not null default 0,
  reason      text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_by uuid not null default auth.uid() references auth.users(id),
  decided_by  uuid references auth.users(id),
  decided_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  task_id     uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  title       text not null,
  title_ms    text,
  assigned_to uuid references auth.users(id),
  due_time    time,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.audit_log (        -- append only: nobody can update or delete
  audit_id    bigint generated always as identity primary key,
  company_id  uuid not null references public.companies(company_id) on delete cascade,
  actor_id    uuid references auth.users(id),
  actor_role  text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  via         text not null default 'manual' check (via in ('manual','voice','ai','system')),
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_company_idx on public.audit_log(company_id, created_at desc);

-- ---------------------------------------------------------------- helpers used by the policies
create or replace function public.auth_company_id() returns uuid
language sql stable security definer set search_path = public as
$$ select company_id from public.profiles where user_id = auth.uid() $$;

create or replace function public.auth_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where user_id = auth.uid() $$;

create or replace function public.can_see_finance() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select p.role = 'owner'
                           or (p.role = 'admin' and (p.can_see_finance
                               or coalesce((select s.admin_sees_finance from public.company_settings s where s.company_id = p.company_id), false)))
                    from public.profiles p where p.user_id = auth.uid()), false) $$;

create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.auth_role() in ('owner','admin'), false) $$;

-- ---------------------------------------------------------------- Row Level Security
do $$
declare t text;
begin
  foreach t in array array['companies','profiles','company_settings','locations','suppliers','products','product_costs','batches',
                           'stock_movements','purchase_orders','purchase_order_items','approvals','tasks','audit_log']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

-- helper to (re)create a policy without errors on re-run
create or replace function public._pol(p_name text, p_table text, p_cmd text, p_using text, p_check text default null) returns void
language plpgsql as $$
begin
  execute format('drop policy if exists %I on public.%I', p_name, p_table);
  execute format('create policy %I on public.%I for %s to authenticated %s %s', p_name, p_table, p_cmd,
                 case when p_using is not null then 'using ('||p_using||')' else '' end,
                 case when p_check is not null then 'with check ('||p_check||')' else '' end);
end $$;

-- every table: you only ever see rows of your own company
select public._pol('companies_read','companies','select','company_id = public.auth_company_id()');
select public._pol('companies_owner_update','companies','update','company_id = public.auth_company_id() and public.auth_role() = ''owner''','company_id = public.auth_company_id()');
select public._pol('profiles_read','profiles','select','company_id = public.auth_company_id()');
select public._pol('profiles_self_update','profiles','update','user_id = auth.uid() or (company_id = public.auth_company_id() and public.auth_role() = ''owner'')','company_id = public.auth_company_id()');
select public._pol('settings_read','company_settings','select','company_id = public.auth_company_id()');
select public._pol('settings_owner_write','company_settings','update','company_id = public.auth_company_id() and public.auth_role() = ''owner''','company_id = public.auth_company_id()');

-- catalogue: everyone reads, owner and admin write
do $$
declare t text;
begin
  foreach t in array array['locations','suppliers','products','batches']
  loop
    perform public._pol(t||'_read', t, 'select', 'company_id = public.auth_company_id()');
    perform public._pol(t||'_manager_insert', t, 'insert', null, 'company_id = public.auth_company_id() and public.is_manager()');
    perform public._pol(t||'_manager_update', t, 'update', 'company_id = public.auth_company_id() and public.is_manager()', 'company_id = public.auth_company_id()');
    perform public._pol(t||'_manager_delete', t, 'delete', 'company_id = public.auth_company_id() and public.is_manager()');
  end loop;
end $$;
-- staff can also log a delivery batch when receiving stock
select public._pol('batches_staff_insert','batches','insert',null,'company_id = public.auth_company_id()');

-- money is hidden unless the role has finance permission
select public._pol('costs_read','product_costs','select','company_id = public.auth_company_id() and public.can_see_finance()');
select public._pol('costs_manager_write','product_costs','all','company_id = public.auth_company_id() and public.is_manager()','company_id = public.auth_company_id() and public.is_manager()');

-- ledger: any signed-in member can add a movement as themselves; nobody can edit or delete history
select public._pol('movements_read','stock_movements','select','company_id = public.auth_company_id()');
select public._pol('movements_insert','stock_movements','insert',null,'company_id = public.auth_company_id() and created_by = auth.uid() and (type <> ''adjust'' or public.is_manager())');

-- purchasing
select public._pol('po_read','purchase_orders','select','company_id = public.auth_company_id()');
select public._pol('po_manager_insert','purchase_orders','insert',null,'company_id = public.auth_company_id() and public.is_manager() and requested_by = auth.uid()');
select public._pol('poi_read','purchase_order_items','select','company_id = public.auth_company_id()');
select public._pol('poi_manager_insert','purchase_order_items','insert',null,'company_id = public.auth_company_id() and public.is_manager()');
select public._pol('approvals_read','approvals','select','company_id = public.auth_company_id() and public.is_manager()');
select public._pol('approvals_insert','approvals','insert',null,'company_id = public.auth_company_id() and requested_by = auth.uid() and status = ''pending''');
select public._pol('tasks_read','tasks','select','company_id = public.auth_company_id()');
select public._pol('tasks_manager_write','tasks','insert',null,'company_id = public.auth_company_id() and public.is_manager()');
select public._pol('tasks_update','tasks','update','company_id = public.auth_company_id() and (public.is_manager() or assigned_to = auth.uid())','company_id = public.auth_company_id()');
select public._pol('audit_read','audit_log','select','company_id = public.auth_company_id() and public.is_manager()');
-- audit_log has no insert/update/delete policy for clients: rows are written by the triggers and functions below.

-- stop role escalation: only the owner can change role / company / finance flag
create or replace function public.profiles_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.company_id is distinct from old.company_id or new.can_see_finance is distinct from old.can_see_finance)
     and coalesce(public.auth_role(), '') <> 'owner' then
    raise exception 'Only the owner can change role, company or finance access';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.profiles_guard();

-- ---------------------------------------------------------------- audit trail written by the database itself
create or replace function public.audit(p_company uuid, p_action text, p_entity text, p_entity_id text, p_via text, p_detail jsonb)
returns void language sql security definer set search_path = public as
$$ insert into public.audit_log(company_id, actor_id, actor_role, action, entity, entity_id, via, detail)
   values (p_company, auth.uid(), public.auth_role(), p_action, p_entity, p_entity_id, coalesce(p_via,'manual'), coalesce(p_detail,'{}'::jsonb)) $$;

create or replace function public.trg_movement_audit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.audit(new.company_id, new.type, 'stock_movement', new.movement_id::text,
    case new.source when 'voice' then 'voice' when 'ai' then 'ai' when 'system' then 'system' else 'manual' end,
    jsonb_build_object('product_id', new.product_id, 'qty', new.qty, 'note', new.note));
  return new;
end $$;
drop trigger if exists movement_audit on public.stock_movements;
create trigger movement_audit after insert on public.stock_movements for each row execute function public.trg_movement_audit();

-- ---------------------------------------------------------------- business actions as functions (checked on the server)
-- 1) onboarding: a signed-in user creates their company and becomes its owner
create or replace function public.create_company(p_name text, p_industry text default 'general', p_currency text default 'MYR',
                                                 p_timezone text default 'Asia/Kuala_Lumpur', p_full_name text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_company uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from public.profiles where user_id = auth.uid()) then raise exception 'This account already belongs to a company'; end if;
  insert into public.companies(name, industry, currency, timezone) values (p_name, p_industry, p_currency, p_timezone) returning company_id into v_company;
  insert into public.profiles(user_id, company_id, role, full_name) values (auth.uid(), v_company, 'owner', p_full_name);
  insert into public.company_settings(company_id) values (v_company);
  insert into public.locations(company_id, name) values (v_company, 'Main outlet');
  perform public.audit(v_company, 'create', 'company', v_company::text, 'manual', jsonb_build_object('name', p_name));
  return v_company;
end $$;

-- 2) owner approves or rejects; an admin may only decide write-offs up to the company limit
create or replace function public.decide_approval(p_approval uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare a public.approvals%rowtype; v_limit numeric;
begin
  select * into a from public.approvals where approval_id = p_approval and company_id = public.auth_company_id() for update;
  if not found then raise exception 'Approval not found'; end if;
  if a.status <> 'pending' then raise exception 'Already decided'; end if;
  select writeoff_limit into v_limit from public.company_settings where company_id = a.company_id;
  if public.auth_role() = 'owner' or (public.auth_role() = 'admin' and a.kind = 'write_off' and a.amount <= coalesce(v_limit, 0)) then null;
  else raise exception 'You are not allowed to decide this request'; end if;
  update public.approvals set status = case when p_approve then 'approved' else 'rejected' end, decided_by = auth.uid(), decided_at = now() where approval_id = p_approval;
  if a.kind = 'purchase' and a.po_id is not null then
    update public.purchase_orders set status = case when p_approve then 'sent' else 'rejected' end, approved_by = auth.uid() where po_id = a.po_id;
  elsif a.kind = 'write_off' and p_approve then
    insert into public.stock_movements(company_id, product_id, type, qty, note, source, created_by)
    values (a.company_id, a.product_id, 'waste', a.qty, coalesce(a.reason, 'Approved write-off'), 'system', auth.uid());
  end if;
  perform public.audit(a.company_id, case when p_approve then 'approve' else 'reject' end, 'approval', p_approval::text, 'manual', jsonb_build_object('kind', a.kind, 'amount', a.amount));
end $$;

-- 3) receiving a purchase order books the stock into the ledger in one step
create or replace function public.receive_purchase(p_po uuid) returns void
language plpgsql security definer set search_path = public as $$
declare po public.purchase_orders%rowtype; it record; v_batch uuid; v_shelf int;
begin
  select * into po from public.purchase_orders where po_id = p_po and company_id = public.auth_company_id() for update;
  if not found then raise exception 'Order not found'; end if;
  if po.status = 'received' then raise exception 'Already received'; end if;
  if po.status not in ('sent','confirmed','delivered') then raise exception 'Order is not ready to receive (status: %)', po.status; end if;
  for it in select i.product_id, i.qty, p.shelf_life_days from public.purchase_order_items i join public.products p using (product_id) where i.po_id = p_po loop
    insert into public.batches(company_id, product_id, received_qty, expiry_date)
      values (po.company_id, it.product_id, it.qty, case when it.shelf_life_days is null then null else current_date + it.shelf_life_days end) returning batch_id into v_batch;
    insert into public.stock_movements(company_id, product_id, batch_id, type, qty, note, source, created_by)
      values (po.company_id, it.product_id, v_batch, 'receive', it.qty, 'PO #' || po.po_no, 'manual', auth.uid());
  end loop;
  update public.purchase_orders set status = 'received' where po_id = p_po;
  perform public.audit(po.company_id, 'receive', 'purchase_order', p_po::text, 'manual', jsonb_build_object('po_no', po.po_no));
end $$;

-- 4) what the dashboard needs in one call: stock, daily use (last 14 days), days left and stockout risk vs supplier lead time
create or replace view public.stock_health with (security_invoker = true) as
  select p.product_id, p.company_id, p.name, p.unit, p.reorder_level, p.capacity, s.lead_time_days, st.qty,
         coalesce(u.avg_daily_use, 0) as avg_daily_use,
         case when coalesce(u.avg_daily_use, 0) > 0 then round(st.qty / u.avg_daily_use, 2) end as days_left,
         (coalesce(u.avg_daily_use, 0) > 0 and st.qty / u.avg_daily_use < coalesce(s.lead_time_days, 2)) as stockout_before_delivery,
         (select min(b.expiry_date) from public.batches b where b.product_id = p.product_id and b.expiry_date >= current_date) as next_expiry
  from public.products p
  join public.product_stock st on st.product_id = p.product_id
  left join public.suppliers s on s.supplier_id = p.supplier_id
  left join lateral (select sum(m.qty) / 14.0 as avg_daily_use from public.stock_movements m
                     where m.product_id = p.product_id and m.type = 'usage' and m.created_at >= now() - interval '14 days') u on true
  where not p.archived;

-- clients may call the business functions but not the internal helpers
revoke all on function public._pol(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.audit(uuid, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_company(text, text, text, text, text) to authenticated;
grant execute on function public.decide_approval(uuid, boolean) to authenticated;
grant execute on function public.receive_purchase(uuid) to authenticated;
