import Stripe from 'stripe';
import { PrismaClient } from '../../generated/prisma/index.js'

const prisma = new PrismaClient();

// Initialize Stripe - latest API version as of Aug 2025
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Constants
export const TIER_LIMITS = {
  pro: 500000,  // 500K tokens/month
};

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  extraTokens: process.env.STRIPE_EXTRA_TOKENS_PRICE_ID!,
};

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
export async function getOrCreateCustomer(userId: string, email: string, name?: string) {
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
    } catch (error: any) {
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
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
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
export async function createPortalSession(userId: string, returnUrl: string) {
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
  } catch (error: any) {
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
export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.log('No userId in subscription metadata:', subscription.id);
    return;
  }

  // Get period end from subscription (typed as any to accommodate SDK typing variance)
  const periodEnd = (subscription as any).current_period_end as number | undefined;

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
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    },
    update: {
      status: subscription.status,
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    }
  });

  // Initialize usage tracking for active subscriptions
  if (subscription.status === 'active') {
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    await prisma.usage.upsert({
      where: { userId_period: { userId, period } },
      create: {
        userId,
        period,
        tokenLimit: TIER_LIMITS.pro,
      },
      update: {} // Don't reset existing usage
    });
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
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
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM
    await prisma.usage.upsert({
      where: { userId_period: { userId, period } },
      create: {
        userId,
        period,
        tokens: 0,
        tokenLimit: TIER_LIMITS.pro,
      },
      update: {}
    });
  }

  return isActiveAndCurrent;
}

/**
 * Track token usage - returns true if within limits
 */
export async function trackUsage(userId: string, tokens: number): Promise<boolean> {
  const period = new Date().toISOString().slice(0, 7); // YYYY-MM

  const usage = await prisma.usage.upsert({
    where: { userId_period: { userId, period } },
    create: {
      userId,
      period,
      tokens,
      // Default to pro limit if user has active subscription; otherwise 0 (free tier)
      tokenLimit: TIER_LIMITS.pro,
    },
    update: {
      tokens: { increment: tokens }
    }
  });

  return usage.tokens <= (usage.tokenLimit + usage.extraTokens);
}

/**
 * Get remaining tokens for user
 */
export async function getRemainingTokens(userId: string): Promise<number> {
  const period = new Date().toISOString().slice(0, 7);

  const usage = await prisma.usage.findUnique({
    where: { userId_period: { userId, period } },
  });

  if (!usage) return 0;

  const total = usage.tokenLimit + usage.extraTokens;
  return Math.max(0, total - usage.tokens);
}

/**
 * Verify webhook signature (security)
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}