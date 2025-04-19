export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  maxProjects: number;
  maxExperimentsPerProject: number;
  features: {
    basicCanvas?: boolean;
    advancedCanvas?: boolean;
    allCanvas?: boolean;
    basicInsights?: boolean;
    advancedInsights?: boolean;
    comprehensiveInsights?: boolean;
    teamCollaboration?: boolean;
    advancedTeamCollaboration?: boolean;
    prioritySupport?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

export interface UserSubscription {
  id: string;
  userId: string;
  tierId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  paymentMethodId?: string;
  customerId?: string;
  tier?: SubscriptionTier;
}

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: "paid" | "unpaid" | "no_payment_required";
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionLimits {
  projectCount: number;
  maxProjects: number;
  experimentsCount: number;
  maxExperiments: number;
  hasAdvancedCanvas: boolean;
  hasAdvancedInsights: boolean;
  hasTeamCollaboration: boolean;
  hasPrioritySupport: boolean;
}
