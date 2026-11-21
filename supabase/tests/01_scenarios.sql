-- LOCAL TEST ONLY. Run after 00_stub_and_team_schema.sql + 0002.
\set ON_ERROR_STOP off
insert into auth.users(id,email) values
 ('11111111-1111-1111-1111-111111111111','owner@a.com'),
 ('22222222-2222-2222-2222-222222222222','staff@a.com'),
 ('33333333-3333-3333-3333-333333333333','owner@b.com');
create or replace function as_user(u text) returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claim.sub', u, false); end $$;
grant execute on function as_user(text) to authenticated;

\echo == owner A creates company, seeds
set role authenticated; select as_user('11111111-1111-1111-1111-111111111111');
select create_company('Kedai Buah A','REG1','Syahmi');
select seed_demo_fruit_shop() as seeded;
select create_invite('staff') as code \gset
select stock_status, count(*) from product_overview group by 1 order by 1;
select count(*) as open_alerts from alerts where alert_status='open';

\echo == staff joins via invite
select as_user('22222222-2222-2222-2222-222222222222');
select join_company(:'code','Aina');
select auth_role();
\echo -- staff cannot insert product (expect RLS error)
insert into products(company_id,product_name) values (auth_company_id(),'hack');
\echo -- staff cannot write batches directly (expect error)
update batches set current_quantity=9999;
\echo -- staff cannot create PO (expect error)
select create_purchase_order(1,'[{"product_id":1,"quantity":5}]');
\echo -- staff usage FEFO ok
select record_usage((select product_id from products where sku='FR-APL'), 5, 'jual');
select on_hand from product_overview where sku='FR-APL';
\echo -- staff usage too much (expect error)
select record_usage((select product_id from products where sku='FR-BNN'), 5);
\echo -- staff requests approval for PO
select request_approval('purchase_order', jsonb_build_object('vendor_id',(select vendor_id from vendors limit 1),'items',jsonb_build_array(jsonb_build_object('product_id',(select product_id from products where sku='FR-BNN'),'quantity',20,'unit_cost',2.6))));
\echo -- staff submits stock-in request
insert into stock_in_requests(company_id,submitted_by,product_id,quantity,status)
 values (auth_company_id(),auth.uid(),(select product_id from products where sku='FR-BNN'),30,'pending');
\echo -- staff sees no audit logs
select count(*) as staff_audit_rows from audit_logs;

\echo == owner approves, receives
select as_user('11111111-1111-1111-1111-111111111111');
select decide_approval((select approval_id from approvals limit 1), true);
select receive_purchase_order((select po_id from purchase_orders limit 1));
select review_stock_in((select request_id from stock_in_requests limit 1), true);
select on_hand from product_overview where sku='FR-BNN';
select refresh_alerts() as new_alerts;
select record_waste((select batch_id from batches where batch_number='SEED-FR-APL'), 2, 'busuk');
select count(*) as audit_rows from audit_logs;
select count(*) as tx_rows from stock_transactions;

\echo == owner B isolated
select as_user('33333333-3333-3333-3333-333333333333');
select create_company('Kedai B');
select count(*) as b_products from products;
select count(*) as b_batches from batches;
select count(*) as b_tx from stock_transactions;
\echo -- B tries to reuse an invite
select join_company(:'code');
