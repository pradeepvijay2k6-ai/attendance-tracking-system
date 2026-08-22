import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lbafexslnhilrrfbgbfi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_osNCCZWZcaFlz5J_BlgKZQ_hpzoziSc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
