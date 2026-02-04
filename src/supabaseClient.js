import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging sederhana untuk mematikan error "Required"
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Waduh! Kunci Supabase tidak terbaca di .env. Pastikan awalan VITE_ sudah benar.",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder",
);
