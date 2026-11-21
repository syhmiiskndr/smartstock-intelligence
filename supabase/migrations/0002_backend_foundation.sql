-- =====================================================================
-- SmartStock Intelligence — 0002 backend foundation (ADDITIVE)
-- Works on the team's existing bigint schema (companies, profiles,
-- products, batches, stock_transactions, ...). It does NOT drop any
-- table or column. Safe to re-run (idempotent).
--
-- What it adds
--   1. a few columns (lead time, capacity, currency, ...)
--   2. new tables: company_settings, company_invites, purchase_orders,
--      purchase_order_items, approvals, tasks
--   3. helper functions + Row Level Security policies (multi-company)
--   4. functions that do ALL stock changes safely (FEFO usage, receive,
--      waste, purchase orders, approvals, alerts)
--   5. audit trigger, product_overview view, fruit-shop demo seed
--
-- Roles in profiles.role: owner | admin | staff
-- Run in: Supabase Dashboard -> SQL Editor (DEV project first).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Small additions to existing tables
-- ---------------------------------------------------------------------
alter table companies add column if not exists industry text default 'fruit_shop';
alter table companies add column if not exists currency text default 'MYR';
alter table companies add column if not exists timezone text default 'Asia/Kuala_Lumpur';
alter table vendors   add column if not exists lead_time_days int default 2;
alter table products  add column if not exists capacity numeric;
alter table profiles  alter column is_active set default true;
alter table batches   alter column status set default 'active';
alter table alerts    alter column alert_status set default 'open';

-- value checks (own names so re-runs are clean)
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('owner','admin','staff'));
alter table stock_transactions drop constraint if exists stock_transactions_transaction_type_check;
alter table stock_transactions add constraint stock_transactions_transaction_type_check
  check (transaction_type in ('receive','usage','waste','adjust'));
alter table batches drop constraint if exists batches_status_check;
alter table batches add constraint batches_status_check
  check (status in ('active','depleted','expired','discarded'));
alter table alerts drop constraint if exists alerts_type_check;
alter table alerts add constraint alerts_type_check
  check (alert_type in ('low_stock','out_of_stock','expiring_soon','expired'));
alter table alerts drop constraint if exists alerts_status_check;
alter table alerts add constraint alerts_status_check
  check (alert_status in ('open','acknowledged','resolved'));

-- ---------------------------------------------------------------------
-- 2. New tables
-- ---------------------------------------------------------------------
create table if not exists company_settings (
  company_id bigint primary key references companies(company_id) on delete cascade,
  admin_can_see_finance boolean not null default false,
  expiring_soon_days int not null default 3,
  waste_approval_limit numeric not null default 50,
  updated_at timestamptz not null default now()
);

create table if not exists company_invites (
  invite_id bigint generated always as identity primary key,
  company_id bigint not null references companies(company_id) on delete cascade,
  code text not null unique,
  role text not null check (role in ('admin','staff')),
  created_by uuid references auth.users(id),
  expires_at timestamptz not null default now() + interval '7 days',
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists purchase_orders (
  po_id bigint generated always as identity primary key,
  company_id bigint not null references companies(company_id) on delete cascade,
  vendor_id bigint references vendors(vendor_id),
  status text not null default 'ordered' check (status in ('ordered','received','cancelled')),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expected_date date,
  received_at timestamptz
);

create table if not exists purchase_order_items (
  item_id bigint generated always as identity primary key,
  po_id bigint not null references purchase_orders(po_id) on delete cascade,
  company_id bigint not null references companies(company_id) on delete cascade,
  product_id bigint not null references products(product_id),
  quantity numeric not null check (quantity > 0),
  unit_cost numeric
);

create table if not exists approvals (
  approval_id bigint generated always as identity primary key,
  company_id bigint not null references companies(company_id) on delete cascade,
  kind text not null check (kind in ('purchase_order','waste','other')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_by uuid references auth.users(id),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  task_id bigint generated always as identity primary key,
  company_id bigint not null references companies(company_id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open','done')),
  assigned_to uuid references auth.users(id),
  due_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_batches_product on batches(company_id, product_id, status);
create index if not exists idx_tx_batch on stock_transactions(batch_id, created_at);
create index if not exists idx_alerts_open on alerts(company_id, alert_status);
create index if not exists idx_profiles_company on profiles(company_id);

-- ---------------------------------------------------------------------
-- 3. Helper functions (read the caller's company / role)
-- ---------------------------------------------------------------------
create or replace function auth_company_id() returns bigint
language sql stable security definer set search_path = public as
$$ select company_id from profiles where user_id = auth.uid() and coalesce(is_active,true) limit 1 $$;

create or replace function auth_role() returns text
language sql stable security definer set search_path = public as
$$ select role from profiles where user_id = auth.uid() and coalesce(is_active,true) limit 1 $$;

create or replace function is_manager() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(auth_role() in ('owner','admin'), false) $$;

create or replace function can_see_finance() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(
     auth_role() = 'owner'
     or (auth_role() = 'admin' and (select admin_can_see_finance from company_settings where company_id = auth_company_id())),
   false) $$;

-- ---------------------------------------------------------------------
-- 4. Row Level Security
--    Default = nothing allowed. Reads: own company only.
--    Stock tables have NO client write policy: changes go through the
--    functions in section 5 (so numbers can't be tampered with).
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['company_settings','company_invites','purchase_orders','purchase_order_items','approvals','tasks']
  loop execute format('alter table %I enable row level security', t); end loop;

  -- read own company
  foreach t in array array['categories','vendors','products','batches','stock_transactions','waste_records',
                           'alerts','forecasts','inspections','purchase_orders','purchase_order_items',
                           'tasks','company_settings','profiles']
  loop
    execute format('drop policy if exists %I on %I', t||'_select', t);
    execute format('create policy %I on %I for select to authenticated using (company_id = auth_company_id())', t||'_select', t);
  end loop;
end $$;

drop policy if exists companies_select on companies;
create policy companies_select on companies for select to authenticated using (company_id = auth_company_id());
drop policy if exists companies_update on companies;
create policy companies_update on companies for update to authenticated
  using (company_id = auth_company_id() and auth_role() = 'owner')
  with check (company_id = auth_company_id());

-- manager-only master data
do $$
declare t text;
begin
  foreach t in array array['categories','vendors','products']
  loop
    execute format('drop policy if exists %I on %I', t||'_write', t);
    execute format('create policy %I on %I for all to authenticated using (company_id = auth_company_id() and is_manager()) with check (company_id = auth_company_id() and is_manager())', t||'_write', t);
  end loop;
end $$;

-- own profile: name only (role/active changes go through set_member())
drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists company_settings_update on company_settings;
create policy company_settings_update on company_settings for update to authenticated
  using (company_id = auth_company_id() and auth_role() = 'owner')
  with check (company_id = auth_company_id());

drop policy if exists company_invites_select on company_invites;
create policy company_invites_select on company_invites for select to authenticated
  using (company_id = auth_company_id() and is_manager());

drop policy if exists approvals_select on approvals;
create policy approvals_select on approvals for select to authenticated
  using (company_id = auth_company_id() and (is_manager() or requested_by = auth.uid()));

drop policy if exists audit_logs_select on audit_logs;
create policy audit_logs_select on audit_logs for select to authenticated
  using (company_id = auth_company_id() and is_manager());

drop policy if exists voice_logs_select on voice_logs;
create policy voice_logs_select on voice_logs for select to authenticated
  using (company_id = auth_company_id() and (user_id = auth.uid() or is_manager()));
drop policy if exists voice_logs_insert on voice_logs;
create policy voice_logs_insert on voice_logs for insert to authenticated
  with check (company_id = auth_company_id() and user_id = auth.uid());

drop policy if exists inspections_insert on inspections;
create policy inspections_insert on inspections for insert to authenticated
  with check (company_id = auth_company_id() and user_id = auth.uid());
drop policy if exists inspections_update on inspections;
create policy inspections_update on inspections for update to authenticated
  using (company_id = auth_company_id()) with check (company_id = auth_company_id());

drop policy if exists stock_in_requests_select on stock_in_requests;
create policy stock_in_requests_select on stock_in_requests for select to authenticated
  using (company_id = auth_company_id() and (is_manager() or submitted_by = auth.uid()));
drop policy if exists stock_in_requests_insert on stock_in_requests;
create policy stock_in_requests_insert on stock_in_requests for insert to authenticated
  with check (company_id = auth_company_id() and submitted_by = auth.uid() and status = 'pending');

drop policy if exists tasks_write on tasks;
create policy tasks_write on tasks for all to authenticated
  using (company_id = auth_company_id()) with check (company_id = auth_company_id());

-- table privileges (RLS above still decides which rows)
revoke all on all tables in schema public from anon;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on categories, vendors, products, tasks to authenticated;
grant insert on voice_logs, inspections, stock_in_requests to authenticated;
grant update on inspections, companies, company_settings to authenticated;
revoke update on profiles from authenticated;
grant update (full_name) on profiles to authenticated;

-- ---------------------------------------------------------------------
-- 5. Business functions (SECURITY DEFINER = run with checks inside)
-- ---------------------------------------------------------------------
create or replace function _need_member() returns bigint
language plpgsql stable security definer set search_path = public as $$
declare c bigint := auth_company_id();
begin
  if auth.uid() is null or c is null then raise exception 'not a member of any company'; end if;
  return c;
end $$;

create or replace function _need_manager() returns bigint
language plpgsql stable security definer set search_path = public as $$
declare c bigint := _need_member();
begin
  if not is_manager() then raise exception 'owner or admin only'; end if;
  return c;
end $$;

-- 5a. Company onboarding -------------------------------------------------
create or replace function create_company(p_name text, p_registration text default null, p_full_name text default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare cid bigint; mail text;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if exists (select 1 from profiles where user_id = auth.uid()) then raise exception 'you already belong to a company'; end if;
  if coalesce(trim(p_name),'') = '' then raise exception 'company name required'; end if;
  select email into mail from auth.users where id = auth.uid();
  insert into companies(company_name, registration_number) values (trim(p_name), p_registration) returning company_id into cid;
  insert into profiles(user_id, company_id, full_name, email, role, is_active)
    values (auth.uid(), cid, coalesce(p_full_name, split_part(mail,'@',1)), mail, 'owner', true);
  insert into company_settings(company_id) values (cid);
  return cid;
end $$;

create or replace function create_invite(p_role text default 'staff') returns text
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); code text;
begin
  if p_role not in ('admin','staff') then raise exception 'role must be admin or staff'; end if;
  if p_role = 'admin' and auth_role() <> 'owner' then raise exception 'only the owner can invite an admin'; end if;
  code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  insert into company_invites(company_id, code, role, created_by) values (c, code, p_role, auth.uid());
  return code;
end $$;

create or replace function join_company(p_code text, p_full_name text default null) returns bigint
language plpgsql security definer set search_path = public as $$
declare inv company_invites; mail text;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if exists (select 1 from profiles where user_id = auth.uid()) then raise exception 'you already belong to a company'; end if;
  select * into inv from company_invites
    where code = upper(trim(p_code)) and used_at is null and expires_at > now() for update;
  if not found then raise exception 'invalid or expired invite code'; end if;
  select email into mail from auth.users where id = auth.uid();
  insert into profiles(user_id, company_id, full_name, email, role, is_active)
    values (auth.uid(), inv.company_id, coalesce(p_full_name, split_part(mail,'@',1)), mail, inv.role, true);
  update company_invites set used_by = auth.uid(), used_at = now() where invite_id = inv.invite_id;
  return inv.company_id;
end $$;

create or replace function set_member(p_user uuid, p_role text, p_active boolean) returns void
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member();
begin
  if auth_role() <> 'owner' then raise exception 'owner only'; end if;
  if p_user = auth.uid() then raise exception 'you cannot change your own role'; end if;
  if p_role not in ('owner','admin','staff') then raise exception 'bad role'; end if;
  update profiles set role = p_role, is_active = p_active where user_id = p_user and company_id = c;
  if not found then raise exception 'member not found'; end if;
end $$;

-- 5b. Stock helpers -------------------------------------------------------
-- internal: create a batch + its 'receive' transaction (not callable by clients)
create or replace function _create_batch(p_company bigint, p_product bigint, p_vendor bigint, p_qty numeric,
                                          p_cost numeric, p_expiry date, p_user uuid, p_note text)
returns bigint language plpgsql security definer set search_path = public as $$
declare bid bigint; n int; shelf int;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be > 0'; end if;
  select shelf_life_days into shelf from products where product_id = p_product and company_id = p_company and deleted_at is null;
  if not found then raise exception 'product not found'; end if;
  if p_vendor is not null and not exists (select 1 from vendors where vendor_id = p_vendor and company_id = p_company) then
    raise exception 'vendor not found'; end if;
  select count(*) + 1 into n from batches where company_id = p_company and received_date = current_date;
  insert into batches(company_id, product_id, vendor_id, batch_number, initial_quantity, current_quantity,
                      unit_cost, received_date, expiry_date, status)
    values (p_company, p_product, p_vendor, 'B' || to_char(current_date,'YYMMDD') || '-' || lpad(n::text,3,'0'),
            p_qty, p_qty, p_cost, current_date,
            coalesce(p_expiry, case when shelf is not null then current_date + shelf end), 'active')
    returning batch_id into bid;
  insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes)
    values (p_company, bid, p_user, 'receive', p_qty, p_note);
  return bid;
end $$;

create or replace function receive_stock(p_product bigint, p_vendor bigint, p_qty numeric,
                                         p_unit_cost numeric default null, p_expiry date default null, p_notes text default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager();
begin
  return _create_batch(c, p_product, p_vendor, p_qty, p_unit_cost, p_expiry, auth.uid(), p_notes);
end $$;

create or replace function review_stock_in(p_request bigint, p_approve boolean, p_reason text default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); r stock_in_requests; bid bigint;
begin
  select * into r from stock_in_requests where request_id = p_request and company_id = c for update;
  if not found then raise exception 'request not found'; end if;
  if r.status <> 'pending' then raise exception 'request already reviewed'; end if;
  if p_approve then
    bid := _create_batch(c, r.product_id, r.vendor_id, r.quantity, r.unit_cost, r.expiry_date, r.submitted_by, r.notes);
    update stock_in_requests set status='approved', reviewed_by=auth.uid(), reviewed_at=now(), batch_id=bid where request_id = p_request;
  else
    update stock_in_requests set status='rejected', reviewed_by=auth.uid(), reviewed_at=now(), rejection_reason=p_reason where request_id = p_request;
  end if;
  return bid;
end $$;

-- usage: take stock oldest-expiry-first (FEFO) across batches
create or replace function record_usage(p_product bigint, p_qty numeric, p_notes text default null, p_automated boolean default false)
returns numeric language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); left_q numeric := p_qty; b record; take numeric; avail numeric;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be > 0'; end if;
  if not exists (select 1 from products where product_id = p_product and company_id = c and deleted_at is null) then
    raise exception 'product not found'; end if;
  select coalesce(sum(current_quantity),0) into avail from batches
    where company_id = c and product_id = p_product and status = 'active' and deleted_at is null
      and (expiry_date is null or expiry_date >= current_date);
  if avail < p_qty then raise exception 'not enough stock: % available, % requested', avail, p_qty; end if;
  for b in select batch_id, current_quantity from batches
           where company_id = c and product_id = p_product and status = 'active' and deleted_at is null
             and current_quantity > 0 and (expiry_date is null or expiry_date >= current_date)
           order by expiry_date nulls last, received_date, batch_id for update
  loop
    exit when left_q <= 0;
    take := least(b.current_quantity, left_q);
    insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes, is_automated)
      values (c, b.batch_id, auth.uid(), 'usage', -take, p_notes, p_automated);
    update batches set current_quantity = current_quantity - take,
           status = case when current_quantity - take <= 0 then 'depleted' else status end
     where batch_id = b.batch_id;
    left_q := left_q - take;
  end loop;
  return p_qty;
end $$;

create or replace function record_waste(p_batch bigint, p_qty numeric, p_reason text default null, p_inspection bigint default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); b batches; tx bigint; wid bigint; lim numeric; cost numeric;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be > 0'; end if;
  select * into b from batches where batch_id = p_batch and company_id = c and deleted_at is null for update;
  if not found then raise exception 'batch not found'; end if;
  if b.current_quantity < p_qty then raise exception 'batch only has % left', b.current_quantity; end if;
  cost := p_qty * coalesce(b.unit_cost, 0);
  select waste_approval_limit into lim from company_settings where company_id = c;
  if not is_manager() and cost > coalesce(lim, 50) then
    raise exception 'waste value % is above your limit; ask an owner/admin (use request_approval)', cost;
  end if;
  insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes)
    values (c, p_batch, auth.uid(), 'waste', -p_qty, p_reason) returning transaction_id into tx;
  insert into waste_records(company_id, transaction_id, batch_id, user_id, inspection_id, wasted_quantity, waste_cost, wasted_reason)
    values (c, tx, p_batch, auth.uid(), p_inspection, p_qty, cost, p_reason) returning waste_id into wid;
  update batches set current_quantity = current_quantity - p_qty,
         status = case when current_quantity - p_qty <= 0 then 'depleted' else status end
   where batch_id = p_batch;
  return wid;
end $$;

-- 5c. Purchase orders & approvals ---------------------------------------
create or replace function _create_po(p_company bigint, p_user uuid, p_vendor bigint, p_items jsonb, p_note text)
returns bigint language plpgsql security definer set search_path = public as $$
declare pid bigint; it jsonb; lead int;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'items required'; end if;
  select coalesce(lead_time_days, 2) into lead from vendors where vendor_id = p_vendor and company_id = p_company;
  if not found then raise exception 'vendor not found'; end if;
  insert into purchase_orders(company_id, vendor_id, status, note, created_by, expected_date)
    values (p_company, p_vendor, 'ordered', p_note, p_user, current_date + lead) returning po_id into pid;
  for it in select * from jsonb_array_elements(p_items) loop
    if not exists (select 1 from products where product_id = (it->>'product_id')::bigint and company_id = p_company) then
      raise exception 'product % not found', it->>'product_id'; end if;
    insert into purchase_order_items(po_id, company_id, product_id, quantity, unit_cost)
      values (pid, p_company, (it->>'product_id')::bigint, (it->>'quantity')::numeric, nullif(it->>'unit_cost','')::numeric);
  end loop;
  return pid;
end $$;

-- p_items example: [{"product_id":1,"quantity":20,"unit_cost":3.5}]
create or replace function create_purchase_order(p_vendor bigint, p_items jsonb, p_note text default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager();
begin return _create_po(c, auth.uid(), p_vendor, p_items, p_note); end $$;

create or replace function receive_purchase_order(p_po bigint) returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); po purchase_orders; it record; n int := 0;
begin
  select * into po from purchase_orders where po_id = p_po and company_id = c for update;
  if not found then raise exception 'order not found'; end if;
  if po.status <> 'ordered' then raise exception 'order is already %', po.status; end if;
  for it in select * from purchase_order_items where po_id = p_po loop
    perform _create_batch(c, it.product_id, po.vendor_id, it.quantity, it.unit_cost, null, auth.uid(), 'PO #' || p_po);
    n := n + 1;
  end loop;
  update purchase_orders set status = 'received', received_at = now() where po_id = p_po;
  return n;
end $$;

create or replace function request_approval(p_kind text, p_payload jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); aid bigint;
begin
  insert into approvals(company_id, kind, payload, requested_by) values (c, p_kind, coalesce(p_payload,'{}'), auth.uid())
    returning approval_id into aid;
  return aid;
end $$;

create or replace function decide_approval(p_approval bigint, p_approve boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); a approvals;
begin
  select * into a from approvals where approval_id = p_approval and company_id = c for update;
  if not found then raise exception 'approval not found'; end if;
  if a.status <> 'pending' then raise exception 'already decided'; end if;
  if p_approve and a.kind = 'purchase_order' then
    perform _create_po(c, a.requested_by, (a.payload->>'vendor_id')::bigint, a.payload->'items', a.payload->>'note');
  end if;
  update approvals set status = case when p_approve then 'approved' else 'rejected' end,
         decided_by = auth.uid(), decided_at = now(), reason = p_reason where approval_id = p_approval;
end $$;

-- 5d. Alerts ---------------------------------------------------------------
create or replace function acknowledge_alert(p_alert bigint) returns void
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member();
begin
  update alerts set alert_status = 'acknowledged', acknowledged_by = auth.uid(), acknowledged_at = now()
   where alert_id = p_alert and company_id = c and alert_status = 'open';
end $$;

-- scans stock and creates/resolves alerts; returns how many new alerts
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
                        and a.alert_status = 'open' and a.alert_type = case when q <= 0 then 'out_of_stock' else 'low_stock' end);
  get diagnostics k = row_count; n := n + k;

  insert into alerts(company_id, batch_id, product_id, alert_type, alert_status)
  select c, b.batch_id, b.product_id, case when b.expiry_date < current_date then 'expired' else 'expiring_soon' end, 'open'
    from batches b
   where b.company_id = c and b.deleted_at is null and b.current_quantity > 0 and b.status in ('active','expired')
     and b.expiry_date is not null and b.expiry_date <= current_date + soon
     and not exists (select 1 from alerts a where a.batch_id = b.batch_id and a.alert_status = 'open'
                        and a.alert_type = case when b.expiry_date < current_date then 'expired' else 'expiring_soon' end);
  get diagnostics k = row_count; n := n + k;

  update alerts a set alert_status = 'resolved'
   where a.company_id = c and a.alert_status = 'open' and a.alert_type in ('low_stock','out_of_stock')
     and (select coalesce(sum(current_quantity),0) from batches b
           where b.product_id = a.product_id and b.status = 'active' and b.deleted_at is null
             and (b.expiry_date is null or b.expiry_date >= current_date))
         >= coalesce((select min_stock_threshold from products p where p.product_id = a.product_id), 0)
     and (select coalesce(sum(current_quantity),0) from batches b
           where b.product_id = a.product_id and b.status = 'active' and b.deleted_at is null
             and (b.expiry_date is null or b.expiry_date >= current_date)) > 0;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- 6. View for the UI (Home / Stock / Analytics): one row per product
-- ---------------------------------------------------------------------
create or replace view product_overview with (security_invoker = true) as
select p.product_id, p.company_id, p.sku, p.product_name, p.category_id, p.unit_of_measure,
       p.min_stock_threshold, p.capacity, p.selling_price, p.shelf_life_days,
       coalesce(s.on_hand, 0) as on_hand,
       s.next_expiry,
       coalesce(u.avg_daily_use, 0) as avg_daily_use,
       case when coalesce(u.avg_daily_use,0) > 0 then round(coalesce(s.on_hand,0) / u.avg_daily_use, 1) end as days_left,
       case when coalesce(s.on_hand,0) <= 0 then 'out'
            when coalesce(s.on_hand,0) < coalesce(p.min_stock_threshold,0) then 'low'
            when s.next_expiry is not null and s.next_expiry <= current_date + 3 then 'expiring'
            else 'ok' end as stock_status
  from products p
  left join lateral (
    select sum(b.current_quantity) as on_hand, min(b.expiry_date) filter (where b.current_quantity > 0) as next_expiry
      from batches b
     where b.product_id = p.product_id and b.status = 'active' and b.deleted_at is null
       and (b.expiry_date is null or b.expiry_date >= current_date)) s on true
  left join lateral (
    select -sum(t.quantity_change) / 14.0 as avg_daily_use
      from stock_transactions t join batches b2 on b2.batch_id = t.batch_id
     where b2.product_id = p.product_id and t.transaction_type = 'usage'
       and t.created_at >= now() - interval '14 days') u on true
 where p.deleted_at is null;
grant select on product_overview to authenticated;

-- ---------------------------------------------------------------------
-- 7. Audit trail: who changed what (old/new as JSON)
-- ---------------------------------------------------------------------
create or replace function audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare pk text := tg_argv[0]; r jsonb; cid bigint; rid bigint;
begin
  r := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  cid := nullif(r->>'company_id','')::bigint;
  rid := nullif(r->>pk,'')::bigint;
  insert into audit_logs(company_id, user_id, action, table_name, record_id, old_value, new_value)
    values (cid, auth.uid(), tg_op, tg_table_name, rid,
            case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
            case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return null;
end $$;

do $$
declare x record;
begin
  for x in select * from (values
      ('products','product_id'),('vendors','vendor_id'),('batches','batch_id'),
      ('purchase_orders','po_id'),('approvals','approval_id'),('company_settings','company_id'),
      ('stock_in_requests','request_id'),('waste_records','waste_id')) v(tbl,pk)
  loop
    execute format('drop trigger if exists trg_audit on %I', x.tbl);
    execute format('create trigger trg_audit after insert or update or delete on %I for each row execute function audit_row(%L)', x.tbl, x.pk);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 8. Fruit-shop demo data for the caller's own company (owner/admin)
--    Call once:  select seed_demo_fruit_shop();
-- ---------------------------------------------------------------------
create or replace function seed_demo_fruit_shop() returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager(); v1 bigint; v2 bigint; v3 bigint; f record; pid bigint; bid bigint;
        used numeric; d int; daily numeric; remain numeric; n int := 0; vid bigint;
begin
  if exists (select 1 from products where company_id = c) then raise exception 'this company already has products'; end if;
  insert into vendors(company_id, vendor_name, contact_person_name, lead_time_days) values (c,'Segar Jaya','Encik Razak',1) returning vendor_id into v1;
  insert into vendors(company_id, vendor_name, contact_person_name, lead_time_days) values (c,'Ladang Hijau','Puan Salmah',2) returning vendor_id into v2;
  insert into vendors(company_id, vendor_name, contact_person_name, lead_time_days) values (c,'Mill Sentosa','Encik Lim',3) returning vendor_id into v3;

  -- sku, name, vendor, min threshold, shelf days, price, cost, stock factor vs threshold
  for f in select * from (values
      ('FR-APL','Epal Fuji',      3, 20, 14, 8.90, 5.50, 1.6),
      ('FR-ORG','Oren Sunkist',   3, 25, 14, 7.50, 4.80, 0.5),
      ('FR-BNN','Pisang Berangan',1, 15,  5, 4.50, 2.60, 0.0),
      ('FR-WML','Tembikai',       2, 30,  7, 3.20, 1.60, 2.2),
      ('FR-PPY','Betik',          2, 15,  6, 3.80, 2.00, 1.3),
      ('FR-MNG','Mangga Harumanis',1,10,  5,12.00, 7.50, 0.6),
      ('FR-GRP','Anggur Merah',   3,  8,  7,18.00,11.00, 1.8),
      ('FR-STR','Strawberi',      1,  6,  4,15.00, 9.00, 1.1),
      ('FR-PNP','Nanas',          2, 12,  8, 4.00, 2.20, 2.0),
      ('FR-GVA','Jambu Batu',     2, 10,  5, 5.00, 2.80, 1.4)
    ) as t(sku,name,vend,thr,shelf,price,cost,factor)
  loop
    vid := case f.vend when 1 then v1 when 2 then v2 else v3 end;
    insert into products(company_id, sku, product_name, unit_of_measure, min_stock_threshold, shelf_life_days, selling_price, capacity)
      values (c, f.sku, f.name, 'kg', f.thr, f.shelf, f.price, f.thr * 4) returning product_id into pid;
    daily := f.thr / 4.0; used := 0;
    for d in 1..14 loop used := used + round(daily * (0.7 + ((d * 7 + pid::int) % 6) / 10.0), 1); end loop;
    remain := round(f.thr * f.factor, 1);
    insert into batches(company_id, product_id, vendor_id, batch_number, initial_quantity, current_quantity, unit_cost,
                        received_date, expiry_date, status)
      values (c, pid, vid, 'SEED-' || f.sku, remain + used, remain, f.cost, current_date - 3,
              current_date - 3 + f.shelf, case when remain > 0 then 'active' else 'depleted' end)
      returning batch_id into bid;
    insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes, created_at)
      values (c, bid, auth.uid(), 'receive', remain + used, 'demo opening stock', now() - interval '14 days');
    for d in 1..14 loop
      insert into stock_transactions(company_id, batch_id, user_id, transaction_type, quantity_change, notes, created_at)
        values (c, bid, auth.uid(), 'usage', -round(daily * (0.7 + ((d * 7 + pid::int) % 6) / 10.0), 1), 'demo usage',
                now() - (d || ' days')::interval);
    end loop;
    n := n + 1;
  end loop;
  perform refresh_alerts();
  return n;
end $$;

-- ---------------------------------------------------------------------
-- 9. Who may call what (logged-in users only; internals stay private)
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon;
grant execute on function
  auth_company_id(), auth_role(), is_manager(), can_see_finance(),
  create_company(text,text,text), create_invite(text), join_company(text,text), set_member(uuid,text,boolean),
  receive_stock(bigint,bigint,numeric,numeric,date,text), review_stock_in(bigint,boolean,text),
  record_usage(bigint,numeric,text,boolean), record_waste(bigint,numeric,text,bigint),
  create_purchase_order(bigint,jsonb,text), receive_purchase_order(bigint),
  request_approval(text,jsonb), decide_approval(bigint,boolean,text),
  acknowledge_alert(bigint), refresh_alerts(), seed_demo_fruit_shop()
  to authenticated;
-- internal helpers (_need_*, _create_batch, _create_po, audit_row) are NOT granted.
-- Note: auth_company_id/auth_role/is_manager are needed by RLS, so authenticated may execute them.
-- _need_member/_need_manager are called from definer functions only.
