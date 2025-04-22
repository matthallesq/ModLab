import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log for debugging (remove in production)
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key available:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing");
}

export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || "",
);
