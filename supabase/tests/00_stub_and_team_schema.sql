-- LOCAL TEST ONLY: fakes Supabase's auth schema/roles and the team's existing tables.
-- Never run this on Supabase.
create schema if not exists auth;
create table auth.users(id uuid primary key default gen_random_uuid(), email text);
create or replace function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;
grant usage on schema public, auth to anon, authenticated;

create table companies(company_id bigint generated always as identity primary key, company_name text not null, registration_number text, created_at timestamptz default now(), deleted_at timestamptz);
create table profiles(user_id uuid primary key references auth.users(id), company_id bigint references companies, full_name text, email text, role text, is_active boolean default true, created_at timestamptz default now());
create table categories(category_id bigint generated always as identity primary key, company_id bigint references companies, category_name text);
create table vendors(vendor_id bigint generated always as identity primary key, company_id bigint references companies, vendor_name text, contact_person_name text, phone_number text, email text, created_at timestamptz default now(), deleted_at timestamptz);
create table products(product_id bigint generated always as identity primary key, company_id bigint references companies, category_id bigint references categories, sku text, product_name text, min_stock_threshold numeric, unit_of_measure text, selling_price numeric, shelf_life_days int, ai_label text, created_at timestamptz default now(), deleted_at timestamptz);
create table batches(batch_id bigint generated always as identity primary key, company_id bigint references companies, product_id bigint references products, vendor_id bigint references vendors, batch_number text, initial_quantity numeric, current_quantity numeric, unit_cost numeric, received_date date, expiry_date date, status text, created_at timestamptz default now(), deleted_at timestamptz);
create table stock_transactions(transaction_id bigint generated always as identity primary key, company_id bigint references companies, batch_id bigint references batches, user_id uuid, transaction_type text, quantity_change numeric, notes text, created_at timestamptz default now(), is_automated boolean default false);
create table inspections(inspection_id bigint generated always as identity primary key, company_id bigint references companies, user_id uuid, batch_id bigint, product_id bigint, image_url text, predicted_label text, freshness_label text, confidence_score numeric, model_version text, inspected_at timestamptz default now(), confirmation_status text, confirmed_product_id bigint, confirmed_freshness_label text, confirmed_at timestamptz, request_id bigint);
create table waste_records(waste_id bigint generated always as identity primary key, company_id bigint references companies, transaction_id bigint references stock_transactions, batch_id bigint references batches, user_id uuid, inspection_id bigint references inspections, wasted_quantity numeric, waste_cost numeric, wasted_reason text, recorded_at timestamptz default now(), is_automated boolean default false);
create table alerts(alert_id bigint generated always as identity primary key, company_id bigint references companies, batch_id bigint references batches, product_id bigint references products, alert_type text, alert_status text, acknowledged_by uuid, acknowledged_at timestamptz, created_at timestamptz default now());
create table forecasts(forecast_id bigint generated always as identity primary key, company_id bigint references companies, product_id bigint references products, forecast_month date, predicted_demand numeric, predicted_spoilage_pct numeric, suggested_reorder_level numeric, model_version text, generated_at timestamptz default now(), estimated_purchase_cost numeric, suggested_order_qty numeric);
create table stock_in_requests(request_id bigint generated always as identity primary key, company_id bigint references companies, submitted_by uuid, product_id bigint references products, vendor_id bigint references vendors, quantity numeric, unit_cost numeric, expiry_date date, notes text, status text, reviewed_by uuid, reviewed_at timestamptz, rejection_reason text, batch_id bigint, created_at timestamptz default now());
create table voice_logs(voice_log_id bigint generated always as identity primary key, company_id bigint references companies, user_id uuid, transcript text, matched_intent text, extracted_entities jsonb, status text, created_at timestamptz default now(), input_method text);
create table audit_logs(audit_id bigint generated always as identity primary key, company_id bigint references companies, user_id uuid, action text, table_name text, record_id bigint, old_value jsonb, new_value jsonb, created_at timestamptz default now());
do $$ declare t text; begin
 for t in select tablename from pg_tables where schemaname='public' loop execute format('alter table %I enable row level security', t); end loop;
end $$;
