-- 0009: real company settings (saved in the database) and autonomy levels for purchasing.
-- Run after 0008. Safe to run twice.
--
-- Autonomy (company_settings.autonomy):
--   suggest : SmartStock only shows forecasts and suggested quantities. No draft orders are created.
--   draft   : SmartStock drafts purchase orders and waits for an owner/admin to approve (the behaviour before this migration).
--   auto    : drafts that cost no more than auto_order_limit per order, and no more than auto_order_daily_cap per day in total,
--             are placed automatically. Anything bigger, or with an unknown price or supplier, stays a draft for approval.
-- Auto-placed orders are written to the activity log as "SmartStock AI".

alter table company_settings
  add column if not exists autonomy text not null default 'draft',
  add column if not exists auto_order_limit numeric not null default 100,
  add column if not exists auto_order_daily_cap numeric not null default 500,
  add column if not exists low_alert boolean not null default true,
  add column if not exists expiry_alert boolean not null default true,
  add column if not exists flag_anomaly boolean not null default true,
  add column if not exists confirm_voice boolean not null default true;

alter table company_settings drop constraint if exists company_settings_autonomy_check;
alter table company_settings add constraint company_settings_autonomy_check check (autonomy in ('suggest','draft','auto'));
alter table company_settings drop constraint if exists company_settings_limits_check;
alter table company_settings add constraint company_settings_limits_check check (
  auto_order_limit between 0 and 100000 and auto_order_daily_cap between 0 and 1000000
  and waste_approval_limit between 0 and 100000 and expiring_soon_days between 1 and 30);

-- settings are changed only through update_settings() so every change is validated and owner-only
revoke update on company_settings from authenticated;

-- the audit trigger attributes a change to SmartStock AI when app.actor is set to 'ai' for the transaction
create or replace function audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare pk text := tg_argv[0]; r jsonb; cid bigint; rid bigint;
begin
  r := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  cid := nullif(r->>'company_id','')::bigint;
  rid := nullif(r->>pk,'')::bigint;
  insert into audit_logs(company_id, user_id, action, table_name, record_id, old_value, new_value)
    values (cid, case when coalesce(current_setting('app.actor', true), '') = 'ai' then null else auth.uid() end,
            tg_op, tg_table_name, rid,
            case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
            case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return null;
end $$;

-- ---------------------------------------------------------------------
-- Alerts respect the low-stock and expiry switches
-- ---------------------------------------------------------------------
create or replace function refresh_alerts() returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); soon int; n int := 0; k int; lowa boolean; expa boolean;
begin
  select coalesce(expiring_soon_days,3), coalesce(low_alert,true), coalesce(expiry_alert,true) into soon, lowa, expa
    from company_settings where company_id = c;
  soon := coalesce(soon, 3); lowa := coalesce(lowa, true); expa := coalesce(expa, true);

  update batches set status = 'expired'
   where company_id = c and status = 'active' and deleted_at is null and current_quantity > 0 and expiry_date < current_date;

  if lowa then
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
  end if;

  if expa then
    insert into alerts(company_id, batch_id, product_id, alert_type, alert_status)
    select c, b.batch_id, b.product_id, case when b.expiry_date < current_date then 'expired' else 'expiring_soon' end, 'open'
      from batches b
     where b.company_id = c and b.deleted_at is null and b.current_quantity > 0 and b.status in ('active','expired')
       and b.expiry_date is not null and b.expiry_date <= current_date + soon
       and not exists (select 1 from alerts a where a.batch_id = b.batch_id and a.alert_status in ('open','acknowledged')
                          and a.alert_type = case when b.expiry_date < current_date then 'expired' else 'expiring_soon' end);
    get diagnostics k = row_count; n := n + k;
  end if;

  update alerts a set alert_status = 'resolved'
   where a.company_id = c and a.alert_status in ('open','acknowledged') and a.alert_type in ('low_stock','out_of_stock')
     and (select coalesce(sum(current_quantity),0) from batches b
           where b.product_id = a.product_id and b.status = 'active' and b.deleted_at is null
             and (b.expiry_date is null or b.expiry_date >= current_date))
         >= coalesce((select min_stock_threshold from products p where p.product_id = a.product_id), 0);

  update alerts a set alert_status = 'resolved'
   where a.company_id = c and a.alert_status in ('open','acknowledged') and a.alert_type in ('expiring_soon','expired')
     and not exists (select 1 from batches b where b.batch_id = a.batch_id and b.current_quantity > 0 and b.deleted_at is null);
  return n;
end $$;

-- ---------------------------------------------------------------------
-- Auto-ordering: place drafts that are inside the owner's limits
-- ---------------------------------------------------------------------
create or replace function _auto_place(p_company bigint) returns int
language plpgsql security definer set search_path = public as $$
declare s company_settings; a record; total numeric; spent numeric; placed int := 0; priced boolean;
begin
  select * into s from company_settings where company_id = p_company;
  if not found or s.autonomy <> 'auto' then return 0; end if;

  select coalesce(sum(t.total), 0) into spent from (
    select (select coalesce(sum((i->>'quantity')::numeric * coalesce(nullif(i->>'unit_cost','')::numeric, 0)), 0)
              from jsonb_array_elements(ap.payload->'items') i) total
      from approvals ap
     where ap.company_id = p_company and ap.kind = 'purchase_order' and ap.status = 'approved'
       and (ap.payload->>'auto_placed')::boolean is true and ap.decided_at >= date_trunc('day', now())) t;

  for a in select * from approvals
            where company_id = p_company and kind = 'purchase_order' and status = 'pending'
              and (payload->>'auto')::boolean is true and nullif(payload->>'vendor_id','') is not null
            order by approval_id loop
    select coalesce(sum((i->>'quantity')::numeric * coalesce(nullif(i->>'unit_cost','')::numeric, 0)), 0),
           bool_and(coalesce(nullif(i->>'unit_cost','')::numeric, 0) > 0)
      into total, priced from jsonb_array_elements(a.payload->'items') i;
    continue when not coalesce(priced, false) or total <= 0 or total > s.auto_order_limit or spent + total > s.auto_order_daily_cap;

    perform set_config('app.actor', 'ai', true);
    perform _create_po(p_company, null, (a.payload->>'vendor_id')::bigint, a.payload->'items', 'SmartStock auto-order');
    update approvals set status = 'approved', decided_at = now(), decided_by = null,
           reason = 'auto: inside your limit of RM ' || s.auto_order_limit,
           payload = payload || jsonb_build_object('auto_placed', true)
     where approval_id = a.approval_id;
    perform set_config('app.actor', '', true);
    spent := spent + total; placed := placed + 1;
  end loop;
  return placed;
end $$;

-- ---------------------------------------------------------------------
-- generate_forecasts keeps its name; the engine moves to _generate_forecasts_core and the wrapper applies the autonomy level
-- ---------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_proc where proname = '_generate_forecasts_core') then
    alter function generate_forecasts(boolean, boolean) rename to _generate_forecasts_core;
  end if;
end $$;

create or replace function generate_forecasts(p_force boolean default false, p_draft boolean default true)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); lvl text; r jsonb; placed int := 0;
begin
  select coalesce(autonomy, 'draft') into lvl from company_settings where company_id = c;
  lvl := coalesce(lvl, 'draft');
  r := _generate_forecasts_core(p_force, p_draft and lvl <> 'suggest');
  if lvl = 'auto' and p_draft then placed := _auto_place(c); end if;
  return r || jsonb_build_object('autonomy', lvl, 'auto_placed', placed);
end $$;

-- ---------------------------------------------------------------------
-- update_settings: owner only. Example: select update_settings('{"autonomy":"auto","auto_order_limit":150}');
-- ---------------------------------------------------------------------
create or replace function update_settings(p_patch jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_member(); k text; s company_settings;
  known text[] := array['autonomy','auto_order_limit','auto_order_daily_cap','waste_approval_limit','expiring_soon_days',
                        'admin_can_see_finance','low_alert','expiry_alert','flag_anomaly','confirm_voice'];
begin
  if auth_role() <> 'owner' then raise exception 'only the owner can change rules'; end if;
  if jsonb_typeof(p_patch) <> 'object' then raise exception 'settings must be an object'; end if;
  for k in select jsonb_object_keys(p_patch) loop
    if not (k = any(known)) then raise exception 'unknown setting: %', k; end if;
  end loop;
  insert into company_settings(company_id) values (c) on conflict do nothing;
  begin
    update company_settings set
      autonomy = case when p_patch ? 'autonomy' then p_patch->>'autonomy' else autonomy end,
      auto_order_limit = case when p_patch ? 'auto_order_limit' then (p_patch->>'auto_order_limit')::numeric else auto_order_limit end,
      auto_order_daily_cap = case when p_patch ? 'auto_order_daily_cap' then (p_patch->>'auto_order_daily_cap')::numeric else auto_order_daily_cap end,
      waste_approval_limit = case when p_patch ? 'waste_approval_limit' then (p_patch->>'waste_approval_limit')::numeric else waste_approval_limit end,
      expiring_soon_days = case when p_patch ? 'expiring_soon_days' then (p_patch->>'expiring_soon_days')::int else expiring_soon_days end,
      admin_can_see_finance = case when p_patch ? 'admin_can_see_finance' then (p_patch->>'admin_can_see_finance')::boolean else admin_can_see_finance end,
      low_alert = case when p_patch ? 'low_alert' then (p_patch->>'low_alert')::boolean else low_alert end,
      expiry_alert = case when p_patch ? 'expiry_alert' then (p_patch->>'expiry_alert')::boolean else expiry_alert end,
      flag_anomaly = case when p_patch ? 'flag_anomaly' then (p_patch->>'flag_anomaly')::boolean else flag_anomaly end,
      confirm_voice = case when p_patch ? 'confirm_voice' then (p_patch->>'confirm_voice')::boolean else confirm_voice end,
      updated_at = now()
     where company_id = c returning * into s;
  exception when check_violation or invalid_text_representation or numeric_value_out_of_range then
    raise exception 'that value is not allowed';
  end;

  if p_patch ? 'autonomy' and s.autonomy = 'suggest' then
    update approvals set status = 'rejected', decided_at = now(), reason = 'auto: autonomy set to suggest only'
     where company_id = c and kind = 'purchase_order' and status = 'pending' and (payload->>'auto')::boolean is true;
  end if;
  if s.autonomy = 'auto' then perform _auto_place(c); end if;
end $$;

revoke all on function _auto_place(bigint), _generate_forecasts_core(boolean, boolean), audit_row() from public, anon, authenticated;
revoke all on function update_settings(jsonb), generate_forecasts(boolean, boolean), refresh_alerts() from public, anon;
grant execute on function update_settings(jsonb), generate_forecasts(boolean, boolean), refresh_alerts() to authenticated;
