
import { FeatureFlags, SubscriptionTier } from "@/types/subscription";

export const features: FeatureFlags = {
  advancedAgents: {
    name: "Advanced Agents",
    description: "Access to advanced AI agents and custom workflows",
    enabled: true,
    tier: "pro"
  },
  teamCollaboration: {
    name: "Team Collaboration",
    description: "Collaborate with team members on workflows and agents",
    enabled: true,
    tier: "pro"
  },
  customIntegrations: {
    name: "Custom Integrations",
    description: "Build and use custom tool integrations",
    enabled: true,
    tier: "pro"
  },
  apiAccess: {
    name: "API Access",
    description: "Access to the platform API",
    enabled: true,
    tier: "enterprise"
  },
  prioritySupport: {
    name: "Priority Support",
    description: "24/7 priority support access",
    enabled: true,
    tier: "enterprise"
  },
  analyticsAccess: {
    name: "Analytics Access",
    description: "Advanced analytics and reporting",
    enabled: true,
    tier: "pro"
  }
};
