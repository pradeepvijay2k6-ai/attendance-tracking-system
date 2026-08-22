const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://lbafexslnhilrrfbgbfi.supabase.co";
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "sb_publishable_osNCCZWZcaFlz5J_BlgKZQ_hpzoziSc";

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

module.exports = supabase;