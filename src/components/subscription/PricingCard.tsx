import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { SubscriptionTier } from "@/types/subscription";

interface PricingCardProps {
  tier: SubscriptionTier;
  isCurrentPlan?: boolean;
  onSelect: (tierId: string) => void;
}

export default function PricingCard({
  tier,
  isCurrentPlan = false,
  onSelect,
}: PricingCardProps) {
  const features = [
    {
      name: "Projects",
      value: tier.maxProjects === 999999 ? "Unlimited" : tier.maxProjects,
    },
    {
      name: "Experiments per project",
      value:
        tier.maxExperimentsPerProject === 999999
          ? "Unlimited"
          : tier.maxExperimentsPerProject,
    },
    {
      name: "Canvas features",
      value: tier.features.allCanvas
        ? "All"
        : tier.features.advancedCanvas
          ? "Advanced"
          : "Basic",
    },
    {
      name: "Insights",
      value: tier.features.comprehensiveInsights
        ? "Comprehensive"
        : tier.features.advancedInsights
          ? "Advanced"
          : "Basic",
    },
    {
      name: "Team collaboration",
      value: tier.features.advancedTeamCollaboration
        ? "Advanced"
        : tier.features.teamCollaboration
          ? "Basic"
          : "Not included",
    },
    {
      name: "Priority support",
      value: tier.features.prioritySupport ? "Included" : "Not included",
    },
  ];

  return (
    <Card
      className={`w-full max-w-sm border-2 ${isCurrentPlan ? "border-primary" : "border-border"}`}
    >
      <CardHeader>
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">${tier.price}</span>
          <span className="text-muted-foreground">/month</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">
                <strong>{feature.name}:</strong> {feature.value}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onSelect(tier.id)}
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
