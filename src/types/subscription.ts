
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface Feature {
  name: string;
  description: string;
  enabled: boolean;
  tier: SubscriptionTier;
}

export interface FeatureFlags {
  advancedAgents: Feature;
  teamCollaboration: Feature;
  customIntegrations: Feature;
  apiAccess: Feature;
  prioritySupport: Feature;
  analyticsAccess: Feature;
}
