/* Supabase data layer for the voice UI.
 * Turns database rows into the shapes the UI already uses (products, moves, waste, ...),
 * and wraps the safe database functions (record_usage, receive_stock, record_waste, ...).
 * The demo account never touches this file's network calls. */
import { supabase, supabaseConfigured } from '../lib/supabaseClient';

export const dataReady = supabaseConfigured;

// "owner" -> owner@smartstock.test, a real email is used as it is
const emailOf = (u) => (u.includes('@') ? u : u + '@smartstock.test');

export async function signIn(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: emailOf(username), password });
  if (error) throw error;
  return data.user;
}
export async function signOut() {
  try { await supabase.auth.signOut(); } catch (e) { /* offline: the local session is cleared anyway */ }
}
export async function currentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session ? data.session.user : null;
}

// Malay name -> English name for the UI's two-language labels
const FRUIT_EN = {
  'epal fuji': 'Fuji apple', 'oren sunkist': 'Sunkist orange', 'pisang berangan': 'Banana', tembikai: 'Watermelon',
  betik: 'Papaya', 'mangga harumanis': 'Harumanis mango', 'anggur merah': 'Red grapes', strawberi: 'Strawberry',
  nanas: 'Pineapple', 'jambu batu': 'Guava',
};
const UNIT = { kg: 'kg', g: 'kg', pcs: 'biji' };
const day0 = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const dayDiff = (a, b) => Math.round((day0(a) - day0(b)) / 864e5);
const num = (v) => (v == null ? 0 : Number(v));
const hhmm = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
let CID = null; // company id of the signed-in user, set by loadAll
const orThrow = (r) => { if (r.error) throw r.error; return r.data || []; };

export async function loadAll() {
  const user = await currentUser();
  if (!user) throw new Error('not signed in');
  const since14 = new Date(Date.now() - 14 * 864e5).toISOString();
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();

  // refresh alerts first so the list below is current (ignore failures: alerts are a convenience)
  try { await supabase.rpc('refresh_alerts'); } catch (e) { /* ignore */ }
  // forecasts (stock-out days, reorder suggestions, draft purchase orders); throttled in SQL, failures are not fatal
  try { await supabase.rpc('generate_forecasts'); } catch (e) { /* ignore */ }
  const todayISO = new Date().toISOString().slice(0, 10);
  const [profiles, companies, overview, batches, txs, wastes, settings, vendors, alertsQ, approvalsQ, stockInQ, posQ, expiredQ, forecastsQ] = await Promise.all([
    supabase.from('profiles').select('user_id, full_name, role, company_id, is_active, email'),
    supabase.from('companies').select('*'),
    supabase.from('product_overview').select('*').order('product_name'),
    supabase.from('batches').select('product_id, vendor_id, unit_cost, current_quantity, received_date, vendors(vendor_name)')
      .eq('status', 'active').is('deleted_at', null).order('received_date', { ascending: false }),
    supabase.from('stock_transactions')
      .select('batch_id, user_id, transaction_type, quantity_change, created_at, batches(product_id, unit_cost)')
      .gte('created_at', since14).order('created_at', { ascending: false }).limit(1000),
    supabase.from('waste_records').select('waste_cost, recorded_at, batches(product_id)').gte('recorded_at', since7),
    supabase.from('company_settings').select('*').maybeSingle(),
    supabase.from('vendors').select('vendor_id, vendor_name, contact_person_name, phone_number, lead_time_days').is('deleted_at', null).order('vendor_name'),
    supabase.from('alerts').select('alert_id, alert_type, product_id, created_at').eq('alert_status', 'open').order('created_at', { ascending: false }).limit(30),
    supabase.from('approvals').select('approval_id, kind, payload, requested_by, created_at').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('stock_in_requests').select('request_id, submitted_by, product_id, vendor_id, quantity, unit_cost, created_at').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('purchase_orders').select('po_id, status, created_at, expected_date, vendors(vendor_name), purchase_order_items(product_id, quantity, unit_cost)')
      .in('status', ['ordered', 'received']).order('created_at', { ascending: false }).limit(20),
    supabase.from('batches').select('product_id, current_quantity, unit_cost').in('status', ['active', 'expired']).is('deleted_at', null)
      .gt('current_quantity', 0).lt('expiry_date', todayISO),
    supabase.from('forecasts').select('*').not('forecast_date', 'is', null).order('generated_at', { ascending: false }).limit(300),
  ]);
  const prof = orThrow(profiles), comp = orThrow(companies), ov = orThrow(overview), bat = orThrow(batches),
    tx = orThrow(txs), ws = orThrow(wastes), vend = orThrow(vendors);
  const alertRows = alertsQ.data || [], apprRows = approvalsQ.data || [], inRows = stockInQ.data || [], poRows = posQ.data || [], expRows = expiredQ.data || [];
  const st = settings.data || {};
  const meRow = prof.find((p) => p.user_id === user.id);
  if (!meRow) { const e = new Error('This account has no company yet.'); e.code = 'NO_COMPANY'; throw e; }
  CID = meRow.company_id;
  const names = Object.fromEntries(prof.map((p) => [p.user_id, p.full_name || '']));

  // per product: weighted average cost and the usual supplier from active batches
  const agg = {};
  for (const b of bat) {
    const a = (agg[b.product_id] ||= { q: 0, v: 0, sup: null, supId: null });
    a.q += num(b.current_quantity); a.v += num(b.current_quantity) * num(b.unit_cost);
    if (!a.sup && b.vendors) { a.sup = b.vendors.vendor_name; a.supId = b.vendor_id; }
  }
  // newest forecast per product
  const fcBy = {};
  for (const f of (forecastsQ.data || [])) if (!fcBy[f.product_id]) fcBy[f.product_id] = f;
  const products = ov.map((p) => {
    const a = agg[p.product_id] || {};
    const f = fcBy[p.product_id];
    const fa = f && f.method !== 'rules' ? num(f.avg_daily_demand) : 0;
    const fc = f ? {
      method: f.method, dataDays: f.data_days || 0, conf: num(f.confidence), level: num(f.avg_daily_demand),
      days: f.days_to_stockout == null ? null : num(f.days_to_stockout), stockoutDate: f.stockout_date,
      lead: f.lead_time_days, rp: num(f.reorder_point), safety: num(f.safety_stock), need: !!f.reorder_needed, qty: num(f.suggested_order_qty),
      urgency: f.urgency, trend: f.trend_pct == null ? null : num(f.trend_pct), atRisk: num(f.at_risk_qty), incoming: num(f.incoming_qty),
    } : null;
    const reorder = num(p.min_stock_threshold) || 1;
    const name = p.product_name;
    return {
      id: String(p.product_id), dbId: p.product_id,
      name, en: FRUIT_EN[name.toLowerCase()] || name,
      unit: UNIT[p.unit_of_measure] || 'kg',
      shelf: p.shelf_life_days || null,
      qty: num(p.on_hand), cap: num(p.capacity) || reorder * 4, reorder,
      cost: a.q > 0 ? a.v / a.q : 0,
      exp: p.next_expiry ? Math.max(0, dayDiff(p.next_expiry, new Date())) : 999,
      avg: Math.max(fa || num(p.avg_daily_use), 0.05), fc,
      sup: a.sup || (vend[0] && vend[0].vendor_name) || '-', supId: a.supId || (vend[0] && vend[0].vendor_id) || null,
    };
  });
  const pid = Object.fromEntries(products.map((p) => [p.dbId, p]));

  // today's usage, 6 earlier days of usage cost, recent moves
  const use = Object.fromEntries(products.map((p) => [p.id, 0]));
  const series = [0, 0, 0, 0, 0, 0];
  const moves = [];
  const today = new Date();
  for (const t of tx) {
    const pr = t.batches && pid[t.batches.product_id];
    if (!pr) continue;
    const q = Math.abs(num(t.quantity_change));
    if (t.transaction_type === 'usage') {
      const ago = dayDiff(today, t.created_at);
      if (ago === 0) use[pr.id] += q;
      else if (ago >= 1 && ago <= 6) series[6 - ago] += q * num(t.batches.unit_cost);
    }
    if (moves.length < 12 && ['usage', 'receive', 'waste'].includes(t.transaction_type)) {
      moves.push({ p: pr.id, type: t.transaction_type, q, t: dayDiff(today, t.created_at) === 0 ? hhmm(t.created_at) : 'Yesterday', who: names[t.user_id] || 'Staff' });
    }
  }
  // waste cost per product over 7 days (UI needs at least one row)
  const wmap = {};
  for (const w of ws) { const pr = w.batches && pid[w.batches.product_id]; if (pr) wmap[pr.name] = (wmap[pr.name] || 0) + num(w.waste_cost); }
  let waste = Object.entries(wmap).map(([n, amt]) => ({ n, amt })).sort((a, b) => b.amt - a.amt);
  if (!waste.length) waste = [{ n: '-', amt: 0.01 }];

  const vname = Object.fromEntries(vend.map((v) => [v.vendor_id, v.vendor_name]));
  const requests = [];
  for (const a of apprRows) {
    const pl = a.payload || {};
    if (a.kind === 'purchase_order') {
      const it = (pl.items && pl.items[0]) || {}; const pr = pid[it.product_id]; if (!pr) continue;
      requests.push({ id: 'a' + a.approval_id, db: { t: 'approval', id: a.approval_id }, kind: 'order', item: pr.id, qty: num(it.quantity),
        amount: num(it.quantity) * (num(it.unit_cost) || pr.cost), supplier: vname[pl.vendor_id] || pr.sup, by: pl.auto ? 'SmartStock AI' : names[a.requested_by] || 'Staff', rkey: pl.auto ? 'ai' : 'low', status: 'pending' });
    } else if (a.kind === 'waste') {
      const pr = pid[pl.product_id]; if (!pr) continue;
      requests.push({ id: 'a' + a.approval_id, db: { t: 'approval', id: a.approval_id }, kind: 'writeoff', item: pr.id, qty: num(pl.qty),
        amount: num(pl.qty) * pr.cost, by: names[a.requested_by] || 'Staff', rkey: pl.reason === 'expired' ? 'exp' : 'rep', status: 'pending' });
    }
  }
  for (const r of inRows) {
    const pr = pid[r.product_id]; if (!pr) continue;
    requests.push({ id: 's' + r.request_id, db: { t: 'stockin', id: r.request_id }, kind: 'stockin', item: pr.id, qty: num(r.quantity),
      amount: num(r.quantity) * (num(r.unit_cost) || pr.cost), supplier: vname[r.vendor_id] || pr.sup, by: names[r.submitted_by] || 'Staff', rkey: 'in', status: 'pending' });
  }
  const orders = [];
  for (const o of poRows) {
    const it = (o.purchase_order_items || [])[0]; const pr = it && pid[it.product_id]; if (!pr) continue;
    const arrived = o.expected_date && dayDiff(o.expected_date, new Date()) <= 0;
    orders.push({ no: o.po_id, poId: o.po_id, item: pr.id, qty: (o.purchase_order_items || []).reduce((s, i) => s + num(i.quantity), 0),
      sup: (o.vendors && o.vendors.vendor_name) || pr.sup, step: o.status === 'received' ? 3 : arrived ? 3 : 1, done: o.status === 'received', more: (o.purchase_order_items || []).length - 1 });
  }
  const alerts = alertRows.map((a) => ({ id: a.alert_id, type: a.alert_type, pid: String(a.product_id), t: a.created_at })).filter((a) => pid[a.pid] || products.find((p) => p.id === a.pid));
  const expired = { n: expRows.length, value: expRows.reduce((s, b) => s + num(b.current_quantity) * num(b.unit_cost), 0) };

  // products each supplier delivers (from their active batches)
  const items = {};
  for (const b of bat) { const pr = pid[b.product_id]; if (pr && b.vendor_id) (items[b.vendor_id] ||= new Set()).add(pr.id); }
  const vendorsOut = vend.map((v) => ({ id: v.vendor_id, name: v.vendor_name, contact: v.contact_person_name || '', phone: v.phone_number || '',
    lead: v.lead_time_days == null ? 2 : v.lead_time_days, items: [...(items[v.vendor_id] || [])] }));

  return {
    vendors: vendorsOut, requests, orders, alerts, expired,
    me: { id: user.id, companyId: meRow.company_id, name: meRow.full_name || 'You', role: meRow.role, company: (comp[0] && comp[0].company_name) || '', isDemo: !!(comp[0] && comp[0].is_demo) },
    products, use, series, moves, waste,
    rules: { adminFinance: !!st.admin_can_see_finance, limit: num(st.waste_approval_limit) || 50 },
    team: prof.map((p) => ({ id: p.user_id, name: p.full_name || p.email || 'Member', role: p.role, active: p.is_active !== false, email: p.email || '' })),
  };
}

/* ---- writes: all go through database functions that check role and stock ---- */
const rpc = async (fn, args) => { const { error, data } = await supabase.rpc(fn, args); if (error) throw error; return data; };

/* sample data: load the fruit-shop sample into an empty company, or wipe and reload it on a demo company */
export const seedSample = () => rpc('seed_demo_fruit_shop');
export const resetDemo = () => rpc('reset_demo');
export const usage = (p, q) => rpc('record_usage', { p_product: p.dbId, p_qty: q });

// o = { vendorId, cost, expiry (YYYY-MM-DD), notes }
export const receive = (p, q, o = {}) =>
  rpc('receive_stock', { p_product: p.dbId, p_vendor: o.vendorId || p.supId || null, p_qty: q, p_unit_cost: o.cost != null ? o.cost : (p.cost || null),
    p_expiry: o.expiry || null, p_notes: o.notes || null });

// staff cannot add stock by themselves: they send a request that an owner/admin approves
export async function requestStockIn(p, q, o = {}) {
  const user = await currentUser();
  const { data: prof } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  const { error } = await supabase.from('stock_in_requests').insert({
    company_id: prof.company_id, submitted_by: user.id, product_id: p.dbId, vendor_id: o.vendorId || p.supId || null, quantity: q,
    unit_cost: o.cost != null ? o.cost : (p.cost || null), expiry_date: o.expiry || null, notes: o.notes || null, status: 'pending' });
  if (error) throw error;
}
export const reviewStockIn = (id, ok, reason) => rpc('review_stock_in', { p_request: id, p_approve: ok, p_reason: reason || null });

// waste is taken from the oldest-expiry batches first (expired batches included); staff over the limit are refused
export const waste = (p, q, reason = 'spoiled') => rpc('record_waste_product', { p_product: p.dbId, p_qty: q, p_reason: reason });
export const writeOffExpired = () => rpc('write_off_expired', {});

export const requestWaste = (p, q, reason = 'spoiled') => rpc('request_approval', { p_kind: 'waste', p_payload: { product_id: p.dbId, qty: q, reason } });
export const decideApproval = (id, ok, reason) => rpc('decide_approval', { p_approval: id, p_approve: ok, p_reason: reason || null });

/* ---- purchase orders ---- */
const poItems = (p, q) => [{ product_id: p.dbId, quantity: q, unit_cost: p.cost || null }];
const needVendor = (p) => { if (!p.supId) throw new Error('Add a supplier first (People page).'); return p.supId; };
export const requestPO = (p, q) => rpc('request_approval', { p_kind: 'purchase_order', p_payload: { vendor_id: needVendor(p), items: poItems(p, q), note: null } });
export const createPO = (p, q) => rpc('create_purchase_order', { p_vendor: needVendor(p), p_items: poItems(p, q), p_note: null });
export const receivePO = (id) => rpc('receive_purchase_order', { p_po: id });
export const cancelPO = (id) => rpc('cancel_purchase_order', { p_po: id });

/* ---- stock count and alerts ---- */
export const adjust = (p, counted, reason) => rpc('adjust_stock', { p_product: p.dbId, p_counted: counted, p_reason: reason || 'stock count' });
export const ackAlerts = (ids) => ids.length ? rpc('acknowledge_alerts', { p_ids: ids }) : Promise.resolve(0);

/* ---- edit items and suppliers (owner/admin; RLS enforces it) ---- */
export const updateProduct = (dbId, v) => supabase.from('products').update({
  product_name: v.name, unit_of_measure: v.unit, min_stock_threshold: Number(v.reorder) || 0, shelf_life_days: Number(v.shelf) || null,
  selling_price: Number(v.price) || null, capacity: Number(v.reorder) ? Number(v.reorder) * 4 : null }).eq('product_id', dbId).then(must);
export const updateVendor = (id, v) => supabase.from('vendors').update({
  vendor_name: v.name, contact_person_name: v.contact || null, phone_number: v.phone || null, lead_time_days: Number(v.lead) || 2 }).eq('vendor_id', id).then(must);
/* ---- onboarding: register, create a company or join with an invite code ---- */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data; // data.session is null when the project requires email confirmation
}
export const createCompany = (name, registration, fullName) =>
  rpc('create_company', { p_name: name, p_registration: registration || null, p_full_name: fullName || null });
export const joinCompany = (code, fullName) => rpc('join_company', { p_code: code, p_full_name: fullName || null });

/* ---- team ---- */
export const createInvite = (role) => rpc('create_invite', { p_role: role });
export const setMember = (id, role, active) => rpc('set_member', { p_user: id, p_role: role, p_active: active });

/* ---- suppliers and items (owner/admin only; RLS enforces it). Delete = soft delete, history stays ---- */
function must(r) { if (r.error) throw r.error; return r.data; }
export const addVendor = (v) => supabase.from('vendors').insert({
  company_id: CID, vendor_name: v.name, contact_person_name: v.contact || null, phone_number: v.phone || null,
  lead_time_days: Number(v.lead) || 2 }).then(must);
export const removeVendor = (id) => supabase.from('vendors').update({ deleted_at: new Date().toISOString() }).eq('vendor_id', id).then(must);

export async function addProduct(v) {
  const row = must(await supabase.from('products').insert({
    company_id: CID, sku: 'P' + Date.now().toString(36).toUpperCase(), product_name: v.name, unit_of_measure: v.unit || 'kg',
    min_stock_threshold: Number(v.reorder) || 0, shelf_life_days: Number(v.shelf) || null, selling_price: Number(v.price) || null,
    capacity: Number(v.reorder) ? Number(v.reorder) * 4 : null }).select('product_id').single());
  if (Number(v.stock) > 0) await rpc('receive_stock', { p_product: row.product_id, p_vendor: v.vendor ? Number(v.vendor) : null,
    p_qty: Number(v.stock), p_unit_cost: Number(v.cost) || null, p_expiry: null, p_notes: 'opening stock' });
  return row.product_id;
}
export const removeProduct = (dbId) => supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('product_id', dbId).then(must);
