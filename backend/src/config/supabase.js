const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) are missing in backend .env");
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

module.exports = supabase;