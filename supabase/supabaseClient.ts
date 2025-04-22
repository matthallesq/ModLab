import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log for debugging (remove in production)
console.log("Supabase URL available:", !!supabaseUrl);
console.log("Supabase Anon Key available:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
  );
}

// Create client with additional options for better reliability
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application-name": "modellab",
    },
  },
  // Add fetch implementation with timeout and retry logic
  fetch: (url, options) => {
    const fetchWithTimeout = (timeout) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      return fetch(url, {
        ...options,
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          throw error;
        });
    };

    // Implement retry logic
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 10000; // 10 seconds

    const attemptFetch = (retriesLeft) => {
      return fetchWithTimeout(TIMEOUT_MS).catch((error) => {
        if (
          retriesLeft > 0 &&
          (error.name === "AbortError" || error.message === "Failed to fetch")
        ) {
          console.log(
            `Fetch attempt failed, retrying... (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`,
          );
          return new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
            .then(() => attemptFetch(retriesLeft - 1));
        }
        throw error;
      });
    };

    return attemptFetch(MAX_RETRIES);
  },
});
