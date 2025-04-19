import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import PricingCard from "./PricingCard";
import SubscriptionDetails from "./SubscriptionDetails";
import PaymentForm from "./PaymentForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const {
    subscription,
    subscriptionTiers,
    limits,
    isLoading,
    error,
    changeTier,
    cancelSubscription,
  } = useSubscription();

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [activeTab, setActiveTab] = useState("current");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscription || !limits) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Subscription Not Found</AlertTitle>
        <AlertDescription>
          Unable to load your subscription information.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSelectTier = (tierId: string) => {
    setSelectedTierId(tierId);
    setShowPaymentForm(true);
    setActiveTab("plans");
  };

  const handlePaymentSuccess = async () => {
    if (selectedTierId) {
      const success = await changeTier(selectedTierId);
      if (success) {
        setShowPaymentForm(false);
        setSelectedTierId(null);
        setActiveTab("current");
      }
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedTierId(null);
  };

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setActiveTab("current");
    }
  };

  const selectedTier = selectedTierId
    ? subscriptionTiers.find((tier) => tier.id === selectedTierId)
    : null;

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ModelLab subscription
          </p>
        </div>
        <Button onClick={() => navigate("/projects")} variant="outline">
          Back to Projects
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SubscriptionDetails
                subscription={subscription}
                limits={limits}
              />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                  <CardDescription>
                    {subscription.cancelAtPeriodEnd
                      ? "Your subscription will be canceled at the end of the current billing period."
                      : "Your subscription is active and will renew automatically."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {subscription.cancelAtPeriodEnd ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <span>
                      Status:{" "}
                      <strong>
                        {subscription.cancelAtPeriodEnd
                          ? "Canceling"
                          : subscription.status}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span>
                      Next billing: ${subscription.tier?.price.toFixed(2)}/month
                    </span>
                  </div>

                  <div className="pt-4">
                    {!subscription.cancelAtPeriodEnd && (
                      <Button
                        onClick={handleCancelSubscription}
                        variant="outline"
                        className="w-full"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                    <Button
                      onClick={() => setActiveTab("plans")}
                      className="w-full mt-2"
                    >
                      Change Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          {showPaymentForm && selectedTier ? (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4">
                Upgrade to {selectedTier.name} Plan
              </h2>
              <PaymentForm
                amount={selectedTier.price}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancelPayment}
              />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6">Choose a Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionTiers.map((tier) => (
                  <PricingCard
                    key={tier.id}
                    tier={tier}
                    isCurrentPlan={subscription.tier?.id === tier.id}
                    onSelect={handleSelectTier}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
