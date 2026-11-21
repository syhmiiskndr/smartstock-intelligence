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

  const [profiles, companies, overview, batches, txs, wastes, settings, vendors] = await Promise.all([
    supabase.from('profiles').select('user_id, full_name, role, company_id, is_active, email'),
    supabase.from('companies').select('company_id, company_name'),
    supabase.from('product_overview').select('*').order('product_name'),
    supabase.from('batches').select('product_id, vendor_id, unit_cost, current_quantity, received_date, vendors(vendor_name)')
      .eq('status', 'active').is('deleted_at', null).order('received_date', { ascending: false }),
    supabase.from('stock_transactions')
      .select('batch_id, user_id, transaction_type, quantity_change, created_at, batches(product_id, unit_cost)')
      .gte('created_at', since14).order('created_at', { ascending: false }).limit(1000),
    supabase.from('waste_records').select('waste_cost, recorded_at, batches(product_id)').gte('recorded_at', since7),
    supabase.from('company_settings').select('*').maybeSingle(),
    supabase.from('vendors').select('vendor_id, vendor_name, contact_person_name, phone_number, lead_time_days').is('deleted_at', null).order('vendor_name'),
  ]);
  const prof = orThrow(profiles), comp = orThrow(companies), ov = orThrow(overview), bat = orThrow(batches),
    tx = orThrow(txs), ws = orThrow(wastes), vend = orThrow(vendors);
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
  const products = ov.map((p) => {
    const a = agg[p.product_id] || {};
    const reorder = num(p.min_stock_threshold) || 1;
    const name = p.product_name;
    return {
      id: String(p.product_id), dbId: p.product_id,
      name, en: FRUIT_EN[name.toLowerCase()] || name,
      unit: UNIT[p.unit_of_measure] || 'kg',
      qty: num(p.on_hand), cap: num(p.capacity) || reorder * 4, reorder,
      cost: a.q > 0 ? a.v / a.q : 0,
      exp: p.next_expiry ? Math.max(0, dayDiff(p.next_expiry, new Date())) : 999,
      avg: Math.max(num(p.avg_daily_use), 0.05),
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

  // products each supplier delivers (from their active batches)
  const items = {};
  for (const b of bat) { const pr = pid[b.product_id]; if (pr && b.vendor_id) (items[b.vendor_id] ||= new Set()).add(pr.id); }
  const vendorsOut = vend.map((v) => ({ id: v.vendor_id, name: v.vendor_name, contact: v.contact_person_name || '', phone: v.phone_number || '',
    lead: v.lead_time_days == null ? 2 : v.lead_time_days, items: [...(items[v.vendor_id] || [])] }));

  return {
    vendors: vendorsOut,
    me: { id: user.id, companyId: meRow.company_id, name: meRow.full_name || 'You', role: meRow.role, company: (comp[0] && comp[0].company_name) || '' },
    products, use, series, moves, waste,
    rules: { adminFinance: !!st.admin_can_see_finance },
    team: prof.map((p) => ({ id: p.user_id, name: p.full_name || p.email || 'Member', role: p.role, active: p.is_active !== false, email: p.email || '' })),
  };
}

/* ---- writes: all go through database functions that check role and stock ---- */
const rpc = async (fn, args) => { const { error, data } = await supabase.rpc(fn, args); if (error) throw error; return data; };

export const usage = (p, q) => rpc('record_usage', { p_product: p.dbId, p_qty: q });

export const receive = (p, q) =>
  rpc('receive_stock', { p_product: p.dbId, p_vendor: p.supId, p_qty: q, p_unit_cost: p.cost || null, p_expiry: null, p_notes: null });

// staff cannot add stock by themselves: they send a request that an owner/admin approves
export async function requestStockIn(p, q) {
  const user = await currentUser();
  const { data: prof } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  const { error } = await supabase.from('stock_in_requests').insert({
    company_id: prof.company_id, submitted_by: user.id, product_id: p.dbId, vendor_id: p.supId, quantity: q,
    unit_cost: p.cost || null, status: 'pending',
  });
  if (error) throw error;
}

// waste is taken from the oldest-expiry batches first (expired batches included)
export async function waste(p, q, reason = 'spoiled') {
  const { data, error } = await supabase.from('batches').select('batch_id, current_quantity')
    .eq('product_id', p.dbId).eq('status', 'active').is('deleted_at', null).gt('current_quantity', 0)
    .order('expiry_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  let left = q;
  for (const b of data) {
    if (left <= 0) break;
    const take = Math.min(num(b.current_quantity), left);
    await rpc('record_waste', { p_batch: b.batch_id, p_qty: take, p_reason: reason, p_inspection: null });
    left -= take;
  }
  if (left > 0.0001) throw new Error('Not enough stock to write off');
}

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
const must = (r) => { if (r.error) throw r.error; return r.data; };
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
