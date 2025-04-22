export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export type ModelType = "business" | "product" | "social";

export type TimelineEventType =
  | "model_added"
  | "model_updated"
  | "experiment_created"
  | "experiment_running"
  | "experiment_completed"
  | "insight_added";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string;
  entityId?: string; // ID of the related entity (model, experiment, insight)
  entityType?: string; // Type of the related entity
  userId: string;
  userName?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  team_id?: string;
  team?: Team;
  assignees?: TeamMember[];
  modelType?: ModelType;
  analytics?: {
    validatedExperiments: number;
    totalExperiments: number;
    totalInsights: number;
  };
  timelineEvents?: TimelineEvent[];
  archived?: boolean;
}

export interface BusinessModel {
  id: string;
  name: string;
  description: string;
  canvas_data: CanvasData;
  created_at: string;
  updated_at: string;
  project_id: string;
  assignees?: TeamMember[];
}

export interface ProductModel {
  id: string;
  name: string;
  description: string;
  canvas_data: ProductCanvasData;
  created_at: string;
  updated_at: string;
  project_id: string;
  assignees?: TeamMember[];
}

export interface SocialBusinessModel {
  id: string;
  name: string;
  description: string;
  canvas_data: SocialBusinessCanvasData;
  created_at: string;
  updated_at: string;
  project_id: string;
  assignees?: TeamMember[];
}

export type CanvasItemStatus = "assumption" | "testing" | "validated";

export interface CanvasItem {
  text: string;
  status: CanvasItemStatus;
}

export interface CanvasData {
  customer_segments: CanvasItem[];
  value_propositions: CanvasItem[];
  channels: CanvasItem[];
  customer_relationships: CanvasItem[];
  revenue_streams: CanvasItem[];
  key_resources: CanvasItem[];
  key_activities: CanvasItem[];
  key_partners: CanvasItem[];
  cost_structure: CanvasItem[];
  [key: string]: CanvasItem[];
}

export interface ProductCanvasData {
  problem: CanvasItem[];
  solution: CanvasItem[];
  key_metrics: CanvasItem[];
  unique_value_proposition: CanvasItem[];
  unfair_advantage: CanvasItem[];
  channels: CanvasItem[];
  customer_segments: CanvasItem[];
  cost_structure: CanvasItem[];
  revenue_streams: CanvasItem[];
  [key: string]: CanvasItem[];
}

export interface SocialBusinessCanvasData {
  local_communities: CanvasItem[];
  governance: CanvasItem[];
  team_and_partners: CanvasItem[];
  social_value: CanvasItem[];
  social_impacts: CanvasItem[];
  social_benefits: CanvasItem[];
  costs: CanvasItem[];
  funding: CanvasItem[];
  affected_people: CanvasItem[];
  [key: string]: CanvasItem[];
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  test_description: string;
  success_criteria: string;
  status: "backlog" | "running" | "completed";
  priority: "high" | "medium" | "low";
  results: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  project_id: string;
  assignees?: TeamMember[];
}

export interface Insight {
  id: string;
  title: string;
  type?: string;
  hypothesis: string | null;
  observation: string | null;
  insight_text: string;
  next_steps: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  experiment_id: string | null;
  assignees?: TeamMember[];
}

export interface SubscriptionTier {
  name: "startup" | "professional" | "unlimited";
  displayName: string;
  price: number;
  description: string;
  features: string[];
  limits: {
    projects: number | "unlimited";
    experiments: number | "unlimited";
    canvasFeatures: "basic" | "advanced" | "all";
    insights: "basic" | "advanced" | "comprehensive";
    collaboration?: boolean;
    prioritySupport?: boolean;
  };
  popular?: boolean;
}

export interface Account {
  id: string;
  user_id: string;
  subscription_tier: "startup" | "professional" | "unlimited";
  created_at: string;
  updated_at: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    name: "startup",
    displayName: "Startup",
    price: 29,
    description: "Perfect for small teams and startups",
    features: [
      "Up to 3 projects",
      "All canvas features",
      "Unlimited experiments",
      "Basic insights",
    ],
    limits: {
      projects: 3,
      experiments: "unlimited",
      canvasFeatures: "all",
      insights: "basic",
    },
  },
  {
    name: "professional",
    displayName: "Professional",
    price: 79,
    description: "For growing businesses and teams",
    features: [
      "Up to 10 projects",
      "All canvas features",
      "Unlimited experiments",
      "Advanced insights",
      "Team collaboration",
    ],
    limits: {
      projects: 10,
      experiments: "unlimited",
      canvasFeatures: "all",
      insights: "advanced",
      collaboration: true,
    },
    popular: true,
  },
  {
    name: "unlimited",
    displayName: "Unlimited",
    price: 199,
    description: "For enterprises and large teams",
    features: [
      "Unlimited projects",
      "All canvas features",
      "Unlimited experiments",
      "Comprehensive insights",
      "Advanced team collaboration",
      "Priority support",
    ],
    limits: {
      projects: "unlimited",
      experiments: "unlimited",
      canvasFeatures: "all",
      insights: "comprehensive",
      collaboration: true,
      prioritySupport: true,
    },
  },
];
