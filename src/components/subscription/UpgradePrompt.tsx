import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  title: string;
  description: string;
  currentTier: string;
  requiredTier: string;
}

export default function UpgradePrompt({
  title = "Feature not available",
  description = "This feature requires a higher subscription tier",
  currentTier = "Startup",
  requiredTier = "Professional",
}: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{description}</p>
        <p className="mb-4">
          Your current plan: <strong>{currentTier}</strong>
        </p>
        <p className="mb-4">
          Required plan: <strong>{requiredTier}</strong>
        </p>
        <Button onClick={() => navigate("/subscription")} variant="outline">
          Upgrade Subscription
        </Button>
      </AlertDescription>
    </Alert>
  );
}
