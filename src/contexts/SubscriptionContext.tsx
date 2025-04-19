import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../../supabase/supabase";
import {
  SubscriptionTier,
  UserSubscription,
  SubscriptionLimits,
} from "@/types/subscription";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  subscriptionTiers: SubscriptionTier[];
  limits: SubscriptionLimits | null;
  isLoading: boolean;
  error: string | null;
  changeTier: (tierId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string;
}

export const SubscriptionProvider = ({
  children,
  userId,
}: SubscriptionProviderProps) => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [subscriptionTiers, setSubscriptionTiers] = useState<
    SubscriptionTier[]
  >([]);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription tiers
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_tiers")
          .select("*");

        if (error) throw error;

        const formattedTiers = data.map((tier) => ({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          maxProjects: tier.max_projects,
          maxExperimentsPerProject: tier.max_experiments_per_project,
          features: tier.features,
          createdAt: tier.created_at,
          updatedAt: tier.updated_at,
        }));

        setSubscriptionTiers(formattedTiers);
      } catch (err) {
        console.error("Error fetching subscription tiers:", err);
        setError("Failed to load subscription tiers");
      }
    };

    fetchTiers();
  }, []);

  // Fetch user subscription
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select(
            `
            *,
            tier:tier_id(id, name, price, max_projects, max_experiments_per_project, features, created_at, updated_at)
          `,
          )
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          const formattedSubscription = {
            id: data.id,
            userId: data.user_id,
            tierId: data.tier_id,
            status: data.status,
            currentPeriodStart: data.current_period_start,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            paymentMethodId: data.payment_method_id,
            customerId: data.customer_id,
            tier: data.tier
              ? {
                  id: data.tier.id,
                  name: data.tier.name,
                  price: data.tier.price,
                  maxProjects: data.tier.max_projects,
                  maxExperimentsPerProject:
                    data.tier.max_experiments_per_project,
                  features: data.tier.features,
                  createdAt: data.tier.created_at,
                  updatedAt: data.tier.updated_at,
                }
              : undefined,
          };

          setSubscription(formattedSubscription);
          await fetchUsageLimits(formattedSubscription);
        } else {
          // If no subscription exists, assign the Startup tier by default
          const startupTier = subscriptionTiers.find(
            (tier) => tier.name === "Startup",
          );
          if (startupTier) {
            await createDefaultSubscription(userId, startupTier.id);
          }
        }
      } catch (err) {
        console.error("Error fetching user subscription:", err);
        setError("Failed to load subscription information");
      } finally {
        setIsLoading(false);
      }
    };

    if (subscriptionTiers.length > 0) {
      fetchUserSubscription();
    }
  }, [userId, subscriptionTiers]);

  const createDefaultSubscription = async (userId: string, tierId: string) => {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          tier_id: tierId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          cancel_at_period_end: false,
        })
        .select(
          `
          *,
          tier:tier_id(id, name, price, max_projects, max_experiments_per_project, features, created_at, updated_at)
        `,
        )
        .single();

      if (error) throw error;

      if (data) {
        const formattedSubscription = {
          id: data.id,
          userId: data.user_id,
          tierId: data.tier_id,
          status: data.status,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          paymentMethodId: data.payment_method_id,
          customerId: data.customer_id,
          tier: data.tier
            ? {
                id: data.tier.id,
                name: data.tier.name,
                price: data.tier.price,
                maxProjects: data.tier.max_projects,
                maxExperimentsPerProject: data.tier.max_experiments_per_project,
                features: data.tier.features,
                createdAt: data.tier.created_at,
                updatedAt: data.tier.updated_at,
              }
            : undefined,
        };

        setSubscription(formattedSubscription);
        await fetchUsageLimits(formattedSubscription);
      }
    } catch (err) {
      console.error("Error creating default subscription:", err);
      setError("Failed to create default subscription");
    }
  };

  const fetchUsageLimits = async (userSubscription: UserSubscription) => {
    if (!userId || !userSubscription.tier) return;

    try {
      // Get project count
      const { count: projectCount, error: projectError } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (projectError) throw projectError;

      // Get experiment count (assuming experiments are stored in a table)
      const { count: experimentsCount, error: expError } = await supabase
        .from("experiments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (expError && expError.code !== "PGRST116") throw expError;

      setLimits({
        projectCount: projectCount || 0,
        maxProjects: userSubscription.tier.maxProjects,
        experimentsCount: experimentsCount || 0,
        maxExperiments: userSubscription.tier.maxExperimentsPerProject,
        hasAdvancedCanvas:
          !!userSubscription.tier.features.advancedCanvas ||
          !!userSubscription.tier.features.allCanvas,
        hasAdvancedInsights:
          !!userSubscription.tier.features.advancedInsights ||
          !!userSubscription.tier.features.comprehensiveInsights,
        hasTeamCollaboration:
          !!userSubscription.tier.features.teamCollaboration ||
          !!userSubscription.tier.features.advancedTeamCollaboration,
        hasPrioritySupport: !!userSubscription.tier.features.prioritySupport,
      });
    } catch (err) {
      console.error("Error fetching usage limits:", err);
      setError("Failed to load usage information");
    }
  };

  const changeTier = async (tierId: string): Promise<boolean> => {
    if (!userId || !subscription) return false;

    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          tier_id: tierId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          cancel_at_period_end: false,
          updated_at: now.toISOString(),
        })
        .eq("id", subscription.id);

      if (error) throw error;

      await refreshSubscription();

      toast({
        title: "Subscription updated",
        description: "Your subscription has been successfully updated.",
      });

      return true;
    } catch (err) {
      console.error("Error changing subscription tier:", err);
      setError("Failed to update subscription");

      toast({
        title: "Error updating subscription",
        description:
          "There was a problem updating your subscription. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!userId || !subscription) return false;

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (error) throw error;

      await refreshSubscription();

      toast({
        title: "Subscription canceled",
        description:
          "Your subscription will be canceled at the end of the current billing period.",
      });

      return true;
    } catch (err) {
      console.error("Error canceling subscription:", err);
      setError("Failed to cancel subscription");

      toast({
        title: "Error canceling subscription",
        description:
          "There was a problem canceling your subscription. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  };

  const refreshSubscription = async (): Promise<void> => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          tier:tier_id(id, name, price, max_projects, max_experiments_per_project, features, created_at, updated_at)
        `,
        )
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data) {
        const formattedSubscription = {
          id: data.id,
          userId: data.user_id,
          tierId: data.tier_id,
          status: data.status,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          paymentMethodId: data.payment_method_id,
          customerId: data.customer_id,
          tier: data.tier
            ? {
                id: data.tier.id,
                name: data.tier.name,
                price: data.tier.price,
                maxProjects: data.tier.max_projects,
                maxExperimentsPerProject: data.tier.max_experiments_per_project,
                features: data.tier.features,
                createdAt: data.tier.created_at,
                updatedAt: data.tier.updated_at,
              }
            : undefined,
        };

        setSubscription(formattedSubscription);
        await fetchUsageLimits(formattedSubscription);
      }
    } catch (err) {
      console.error("Error refreshing subscription:", err);
      setError("Failed to refresh subscription information");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    subscription,
    subscriptionTiers,
    limits,
    isLoading,
    error,
    changeTier,
    cancelSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
