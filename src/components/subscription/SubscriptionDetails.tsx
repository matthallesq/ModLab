import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserSubscription, SubscriptionLimits } from "@/types/subscription";
import { format } from "date-fns";

interface SubscriptionDetailsProps {
  subscription: UserSubscription;
  limits: SubscriptionLimits;
}

export default function SubscriptionDetails({
  subscription,
  limits,
}: SubscriptionDetailsProps) {
  const { tier } = subscription;

  if (!tier) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your {tier.name} Plan</CardTitle>
        <CardDescription>
          Current billing period: {formatDate(subscription.currentPeriodStart)}{" "}
          to {formatDate(subscription.currentPeriodEnd)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Projects</span>
            <span>
              {limits.projectCount} / {limits.maxProjects}
            </span>
          </div>
          <Progress
            value={(limits.projectCount / limits.maxProjects) * 100}
            className={getProgressColor(
              limits.projectCount,
              limits.maxProjects,
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Experiments</span>
            <span>
              {limits.experimentsCount} / {limits.maxExperiments}
            </span>
          </div>
          <Progress
            value={(limits.experimentsCount / limits.maxExperiments) * 100}
            className={getProgressColor(
              limits.experimentsCount,
              limits.maxExperiments,
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium">Canvas Features</h4>
            <p className="text-sm text-muted-foreground">
              {tier.features.allCanvas
                ? "All"
                : tier.features.advancedCanvas
                  ? "Advanced"
                  : "Basic"}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium">Insights</h4>
            <p className="text-sm text-muted-foreground">
              {tier.features.comprehensiveInsights
                ? "Comprehensive"
                : tier.features.advancedInsights
                  ? "Advanced"
                  : "Basic"}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium">Team Collaboration</h4>
            <p className="text-sm text-muted-foreground">
              {tier.features.advancedTeamCollaboration
                ? "Advanced"
                : tier.features.teamCollaboration
                  ? "Basic"
                  : "Not included"}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium">Priority Support</h4>
            <p className="text-sm text-muted-foreground">
              {tier.features.prioritySupport ? "Included" : "Not included"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
