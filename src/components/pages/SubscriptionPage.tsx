import React from "react";
import Toolbar from "@/components/dashboard/layout/Toolbar";
import SubscriptionManager from "@/components/subscription/SubscriptionManager";
import { useAuth } from "../../../supabase/auth";

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = React.useState<
    "startup" | "professional" | "unlimited"
  >("startup");

  // In a real app, you would fetch the user's subscription tier from the backend
  React.useEffect(() => {
    // Simulate fetching user subscription data
    const fetchSubscription = async () => {
      // This would be an API call in a real implementation
      // For demo purposes, we'll just set a random tier
      const tiers = ["startup", "professional", "unlimited"] as const;
      setCurrentTier(tiers[Math.floor(Math.random() * tiers.length)]);
    };

    fetchSubscription();
  }, [user]);

  const handleChangeTier = (tier: "startup" | "professional" | "unlimited") => {
    // In a real app, you would make an API call to update the user's subscription
    console.log(`Changing subscription tier to: ${tier}`);
    setCurrentTier(tier);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar activeItem="Subscription" />
      <div className="container mx-auto pt-24 px-4 pb-8">
        <SubscriptionManager
          currentTier={currentTier}
          onChangeTier={handleChangeTier}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
