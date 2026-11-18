import { createClient } from '@supabase/supabase-js';

// The URL and the public key come from the .env file (see .env.example).
// Only the publishable / anon key belongs here. Never use the service_role or secret key in the web app.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

// If .env is missing we export null instead of crashing the whole app,
// so the sample-data pages keep working while Supabase is being wired in.
export const supabase = supabaseConfigured ? createClient(url, key) : null;
