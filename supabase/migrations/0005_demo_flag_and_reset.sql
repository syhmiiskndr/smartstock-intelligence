-- =====================================================================
-- SmartStock Intelligence — 0005 demo company flag + reset (ADDITIVE, safe to re-run)
-- Run AFTER 0004.
--
-- The app no longer carries any hardcoded sample data. The demo is just a company in Supabase:
--   * companies.is_demo marks a company as a demo (the owner then sees "Reset demo data" in Rules)
--   * reset_demo() wipes that company's stock data and loads the sample fruit shop again
--   * the company that owner@smartstock.test belongs to (made by 0003) is marked as the demo
-- A brand-new company starts empty; its owner can press "Load sample data" (seed_demo_fruit_shop).
-- =====================================================================

alter table companies add column if not exists is_demo boolean not null default false;

create or replace function reset_demo() returns int
language plpgsql security definer set search_path = public as $$
declare c bigint := _need_manager();
begin
  if auth_role() <> 'owner' then raise exception 'only the owner can reset demo data'; end if;
  if not exists (select 1 from companies where company_id = c and is_demo) then
    raise exception 'this is not a demo company';
  end if;
  delete from tasks               where company_id = c;
  delete from approvals           where company_id = c;
  delete from purchase_order_items where company_id = c;
  delete from purchase_orders     where company_id = c;
  delete from alerts              where company_id = c;
  delete from waste_records       where company_id = c;
  delete from inspections         where company_id = c;
  delete from forecasts           where company_id = c;
  delete from stock_in_requests   where company_id = c;
  delete from stock_transactions  where company_id = c;
  delete from voice_logs          where company_id = c;
  delete from batches             where company_id = c;
  delete from products            where company_id = c;
  delete from categories          where company_id = c;
  delete from vendors             where company_id = c;
  delete from audit_logs          where company_id = c;
  return seed_demo_fruit_shop();
end $$;

grant execute on function reset_demo() to authenticated;

-- mark the demo company created by 0003 (if it exists)
update companies set is_demo = true
 where company_id in (select company_id from profiles where lower(email) = 'owner@smartstock.test');
