// Small formatting helpers used across the app.
export const r2 = (n) => Math.round(n * 100) / 100;
export const fq = (n) => {
  n = r2(n);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};
export const rm = (n) => 'RM ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const rm0 = (n) => 'RM ' + Math.round(n).toLocaleString('en-US');
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const hhmm = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
