-- Run ONCE in SQL Editor after creating the 3 users (owner/admin/staff @smartstock.test).
-- Makes one company "Kedai Buah Demo", links the 3 users with their roles, and loads fruit-shop demo data.
do $$
declare cid bigint; o uuid; a uuid; s uuid;
begin
  select id into o from auth.users where email = 'owner@smartstock.test';
  select id into a from auth.users where email = 'admin@smartstock.test';
  select id into s from auth.users where email = 'staff@smartstock.test';
  if o is null or a is null or s is null then
    raise exception 'create the 3 users first (owner/admin/staff @smartstock.test)';
  end if;
  if exists (select 1 from profiles where user_id in (o, a, s)) then
    raise exception 'these users already have a profile; nothing done';
  end if;

  insert into companies(company_name) values ('Kedai Buah Demo') returning company_id into cid;
  insert into company_settings(company_id) values (cid);
  insert into profiles(user_id, company_id, full_name, email, role, is_active) values
    (o, cid, 'Syahmi', 'owner@smartstock.test', 'owner', true),
    (a, cid, 'Aina',   'admin@smartstock.test', 'admin', true),
    (s, cid, 'Staff',  'staff@smartstock.test', 'staff', true);

  -- act as the owner so the seed function knows which company
  perform set_config('request.jwt.claim.sub', o::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', o)::text, true);
  perform seed_demo_fruit_shop();
end $$;

select 'products' t, count(*) from products union all
select 'batches', count(*) from batches union all
select 'profiles', count(*) from profiles union all
select 'open alerts', count(*) from alerts where alert_status='open';
