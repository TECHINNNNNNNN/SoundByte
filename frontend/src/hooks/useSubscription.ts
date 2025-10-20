import { useState, useEffect } from 'react';
import { getSubscriptionStatus, getUsageStats } from '../services/stripe';

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const [tokenLimit, setTokenLimit] = useState(0);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensAllocated, setTokensAllocated] = useState(0);
  const [percentageUsed, setPercentageUsed] = useState(0);
  const [periodStart, setPeriodStart] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
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
      
      // Get usage stats (includes new billing period fields)
      const usage = await getUsageStats();
      setTokensUsed(usage.tokensUsed);
      setTokensAllocated(usage.tokensAllocated);
      setPercentageUsed(usage.percentageUsed);
      setPeriodStart(usage.periodStart);
      setPeriodEnd(usage.periodEnd);
      
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
    tokensUsed,
    tokensAllocated,
    percentageUsed,
    periodStart,
    periodEnd,
    error,
    refetch: fetchSubscriptionData
  };
}