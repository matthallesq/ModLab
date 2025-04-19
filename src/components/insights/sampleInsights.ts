import { Insight } from "@/types/project";

export const sampleInsights: Insight[] = [
  {
    id: "ins-001",
    title: "User Onboarding Improvement",
    type: "Product",
    hypothesis:
      "We believed that simplifying the onboarding process would increase conversion rates by 15%.",
    observation:
      "We observed that users who completed the new onboarding flow were 22% more likely to become paying customers within the first week.",
    insight_text:
      "We learned that a streamlined onboarding process with fewer steps significantly impacts conversion rates, especially for non-technical users.",
    next_steps:
      "We will redesign the onboarding flow for all user segments and implement A/B testing to optimize further.",
    created_at: new Date(2023, 5, 15).toISOString(),
    updated_at: new Date(2023, 5, 20).toISOString(),
    project_id: "proj-001",
    experiment_id: "exp-002",
    assignees: [
      {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        role: "owner",
      },
      {
        id: "user-124",
        name: "Alice Smith",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: "admin",
      },
    ],
  },
  {
    id: "ins-002",
    title: "Pricing Strategy Analysis",
    type: "Business",
    hypothesis:
      "We believed that introducing a mid-tier pricing option would capture customers who find our premium tier too expensive.",
    observation:
      "We observed that the new mid-tier option cannibalized 5% of our premium tier customers but attracted 18% new customers who wouldn't have purchased otherwise.",
    insight_text:
      "We learned that price sensitivity is higher than anticipated, but overall revenue increased by 12% with the three-tier model.",
    next_steps:
      "We will refine the feature differentiation between tiers to better justify the premium pricing and reduce cannibalization.",
    created_at: new Date(2023, 6, 10).toISOString(),
    updated_at: new Date(2023, 6, 15).toISOString(),
    project_id: "proj-001",
    experiment_id: null,
    assignees: [
      {
        id: "user-125",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: "member",
      },
    ],
  },
  {
    id: "ins-003",
    title: "Feature Usage Patterns",
    type: "Product",
    hypothesis:
      "We believed that our collaboration features would be the most used aspect of our platform.",
    observation:
      "We observed that while collaboration features have high engagement, the analytics dashboard has 3x more daily active usage across all customer segments.",
    insight_text:
      "We learned that customers value data-driven decision making more than we anticipated, and our analytics features are a key differentiator.",
    next_steps:
      "We will expand our analytics capabilities and make them more prominent in our marketing materials.",
    created_at: new Date(2023, 7, 5).toISOString(),
    updated_at: new Date(2023, 7, 10).toISOString(),
    project_id: "proj-001",
    experiment_id: "exp-005",
    assignees: [],
  },
  {
    id: "ins-004",
    title: "Customer Support Efficiency",
    type: "Operations",
    hypothesis:
      "We believed that implementing an AI chatbot would reduce support ticket volume by 30%.",
    observation:
      "We observed that the chatbot resolved 45% of common inquiries but created confusion for complex issues, resulting in longer resolution times for those cases.",
    insight_text:
      "We learned that AI support works best for specific, well-defined issues but needs human backup for complex scenarios.",
    next_steps:
      "We will implement a hybrid model with better handoff between AI and human support agents.",
    created_at: new Date(2023, 8, 20).toISOString(),
    updated_at: new Date(2023, 8, 25).toISOString(),
    project_id: "proj-002",
    experiment_id: null,
    assignees: [
      {
        id: "user-126",
        name: "Carol Williams",
        email: "carol@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        role: "member",
      },
      {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        role: "owner",
      },
    ],
  },
  {
    id: "ins-005",
    title: "Mobile App Engagement",
    type: "Product",
    hypothesis:
      "We believed that adding push notifications would increase daily active users by 25%.",
    observation:
      "We observed that while DAU increased by 18%, retention after 30 days was 15% higher for users who enabled notifications.",
    insight_text:
      "We learned that notifications impact long-term retention more significantly than daily usage spikes.",
    next_steps:
      "We will focus on personalized notification strategies that optimize for retention rather than short-term engagement.",
    created_at: new Date(2023, 9, 12).toISOString(),
    updated_at: new Date(2023, 9, 17).toISOString(),
    project_id: "proj-001",
    experiment_id: "exp-008",
    assignees: [
      {
        id: "user-124",
        name: "Alice Smith",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: "admin",
      },
    ],
  },
  {
    id: "ins-006",
    title: "Marketing Channel Effectiveness",
    type: "Marketing",
    hypothesis:
      "We believed that content marketing would provide the best CAC to LTV ratio compared to paid advertising.",
    observation:
      "We observed that while content marketing has a 35% better CAC, the sales cycle is 2.5x longer than with targeted paid campaigns.",
    insight_text:
      "We learned that different acquisition channels serve different business needs - content for long-term brand building and paid for quick growth spurts.",
    next_steps:
      "We will develop a balanced approach with both strategies, using paid for immediate revenue needs and content for sustainable growth.",
    created_at: new Date(2023, 10, 8).toISOString(),
    updated_at: new Date(2023, 10, 13).toISOString(),
    project_id: "proj-002",
    experiment_id: null,
    assignees: [
      {
        id: "user-125",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: "member",
      },
      {
        id: "user-126",
        name: "Carol Williams",
        email: "carol@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        role: "member",
      },
    ],
  },
  {
    id: "ins-007",
    title: "User Feedback Implementation",
    type: "Product",
    hypothesis:
      "We believed that implementing the top 5 requested features would significantly improve customer satisfaction scores.",
    observation:
      "We observed that implementing 3 of the 5 features resulted in only a 5% increase in satisfaction, while fixing existing bugs improved scores by 18%.",
    insight_text:
      "We learned that stability and reliability are more important to our users than new features.",
    next_steps:
      "We will allocate more resources to quality assurance and technical debt reduction before adding new capabilities.",
    created_at: new Date(2023, 11, 15).toISOString(),
    updated_at: new Date(2023, 11, 20).toISOString(),
    project_id: "proj-001",
    experiment_id: "exp-012",
    assignees: [
      {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        role: "owner",
      },
      {
        id: "user-124",
        name: "Alice Smith",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: "admin",
      },
      {
        id: "user-125",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: "member",
      },
    ],
  },
];

export const observationExamples = [
  "We observed that users who engaged with feature X showed a 25% higher retention rate over 60 days.",
  "We observed that the new pricing model attracted 30% more small business customers but reduced enterprise conversions by 5%.",
  "We observed that users struggled to find the export functionality, with 68% requiring more than 3 clicks to locate it.",
  "We observed that email open rates increased by 15% when using personalized subject lines based on user behavior.",
  "We observed that mobile users spent 40% less time on the platform compared to desktop users, primarily abandoning during complex workflows.",
];

export const nextStepsExamples = [
  "We will redesign the navigation structure to improve feature discoverability and reduce clicks to key actions.",
  "We will implement a targeted onboarding flow for different user segments based on their specific needs and use cases.",
  "We will prioritize mobile optimization for core workflows to improve completion rates on smaller devices.",
  "We will develop an A/B testing framework to systematically validate design and feature changes before full deployment.",
  "We will create a customer advisory board to gather ongoing feedback from power users and incorporate it into our roadmap.",
];
