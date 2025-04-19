import React from "react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function SubscriptionBadge() {
  const { subscription, isLoading } = useSubscription();

  if (isLoading || !subscription || !subscription.tier) {
    return null;
  }

  const getVariant = () => {
    switch (subscription.tier?.name) {
      case "Startup":
        return "outline";
      case "Professional":
        return "secondary";
      case "Unlimited":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariant()} className="ml-2">
      {subscription.tier.name}
    </Badge>
  );
}
