/* Talks to the SmartStock AI service (ai/service in this repo): POST /inspect with one photo.
 * Set VITE_AI_SERVICE_URL in .env (e.g. http://localhost:8000). Empty = the Fresh page keeps its "coming soon" message.
 * Do NOT put the service's AI_SERVICE_KEY in the web app: anything in the browser can be read by anyone. */
const BASE = String(import.meta.env?.VITE_AI_SERVICE_URL || '').replace(/\/+$/, '');

export const aiConfigured = Boolean(BASE);

const MAX_SIDE = 1600; // phone photos are huge; this keeps the upload small and fast

/** Shrinks a camera photo to a JPEG (max 1600 px). Falls back to the original file if the browser cannot. */
async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.9));
    return blob || file;
  } catch {
    return file;
  }
}

/** Sends one photo. Resolves with the service's JSON ({ items:[...], model_version, elapsed_ms }). */
export async function inspectPhoto(file, { expectedFruit = '', baseUrl = BASE, resize = true, timeoutMs = 30000 } = {}) {
  const body = new FormData();
  const photo = resize ? await shrink(file) : file;
  body.append('file', photo, 'photo.jpg');
  if (expectedFruit) body.append('expected_fruit', expectedFruit);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${baseUrl}/inspect`, { method: 'POST', body, signal: ctl.signal });
  } catch (e) {
    const err = new Error(e.name === 'AbortError' ? 'timeout' : 'network');
    err.kind = err.message;
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).detail || ''; } catch { /* not JSON */ }
    const err = new Error(detail || `HTTP ${res.status}`);
    err.kind = 'http';
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Turns the service answer into what the Fresh page shows. Shows the biggest fruit, but asks for a check if ANY fruit needs one. */
export function toScanResult(json) {
  // An item without a box means the detector found no fruit; the classifier then only guessed on the whole photo.
  const items = (json.items || []).filter((x) => x.bbox);
  const it = items[0];
  if (!it) return { none: true, count: 0, ms: json.elapsed_ms };
  const flagged = items.find((x) => x.needs_confirmation); // any fruit that needs a worker check flags the whole photo
  return {
    bad: it.freshness === 'rotten',
    conf: Math.round((it.confidence || 0) * 100),
    fruit: it.fruit,
    stage: it.stage || (it.freshness === 'rotten' ? 'rotten' : 'fresh'),
    needs: Boolean(flagged),
    reason: (flagged && flagged.reason) || '',
    count: items.length,
    ms: json.elapsed_ms,
    row: it.inspection_row || null,
  };
}
