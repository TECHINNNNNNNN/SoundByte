import Stripe from 'stripe';
import { prisma } from '../lib/db.js';

// Initialize Stripe - latest API version as of Aug 2025
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

// Constants
export const TIER_LIMITS = {
  free: 10000,    // 10K tokens/month for free users
  pro: 500000,    // 500K tokens/month for pro users
};

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  extraTokens: process.env.STRIPE_EXTRA_TOKENS_PRICE_ID,
};

// Digest token cost estimation (based on API usage patterns)
export const DIGEST_TOKEN_COST = {
  2: 5000,   // 2-min digest: Perplexity research + short dialogue formatting + TTS
  5: 8000,   // 5-min digest: More content, longer dialogue
  10: 15000  // 10-min digest: Extended content and dialogue
};

// How many times a digest generates per month
export const DIGEST_FREQUENCY_MULTIPLIER = {
  'daily': 30,
  'weekly': 4,
  'monthly': 1
};

/**
 * Calculate monthly token allocation for a digest
 */
export function calculateDigestAllocation(audioLength, frequency) {
  const perGeneration = DIGEST_TOKEN_COST[audioLength] || 8000;
  const timesPerMonth = DIGEST_FREQUENCY_MULTIPLIER[frequency] || 4;
  return perGeneration * timesPerMonth;
}

/**
 * Allocate tokens for a new digest (reserves monthly cost)
 * Returns true if allocation succeeded, false if insufficient tokens
 */
export async function allocateDigestTokens(userId, audioLength, frequency) {
  const { periodStart, periodEnd } = await getCurrentBillingPeriod(userId);
  const allocationAmount = calculateDigestAllocation(audioLength, frequency);
  
  // Determine token limit
  const hasSubscription = await hasActiveSubscription(userId);
  const tokenLimit = hasSubscription ? TIER_LIMITS.pro : TIER_LIMITS.free;
  
  const usage = await prisma.usage.upsert({
    where: { userId_periodStart: { userId, periodStart } },
    create: {
      userId,
      periodStart,
      periodEnd,
      tokens: 0,
      tokenLimit,
      allocatedTokens: allocationAmount,
      extraTokens: 0
    },
    update: {
      allocatedTokens: { increment: allocationAmount }
    }
  });
  
  // Check if within limits
  const available = usage.tokenLimit + usage.extraTokens;
  const totalUsed = (usage.tokens || 0) + (usage.allocatedTokens || 0) + allocationAmount;
  
  return totalUsed <= available;
}

/**
 * Deallocate tokens when a digest is deleted or deactivated
 */
export async function deallocateDigestTokens(userId, audioLength, frequency) {
  const { periodStart } = await getCurrentBillingPeriod(userId);
  const allocationAmount = calculateDigestAllocation(audioLength, frequency);
  
  await prisma.usage.updateMany({
    where: { userId, periodStart },
    data: {
      allocatedTokens: { decrement: allocationAmount }
    }
  });
}

/**
 * Get current billing period for a user (30-day cycles)
 * 
 * Pro users: Based on Stripe subscription billing cycle
 * Free users: Based on first usage date (30-day rolling periods)
 * 
 * @param userId - The user's database ID
 * @returns Object with periodStart and periodEnd dates
 */
export async function getCurrentBillingPeriod(userId) {
  // Check if user has active Stripe subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true, currentPeriodEnd: true }
  });

  // Pro user: Use Stripe's exact billing cycle
  if (subscription?.status === 'active' && subscription.currentPeriodEnd) {
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 30); // Exactly 30 days back
    
    return { periodStart, periodEnd };
  }

  // Free user: Check for existing usage period
  const existingUsage = await prisma.usage.findFirst({
    where: { 
      userId,
      periodEnd: { gt: new Date() } // Find current active period
    },
    orderBy: { periodEnd: 'desc' }
  });

  if (existingUsage) {
    return {
      periodStart: existingUsage.periodStart,
      periodEnd: existingUsage.periodEnd
    };
  }

  // No existing period: Create new 30-day period starting now
  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 30); // Exactly 30 days forward

  return { periodStart, periodEnd };
}

/**
 * Create or retrieve Stripe customer
 * 
 * This function ensures that the Stripe customer ID stored in our database
 * actually exists in Stripe. If it doesn't exist (e.g., from test mode data),
 * it will clear the invalid ID and create a new customer.
 * 
 * @param userId - The user's database ID
 * @param email - The user's email address
 * @param name - Optional user name
 * @returns The valid Stripe customer ID
 */
export async function getOrCreateCustomer(userId, email, name) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true }
  });

  // If we have a customer ID stored, verify it exists in Stripe
  if (user?.stripeCustomerId) {
    try {
      // Attempt to retrieve the customer from Stripe to verify it exists
      await stripe.customers.retrieve(user.stripeCustomerId);
      console.log(`✓ Valid Stripe customer found: ${user.stripeCustomerId}`);
      return user.stripeCustomerId;
    } catch (error) {
      // Customer doesn't exist in Stripe (common when switching from test to live mode)
      if (error.code === 'resource_missing') {
        console.warn(`⚠️  Invalid customer ID ${user.stripeCustomerId} for user ${userId}. Clearing and creating new customer.`);
        
        // Clear the invalid customer ID from database
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: null }
        });
      } else {
        // Some other Stripe error - log and rethrow
        console.error('Error retrieving Stripe customer:', error);
        throw error;
      }
    }
  }

  // Create new Stripe customer
  console.log(`Creating new Stripe customer for user ${userId}`);
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId }
  });

  // Save to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  });

  console.log(`✓ New Stripe customer created: ${customer.id}`);
  return customer.id;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  userId,
  email,
  successUrl,
  cancelUrl
) {
  const customerId = await getOrCreateCustomer(userId, email);

  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: PRICE_IDS.pro,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId }  // Ensures userId is ALWAYS in subscription metadata
    },
    client_reference_id: userId  // Backup reference
  });
}

/**
 * Create customer portal session
 * 
 * This allows users to manage their subscription, payment methods, and billing history.
 * If the customer ID is invalid, it will throw an error since the portal requires
 * an existing customer with a subscription.
 */
export async function createPortalSession(userId, returnUrl) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true }
  });

  if (!user?.stripeCustomerId) {
    throw new Error('No Stripe customer found. Please subscribe first.');
  }

  try {
    // Verify customer exists in Stripe before creating portal session
    await stripe.customers.retrieve(user.stripeCustomerId);
    
    return await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });
  } catch (error) {
    if (error.code === 'resource_missing') {
      // Clear invalid customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: null }
      });
      throw new Error('Invalid customer data. Please contact support or try subscribing again.');
    }
    throw error;
  }
}

/**
 * Handle subscription updates from webhooks
 */
export async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.log('No userId in subscription metadata:', subscription.id);
    return;
  }

  // Get period end from subscription (typed as any to accommodate SDK typing variance)
  const periodEnd = subscription.current_period_end;

  if (!periodEnd) {
    console.error('No current_period_end found in subscription:', subscription.id);
    return;
  }

  // Update subscription in database
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    },
    update: {
      status: subscription.status,
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    }
  });

  // Initialize usage tracking for active subscriptions
  if (subscription.status === 'active') {
    const { periodStart, periodEnd } = await getCurrentBillingPeriod(userId);
    await prisma.usage.upsert({
      where: { userId_periodStart: { userId, periodStart } },
      create: {
        userId,
        periodStart,
        periodEnd,
        tokens: 0,
        tokenLimit: TIER_LIMITS.pro,
        allocatedTokens: 0,
        extraTokens: 0
      },
      update: {
        // Upgrade to Pro tier limits (keeps existing token consumption)
        tokenLimit: TIER_LIMITS.pro
      }
    });
  }

  // Handle subscription cancellation - reset to free tier
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    await resetToFreeTier(userId);
  }
}

/**
 * Reset user to free tier when subscription ends
 * Creates a fresh 30-day billing period with free tier limits
 */
export async function resetToFreeTier(userId) {
  console.log(`Resetting user ${userId} to free tier`);

  // Create new 30-day period starting now
  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 30);

  // Create fresh usage record for free tier
  await prisma.usage.create({
    data: {
      userId,
      periodStart,
      periodEnd,
      tokens: 0,
      tokenLimit: TIER_LIMITS.free,
      allocatedTokens: 0,
      extraTokens: 0
    }
  });

  console.log(`Created fresh free tier period for user ${userId}: ${periodStart.toISOString()} - ${periodEnd.toISOString()}`);
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true, currentPeriodEnd: true }
  });

  console.log('Database subscription check:', {
    userId,
    subscription,
    isActive: subscription?.status === 'active',
    isCurrent: subscription?.currentPeriodEnd ? subscription.currentPeriodEnd > new Date() : false
  });

  const isActiveAndCurrent = !!(subscription?.status === 'active' &&
    subscription.currentPeriodEnd > new Date());

  // Ensure a usage row exists for the current period when subscription is active
  if (isActiveAndCurrent) {
    const { periodStart, periodEnd } = await getCurrentBillingPeriod(userId);
    await prisma.usage.upsert({
      where: { userId_periodStart: { userId, periodStart } },
      create: {
        userId,
        periodStart,
        periodEnd,
        tokens: 0,
        tokenLimit: TIER_LIMITS.pro,
        allocatedTokens: 0,
        extraTokens: 0
      },
      update: {}
    });
  }

  return isActiveAndCurrent;
}

/**
 * Track token usage - returns true if within limits
 * 
 * This function:
 * 1. Gets the current billing period (30-day cycle)
 * 2. Determines token limit based on subscription status
 * 3. Updates usage or creates new period if needed
 * 4. Checks if user is within their limit (including allocated tokens for digests)
 * 
 * @param userId - The user's database ID
 * @param tokens - Number of tokens to track
 * @returns true if user is within limits, false if over limit
 */
export async function trackUsage(userId, tokens) {
  const { periodStart, periodEnd } = await getCurrentBillingPeriod(userId);
  
  // Determine token limit based on subscription status
  const hasSubscription = await hasActiveSubscription(userId);
  const tokenLimit = hasSubscription ? TIER_LIMITS.pro : TIER_LIMITS.free;

  const usage = await prisma.usage.upsert({
    where: { 
      userId_periodStart: { userId, periodStart } 
    },
    create: {
      userId,
      periodStart,
      periodEnd,
      tokens,
      tokenLimit,
      allocatedTokens: 0,
      extraTokens: 0
    },
    update: {
      tokens: { increment: tokens }
    }
  });

  // Check if within limits: consumed + allocated must not exceed available
  const available = usage.tokenLimit + usage.extraTokens;
  const consumed = usage.tokens + usage.allocatedTokens;
  
  return consumed <= available;
}

/**
 * Get remaining tokens for user
 * 
 * Returns available tokens = (limit + extra) - (consumed + allocated)
 * Allocated tokens are reserved for recurring digests
 */
export async function getRemainingTokens(userId) {
  const { periodStart } = await getCurrentBillingPeriod(userId);

  const usage = await prisma.usage.findUnique({
    where: { userId_periodStart: { userId, periodStart } },
  });

  if (!usage) {
    // No usage record yet - return full limit based on subscription
    const hasSubscription = await hasActiveSubscription(userId);
    return hasSubscription ? TIER_LIMITS.pro : TIER_LIMITS.free;
  }

  // Calculate: available - (consumed + allocated)
  const available = usage.tokenLimit + usage.extraTokens;
  const used = usage.tokens + usage.allocatedTokens;
  
  return Math.max(0, available - used);
}

/**
 * Verify webhook signature (security)
 */
export function constructWebhookEvent(
  payload,
  signature
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}