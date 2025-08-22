import { useState, useEffect } from 'react';
import { getSubscriptionStatus, getUsageStats } from '../services/stripe';

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const [tokenLimit, setTokenLimit] = useState(0);
  const [percentageUsed, setPercentageUsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Get subscription status
      const status = await getSubscriptionStatus();
      setHasSubscription(status.hasSubscription);
      setRemainingTokens(status.remainingTokens);
      setTokenLimit(status.tokenLimit);
      
      // Get usage stats
      const usage = await getUsageStats();
      setPercentageUsed(usage.percentageUsed);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscription data');
      console.error('Subscription fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    hasSubscription,
    remainingTokens,
    tokenLimit,
    percentageUsed,
    error,
    refetch: fetchSubscriptionData
  };
}