import { PrismaClient } from '../../generated/prisma/index.js';
import * as stripeService from './stripe.ts';

const prisma = new PrismaClient();

// Simple token estimation (1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if user has tokens available before making AI call
 */
export async function checkTokensAvailable(userId: string, estimatedTokens: number = 0): Promise<{
  allowed: boolean;
  remainingTokens: number;
  message?: string;
}> {
  // Check if user has active subscription
  const hasSubscription = await stripeService.hasActiveSubscription(userId);

  if (!hasSubscription) {
    return {
      allowed: false,
      remainingTokens: 0,
      message: 'No active subscription. Please upgrade to Pro.'
    };
  }

  const remainingTokens = await stripeService.getRemainingTokens(userId);

  if (remainingTokens <= 0) {
    return {
      allowed: false,
      remainingTokens: 0,
      message: 'Monthly token limit reached. Your limit will reset next month.'
    };
  }

  if (estimatedTokens > remainingTokens) {
    return {
      allowed: false,
      remainingTokens,
      message: `Not enough tokens. You have ${remainingTokens} tokens remaining.`
    };
  }

  return {
    allowed: true,
    remainingTokens
  };
}

/**
 * Track token usage after AI call completes
 */
export async function trackTokenUsage(
  userId: string,
  promptText: string,
  responseText: string,
  service: string = 'chat'
): Promise<number> {
  const promptTokens = estimateTokens(promptText);
  const responseTokens = estimateTokens(responseText);
  const totalTokens = promptTokens + responseTokens;

  console.log(`📊 Token usage for ${service}:`, {
    prompt: promptTokens,
    response: responseTokens,
    total: totalTokens
  });

  // Track the usage
  const allowed = await stripeService.trackUsage(userId, totalTokens);

  if (!allowed) {
    console.warn(`⚠️ User ${userId} exceeded token limit`);
  }

  return totalTokens;
}

/**
 * Get current usage stats for user
 */
export async function getUsageStats(userId: string) {
  const period = new Date().toISOString().slice(0, 7);

  const usage = await prisma.usage.findUnique({
    where: { userId_period: { userId, period } }
  });

  if (!usage) {
    return {
      used: 0,
      limit: 0,
      remaining: 0,
      percentage: 0
    };
  }

  const total = usage.tokenLimit + usage.extraTokens;
  const remaining = Math.max(0, total - usage.tokens);
  const percentage = total > 0 ? (usage.tokens / total) * 100 : 0;

  return {
    used: usage.tokens,
    limit: total,
    remaining,
    percentage: Math.round(percentage)
  };
}