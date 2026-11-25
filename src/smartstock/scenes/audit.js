/* Scene "audit" – the activity log for owners and admins: who did what, newest first.
   Data comes from the database function audit_feed(): stock movements, item / supplier / order / approval / rule changes
   and completed tasks. Managers only (enforced in the database, not just hidden here). */
export default function auditScene(api) {
  const { S, L, esc, pn, P, sh, U, fq, ic } = api;

  const GROUPS = () => [['all', L('All', 'Semua')], ['stock', L('Stock', 'Stok')], ['catalog', L('Items and suppliers', 'Item dan pembekal')],
    ['orders', L('Orders and approvals', 'Order dan kelulusan')], ['rules', L('Rules', 'Tetapan')], ['tasks', L('Tasks', 'Tugas')]];

  const FIELD = () => ({ min_stock_threshold: L('reorder level', 'paras susun semula'), capacity: L('capacity', 'kapasiti'), shelf_life_days: L('shelf life', 'hayat simpanan'),
    product_name: L('name', 'nama'), unit_of_measure: L('unit', 'unit'), vendor_name: L('name', 'nama'), lead_time_days: L('delivery days', 'hari penghantaran'),
    contact_person_name: L('contact', 'kenalan'), phone_number: L('phone', 'telefon'), expiring_soon_days: L('expiry warning days', 'hari amaran luput'),
    approval_limit: L('approval limit', 'had kelulusan'), admin_can_see_finance: L('admin sees costs', 'admin nampak kos') });

  const group = (e) => e.src === 'stock' ? 'stock' : e.src === 'task' ? 'tasks'
    : ['products', 'vendors'].includes(e.table) ? 'catalog' : e.table === 'company_settings' ? 'rules' : 'orders';

  const pname = (e) => { const p = e.pid && P.find((x) => String(x.dbId) === String(e.pid)); return p ? pn(p) : (e.product || ''); };
  const val = (v) => v === null || v === undefined || v === '' ? L('empty', 'kosong') : typeof v === 'boolean' ? (v ? L('yes', 'ya') : L('no', 'tidak')) : String(v);
  const diff = (ch) => {
    const f = FIELD(), keys = Object.keys(ch || {}).filter((k) => k !== 'deleted_at');
    return keys.slice(0, 3).map((k) => `${f[k] || k.replace(/_/g, ' ')} ${val(ch[k].old)} → ${val(ch[k].new)}`).join(', ') + (keys.length > 3 ? ` +${keys.length - 3}` : '');
  };

  /* one sentence per event, in the current language */
  function text(e) {
    if (e.src === 'stock') {
      const n = pname(e), q = `${fq(Number(e.qty) || 0)} ${U(e.unit)}`;
      return ({ usage: L(`used ${q} ${n}`, `guna ${q} ${n}`), receive: L(`received ${q} ${n}`, `terima ${q} ${n}`), waste: L(`reported waste: ${q} ${n}`, `lapor sisa: ${q} ${n}`),
        adjust: L(`adjusted ${n} by ${q}`, `laras ${n} sebanyak ${q}`) })[e.type] || L(`${e.type}: ${q} ${n}`, `${e.type}: ${q} ${n}`);
    }
    if (e.src === 'task') return L(`completed task: ${e.title}`, `siap tugas: ${e.title}`);
    const ch = e.changes || {}, name = e.name || '', st = ch.status && ch.status.new, d = e.data || {};
    switch (e.table) {
      case 'products':
        if (e.action === 'INSERT') return L(`added item ${name}`, `tambah item ${name}`);
        if (ch.deleted_at && ch.deleted_at.new) return L(`removed item ${name}`, `buang item ${name}`);
        return L(`changed ${name}: ${diff(ch)}`, `ubah ${name}: ${diff(ch)}`);
      case 'vendors':
        if (e.action === 'INSERT') return L(`added supplier ${name}`, `tambah pembekal ${name}`);
        if (e.action === 'DELETE') return L(`removed supplier ${name}`, `buang pembekal ${name}`);
        return L(`changed supplier ${name}: ${diff(ch)}`, `ubah pembekal ${name}: ${diff(ch)}`);
      case 'purchase_orders':
        if (e.action === 'INSERT') return L(`created order PO #${e.id}`, `cipta order PO #${e.id}`);
        return st ? L(`order PO #${e.id} is now ${st}`, `order PO #${e.id} kini ${st}`) : L(`changed order PO #${e.id}`, `ubah order PO #${e.id}`);
      case 'approvals': {
        const kind = d.kind === 'purchase_order' ? L('order', 'order') : d.kind === 'waste' ? L('waste', 'sisa') : (d.kind || '');
        if (e.action === 'INSERT') return L(`requested approval: ${kind}`, `minta kelulusan: ${kind}`);
        return st === 'approved' ? L(`approved ${kind} request`, `lulus permintaan ${kind}`) : st === 'rejected' ? L(`rejected ${kind} request${d.reason ? ': ' + d.reason : ''}`, `tolak permintaan ${kind}${d.reason ? ': ' + d.reason : ''}`)
          : L(`updated ${kind} request`, `kemas kini permintaan ${kind}`);
      }
      case 'stock_in_requests':
        if (e.action === 'INSERT') return L('requested to add stock', 'minta tambah stok');
        return st === 'approved' ? L('approved a stock-in request', 'lulus permintaan stok masuk') : st === 'rejected' ? L('rejected a stock-in request', 'tolak permintaan stok masuk') : L('updated a stock-in request', 'kemas kini permintaan stok masuk');
      case 'company_settings': return L(`changed rules: ${diff(ch)}`, `ubah tetapan: ${diff(ch)}`);
      default: return `${e.action} ${e.table}`;
    }
  }

  const dayLabel = (d) => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const diffDays = Math.round((t - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
    return diffDays === 0 ? L('Today', 'Hari ini') : diffDays === 1 ? L('Yesterday', 'Semalam') : d.toLocaleDateString(S.lang === 'ms' ? 'ms-MY' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  const hhmm = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const csvCell = (v) => '"' + String(v).replace(/"/g, '""') + '"';

  function audit() {
    const A = S.auditV || { rows: [], more: false, loading: true, filter: 'all', err: '' };
    const rows = A.rows.filter((e) => A.filter === 'all' || group(e) === A.filter);
    let lastDay = '';
    const list = rows.map((e) => {
      const at = new Date(e.at), dl = dayLabel(at), head = dl !== lastDay ? `<h3 class="au-day">${esc(dl)}</h3>` : '';
      lastDay = dl;
      return `${head}<div class="au-row"><i class="au-av ${e.uid ? '' : 'ai'}">${esc((e.who || '?')[0].toUpperCase())}</i><div class="au-t"><b>${esc(e.who)}</b> ${esc(text(e))}</div><time>${hhmm(at)}</time></div>`;
    }).join('');
    const csv = 'time,who,area,what\n' + rows.map((e) => [new Date(e.at).toISOString(), e.who, group(e), text(e)].map(csvCell).join(',')).join('\n');
    return `${sh(L('Activity', 'Aktiviti'), L('Who did what, newest first. Only owners and admins can see this.', 'Siapa buat apa, terbaru dahulu. Hanya pemilik dan admin boleh lihat.'))}
    <div class="au-bar"><div class="row" role="group" aria-label="${L('Filter', 'Tapis')}">${GROUPS().map(([k, t]) => `<button class="chip" data-afilter="${k}" aria-pressed="${A.filter === k}">${t}</button>`).join('')}</div>
     ${rows.length ? `<a class="btn" download="smartstock-activity.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(csv)}">${L('Download CSV', 'Muat turun CSV')}</a>` : ''}</div>
    ${A.err ? `<p class="lg-err" role="alert">${esc(A.err)}</p>` : ''}
    <div class="au-list">${list || (A.loading ? `<p class="meta">${L('Loading…', 'Memuatkan…')}</p>` : `<p class="meta">${L('Nothing here yet. Actions by your team will show up as they happen.', 'Belum ada apa-apa. Tindakan pasukan anda akan dipaparkan di sini.')}</p>`)}</div>
    ${A.more && !A.loading ? `<div class="row" style="margin-top:14px"><button class="btn" data-amore="1">${L('Show older', 'Tunjuk lebih lama')}</button></div>` : ''}
    ${A.loading && rows.length ? `<p class="meta">${L('Loading…', 'Memuatkan…')}</p>` : ''}`;
  }

  return { audit };
}
