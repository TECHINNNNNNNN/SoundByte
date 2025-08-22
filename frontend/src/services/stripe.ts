import api from './api';

interface SubscriptionStatus {
  hasSubscription: boolean;
  remainingTokens: number;
  tokenLimit: number;
}

interface UsageStats {
  period: string;
  tokensUsed: number;
  tokenLimit: number;
  percentageUsed: number;
}

// Create checkout session and redirect to Stripe
export async function createCheckoutSession(): Promise<string> {
  const response = await api.post<{ url: string }>('/payments/create-checkout-session');
  return response.data.url;
}

// Create portal session for subscription management
export async function createPortalSession(): Promise<string> {
  const response = await api.post<{ url: string }>('/payments/create-portal-session');
  return response.data.url;
}

// Get current subscription status
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await api.get<SubscriptionStatus>('/payments/subscription-status');
  return response.data;
}

// Get usage statistics
export async function getUsageStats(): Promise<UsageStats> {
  const response = await api.get<UsageStats>('/payments/usage');
  return response.data;
}