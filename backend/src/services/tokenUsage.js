import { prisma } from '../lib/db.js';
import * as stripeService from './stripe.js';

// Simple token estimation (1 token ≈ 4 characters)
export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Check if user has tokens available before making AI call
 * 
 * Supports both free and pro tiers:
 * - Free tier: 10K tokens per 30-day period
 * - Pro tier: 500K tokens per 30-day period
 * 
 * @param userId - The user's database ID
 * @param estimatedTokens - Estimated tokens needed for the operation
 * @returns Object with allowed status, remaining tokens, and optional message
 */
export async function checkTokensAvailable(userId, estimatedTokens = 0) {
  // Get remaining tokens (works for both free and pro users)
  const remainingTokens = await stripeService.getRemainingTokens(userId);

  // Check if user has any tokens left
  if (remainingTokens <= 0) {
    return {
      allowed: false,
      remainingTokens: 0,
      message: 'Token limit reached. Your limit will reset in your next billing cycle. Upgrade to Pro for more tokens!'
    };
  }

  // Check if estimated usage exceeds available tokens
  if (estimatedTokens > remainingTokens) {
    return {
      allowed: false,
      remainingTokens,
      message: `Not enough tokens. You have ${remainingTokens} tokens remaining. Need ${estimatedTokens} tokens.`
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
  userId,
  promptText,
  responseText,
  service = 'chat'
) {
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
 * 
 * Returns detailed breakdown of token usage including:
 * - Tokens consumed
 * - Tokens allocated to digests
 * - Total limit
 * - Remaining available tokens
 */
export async function getUsageStats(userId) {
  const { periodStart, periodEnd } = await stripeService.getCurrentBillingPeriod(userId);

  const usage = await prisma.usage.findUnique({
    where: { userId_periodStart: { userId, periodStart } }
  });

  if (!usage) {
    // No usage yet - return defaults based on subscription
    const hasSubscription = await stripeService.hasActiveSubscription(userId);
    const limit = hasSubscription ? stripeService.TIER_LIMITS.pro : stripeService.TIER_LIMITS.free;
    
    return {
      used: 0,
      allocated: 0,
      limit,
      remaining: limit,
      percentage: 0,
      periodStart,
      periodEnd
    };
  }

  const total = usage.tokenLimit + usage.extraTokens;
  const used = usage.tokens + usage.allocatedTokens;
  const remaining = Math.max(0, total - used);
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return {
    used: usage.tokens,
    allocated: usage.allocatedTokens,
    limit: total,
    remaining,
    percentage: Math.round(percentage),
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd
  };
}