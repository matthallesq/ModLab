import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SubscriptionLimitWarningProps {
  resourceType: string;
  currentCount: number;
  maxAllowed: number;
  tierName: string;
}

export function SubscriptionLimitWarning({
  resourceType,
  currentCount,
  maxAllowed,
  tierName,
}: SubscriptionLimitWarningProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            {resourceType} limit reached
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            You've used {currentCount} of {maxAllowed} available{" "}
            {resourceType.toLowerCase()} on your {tierName} plan.
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => navigate("/subscription")}
            >
              Upgrade your plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
