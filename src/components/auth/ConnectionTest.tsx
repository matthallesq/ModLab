import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "../../../supabase/supabase";

export default function ConnectionTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [envVars, setEnvVars] = useState({
    hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  const testConnection = async () => {
    setStatus("loading");
    try {
      // Simple query to test connection
      const { error } = await supabase.from("users").select("id").limit(1);

      if (error) {
        throw error;
      }

      setStatus("success");
      setErrorDetails("");
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setStatus("error");
      setErrorDetails(error?.message || "Unknown error");
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-medium mb-4">Supabase Connection Test</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>VITE_SUPABASE_URL:</div>
          <div>{envVars.hasUrl ? "✅ Set" : "❌ Missing"}</div>

          <div>VITE_SUPABASE_ANON_KEY:</div>
          <div>{envVars.hasKey ? "✅ Set" : "❌ Missing"}</div>
        </div>

        <div className="flex items-center space-x-2">
          <div>Connection Status:</div>
          {status === "loading" && (
            <div className="text-yellow-500">Testing...</div>
          )}
          {status === "success" && (
            <div className="text-green-500">Connected ✓</div>
          )}
          {status === "error" && <div className="text-red-500">Failed ✗</div>}
        </div>

        {status === "error" && (
          <div className="text-sm bg-red-50 p-3 rounded border border-red-200 text-red-800">
            {errorDetails}
          </div>
        )}

        <Button
          onClick={testConnection}
          size="sm"
          variant={status === "error" ? "destructive" : "outline"}
        >
          Test Again
        </Button>
      </div>
    </div>
  );
}
