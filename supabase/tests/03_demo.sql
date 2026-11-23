-- LOCAL TEST ONLY. After 00 + 0002 + 0003 + 0004 + 0005.
\set ON_ERROR_STOP off
create or replace function as_email(e text) returns void language plpgsql security definer as $$ begin
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email=e), false); end $$;
grant execute on function as_email(text) to authenticated;
set role authenticated;

\echo == demo company is flagged (expect t)
select as_email('owner@smartstock.test');
select is_demo from companies;

\echo == admin and staff cannot reset (expect 2 errors)
select as_email('admin@smartstock.test');
select reset_demo();
select as_email('staff@smartstock.test');
select reset_demo();

\echo == owner: dirty the data, reset, expect 10 products and no waste/approvals
select as_email('owner@smartstock.test');
select record_waste_product((select product_id from products where sku='FR-APL'), 1, 'spoiled');
select request_approval('waste', jsonb_build_object('product_id',(select product_id from products where sku='FR-STR'),'qty',2,'reason','spoiled'));
select reset_demo() as items_after_reset;
select (select count(*) from products) as products, (select count(*) from vendors) as vendors,
       (select count(*) from waste_records) as waste, (select count(*) from approvals) as approvals;

\echo == reset twice is fine (expect 10)
select reset_demo();

\echo == a non-demo company cannot be reset, and starts empty (expect error + 0 products)
reset role;
insert into auth.users(email) values ('new@smartstock.test');
select as_email('new@smartstock.test');
set role authenticated;
select create_company('Kedai Baru', null, 'New Owner');
select reset_demo();
select count(*) as products_in_new_company from products;
select seed_demo_fruit_shop() as seeded_by_button;
select count(*) as products_after_seed from products;
