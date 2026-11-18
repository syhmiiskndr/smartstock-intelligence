import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';

export const path = '/supabase-check';
export const title = 'Supabase check · SmartStock';

// Temporary developer page: shows whether the web app can reach Supabase.
// Delete this file once the real pages read from Supabase.
export default function SupabaseCheck() {
  const [result, setResult] = useState({ state: 'checking', message: 'Checking...' });

  useEffect(() => {
    if (!supabaseConfigured) {
      setResult({
        state: 'bad',
        message: 'No keys found. Create a .env file (copy .env.example), fill in the two values, then restart npm run dev.',
      });
      return;
    }
    supabase
      .from('companies')
      .select('company_id', { count: 'exact', head: true })
      .then(({ error, status }) => {
        if (!error) {
          setResult({ state: 'ok', message: `Connected to Supabase (HTTP ${status}). Not signed in, so RLS may show 0 rows; that is expected.` });
        } else if (status === 401 || status === 403 || error.code === '42501') {
          setResult({ state: 'ok', message: `Reached Supabase, and RLS blocked anonymous reads (${error.message}). This is the secure behaviour and means the connection works.` });
        } else if (status === 0 || /fetch/i.test(error.message)) {
          setResult({ state: 'bad', message: `Could not reach Supabase. Check VITE_SUPABASE_URL. (${error.message})` });
        } else {
          setResult({ state: 'bad', message: `Supabase answered with an error: ${error.message} (HTTP ${status}). A wrong key usually shows here.` });
        }
      });
  }, []);

  const colour = result.state === 'ok' ? '#1a7f37' : result.state === 'bad' ? '#b3261e' : '#555';
  return (
    <div style={{ padding: 48, fontFamily: "'Instrument Sans', system-ui, sans-serif", color: '#14231E', maxWidth: 640 }}>
      <h1 style={{ marginTop: 0 }}>Supabase connection check</h1>
      <p style={{ color: colour, fontWeight: 600 }}>{result.message}</p>
      <p style={{ fontSize: 14, opacity: 0.7 }}>Temporary page for developers. It is safe to delete.</p>
    </div>
  );
}
