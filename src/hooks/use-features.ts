
import { features } from "@/config/features";
import { Feature, SubscriptionTier } from "@/types/subscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeatures = () => {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'free' as SubscriptionTier;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      return (profile?.subscription_tier || 'free') as SubscriptionTier;
    }
  });

  const checkFeatureAccess = (feature: Feature): boolean => {
    if (!feature.enabled) return false;
    
    const tierLevels: Record<SubscriptionTier, number> = {
      'free': 0,
      'pro': 1,
      'enterprise': 2
    };

    const userTierLevel = tierLevels[subscription || 'free'];
    const requiredTierLevel = tierLevels[feature.tier];

    return userTierLevel >= requiredTierLevel;
  };

  const getAvailableFeatures = () => {
    return Object.entries(features).reduce((acc, [key, feature]) => {
      acc[key] = {
        ...feature,
        available: checkFeatureAccess(feature)
      };
      return acc;
    }, {} as Record<string, Feature & { available: boolean }>);
  };

  return {
    subscription,
    features: getAvailableFeatures(),
    checkFeatureAccess
  };
};

