import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, CreditCard, AlertCircle } from "lucide-react";

interface SubscriptionManagerProps {
  currentTier: "startup" | "professional" | "unlimited";
  onChangeTier?: (tier: "startup" | "professional" | "unlimited") => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  currentTier = "startup",
  onChangeTier,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const handleConfirmChange = () => {
    if (!selectedTier) return;

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);

      if (onChangeTier) {
        onChangeTier(selectedTier.name);
      }

      // Close dialog after showing success message
      setTimeout(() => {
        setIsDialogOpen(false);
        setShowSuccess(false);
      }, 2000);
    }, 1500);
  };

  const getCurrentTierDetails = () => {
    return (
      SUBSCRIPTION_TIERS.find((tier) => tier.name === currentTier) ||
      SUBSCRIPTION_TIERS[0]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
      </div>

      {/* Current Plan */}
      <Card className="bg-white shadow-sm border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Current Plan</span>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {getCurrentTierDetails().displayName}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              You are currently on the{" "}
              <span className="font-medium">
                {getCurrentTierDetails().displayName}
              </span>{" "}
              plan at ${getCurrentTierDetails().price}/month.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Your plan includes:
              </h3>
              <ul className="space-y-2">
                {getCurrentTierDetails().features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-blue-800">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">
                Billing History
              </Button>
              <Button variant="outline" className="mr-2">
                Update Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <h3 className="text-xl font-semibold mt-8">Available Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={`shadow-sm hover:shadow-md transition-all duration-200 ${tier.name === currentTier ? "border-blue-300 bg-blue-50/30" : "border-gray-200"} ${tier.popular ? "border-2 border-blue-500" : ""}`}
          >
            {tier.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.displayName}</CardTitle>
              <p className="text-sm text-gray-500">{tier.description}</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${tier.name === currentTier ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" : tier.popular ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                disabled={tier.name === currentTier}
                onClick={() => handleSelectTier(tier)}
              >
                {tier.name === currentTier ? "Current Plan" : "Select Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showSuccess
                ? "Subscription Updated!"
                : `Change to ${selectedTier?.displayName} Plan?`}
            </DialogTitle>
            <DialogDescription>
              {showSuccess
                ? "Your subscription has been successfully updated."
                : `You are about to change from ${getCurrentTierDetails().displayName} ($${getCurrentTierDetails().price}/mo) to ${selectedTier?.displayName} ($${selectedTier?.price}/mo).`}
            </DialogDescription>
          </DialogHeader>

          {!showSuccess && (
            <>
              {selectedTier &&
                getCurrentTierDetails().price > selectedTier.price && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">
                          Downgrade Notice
                        </h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Downgrading your plan may result in the loss of some
                          features and limitations on your projects. Any
                          projects or data exceeding your new plan's limits will
                          remain accessible but you won't be able to add new
                          content until you're within the limits.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div className="my-4">
                <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">New plan</span>
                    <span className="font-medium">
                      ${selectedTier?.price}/month
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Current plan</span>
                    <span className="font-medium">
                      ${getCurrentTierDetails().price}/month
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium">
                    <span>Difference</span>
                    <span
                      className={
                        selectedTier &&
                        selectedTier.price > getCurrentTierDetails().price
                          ? "text-blue-600"
                          : "text-green-600"
                      }
                    >
                      {selectedTier &&
                        `${selectedTier.price > getCurrentTierDetails().price ? "+" : "-"}$${Math.abs(selectedTier.price - getCurrentTierDetails().price)}/month`}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {showSuccess ? (
            <div className="flex justify-center items-center py-6">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
          ) : (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmChange}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Confirm Change
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManager;
