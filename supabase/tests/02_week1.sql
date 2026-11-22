-- LOCAL TEST ONLY. After 00 + 0002 + 0003 + 0004. Users from 0003 (owner/admin/staff @smartstock.test).
\set ON_ERROR_STOP off
create or replace function as_email(e text) returns void language plpgsql security definer as $$ begin
  perform set_config('request.jwt.claim.sub', (select id::text from auth.users where email=e), false); end $$;
grant execute on function as_email(text) to authenticated;
set role authenticated;

\echo == internals not callable by users (expect 3 permission errors)
select _create_batch(1,1,null,1,1,null,null,null);
select _waste_fefo(1,null,1,1,'x');
select _need_manager();

\echo == staff requests waste + PO + stock-in
select as_email('staff@smartstock.test');
select record_waste_product((select product_id from products where sku='FR-STR'), 4, 'spoiled');  -- strawberry cost*4 maybe over limit
select request_approval('waste', jsonb_build_object('product_id',(select product_id from products where sku='FR-STR'),'qty',2,'reason','spoiled'));
select request_approval('purchase_order', jsonb_build_object('vendor_id',(select vendor_id from vendors where vendor_name='Segar Jaya'),
  'items', jsonb_build_array(jsonb_build_object('product_id',(select product_id from products where sku='FR-BNN'),'quantity',30,'unit_cost',2.6))));
insert into stock_in_requests(company_id,submitted_by,product_id,vendor_id,quantity,unit_cost,status)
 values (auth_company_id(),auth.uid(),(select product_id from products where sku='FR-MNG'),(select vendor_id from vendors where vendor_name='Segar Jaya'),15,7.5,'pending');
\echo -- staff cannot decide or adjust (expect 2 errors)
select decide_approval((select approval_id from approvals limit 1), true);
select adjust_stock((select product_id from products where sku='FR-APL'), 1);

\echo == admin decides
select as_email('admin@smartstock.test');
select on_hand as strawberry_before from product_overview where sku='FR-STR';
select decide_approval((select approval_id from approvals where kind='waste'), true);
select on_hand as strawberry_after_waste from product_overview where sku='FR-STR';
select decide_approval((select approval_id from approvals where kind='purchase_order'), true);
select status, (select count(*) from purchase_order_items i where i.po_id=p.po_id) items from purchase_orders p;
select receive_purchase_order((select po_id from purchase_orders where status='ordered'));
select on_hand as banana_after_po from product_overview where sku='FR-BNN';
select review_stock_in((select request_id from stock_in_requests where status='pending'), true);
select on_hand as mango_after_stockin from product_overview where sku='FR-MNG';
select decide_approval((select approval_id from approvals where status='pending' limit 1), true);  -- expect 'approval not found'? none pending

\echo == stock count
select adjust_stock((select product_id from products where sku='FR-APL'), 10, 'count') as diff_down;
select on_hand as apple_after_down from product_overview where sku='FR-APL';
select adjust_stock((select product_id from products where sku='FR-APL'), 25, 'count') as diff_up;
select on_hand as apple_after_up from product_overview where sku='FR-APL';
select adjust_stock((select product_id from products where sku='FR-ORG'), 0, 'count');
select adjust_stock((select product_id from products where sku='FR-ORG'), 12, 'found');
select on_hand as orange_from_zero from product_overview where sku='FR-ORG';

\echo == expired stock
reset role; update batches set expiry_date = current_date - 1, received_date = current_date - 5 where batch_number='SEED-FR-GVA';
set role authenticated; select as_email('admin@smartstock.test');
select refresh_alerts() as new_alerts;
select alert_type, count(*) from alerts where alert_status='open' group by 1 order by 1;
select acknowledge_alerts(array(select alert_id from alerts where alert_status='open')) as acked;
select refresh_alerts() as new_after_ack;  -- expect 0 (no re-creation)
select write_off_expired() as wrote_off;
select refresh_alerts();
select alert_type, alert_status, count(*) from alerts group by 1,2 order by 1,2;
select count(*) as waste_rows from waste_records;
