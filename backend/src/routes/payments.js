import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';
import * as stripeService from '../services/stripe.js';

const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { id: userId, email } = req.user;

    // Check if already subscribed
    const hasSubscription = await stripeService.hasActiveSubscription(userId);
    if (hasSubscription) {
      return res.status(400).json({ error: 'Already subscribed' });
    }

    // Create checkout session
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const frontendUrl = isDevelopment 
      ? 'http://localhost:5173'
      : process.env.FRONTEND_URL;
    
    if (!isDevelopment && !frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required in production');
    }
    
    const session = await stripeService.createCheckoutSession(
      userId,
      email,
      `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${frontendUrl}/payment/canceled`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Provide more helpful error messages
    const errorMessage = error.message || 'Failed to create checkout session';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create customer portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const isDevelopment = process.env.NODE_ENV !== 'production';
    const frontendUrl = isDevelopment 
      ? 'http://localhost:5173'
      : process.env.FRONTEND_URL;
    
    if (!isDevelopment && !frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required in production');
    }
    
    const session = await stripeService.createPortalSession(
      userId,
      `${frontendUrl}/profile`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    
    // Provide more helpful error messages
    const errorMessage = error.message || 'Failed to create portal session';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get subscription status
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    console.log('Checking subscription for user:', userId);

    const hasSubscription = await stripeService.hasActiveSubscription(userId);
    const remainingTokens = await stripeService.getRemainingTokens(userId);
    
    console.log('Subscription status:', { userId, hasSubscription, remainingTokens });

    res.json({
      hasSubscription,
      remainingTokens,
      tokenLimit: hasSubscription ? stripeService.TIER_LIMITS.pro : 0
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Get usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // Get current billing period
    const { periodStart, periodEnd } = await stripeService.getCurrentBillingPeriod(userId);

    const usage = await prisma.usage.findUnique({
      where: { userId_periodStart: { userId, periodStart } }
    });

    if (!usage) {
      // No usage yet - return defaults
      const hasSubscription = await stripeService.hasActiveSubscription(userId);
      const limit = hasSubscription ? stripeService.TIER_LIMITS.pro : stripeService.TIER_LIMITS.free;
      
      return res.json({
        periodStart,
        periodEnd,
        tokensUsed: 0,
        tokensAllocated: 0,
        tokenLimit: limit,
        percentageUsed: 0
      });
    }

    const totalLimit = usage.tokenLimit + usage.extraTokens;
    const totalUsed = usage.tokens + usage.allocatedTokens;
    const percentageUsed = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

    res.json({
      periodStart: usage.periodStart,
      periodEnd: usage.periodEnd,
      tokensUsed: usage.tokens,
      tokensAllocated: usage.allocatedTokens,
      tokenLimit: totalLimit,
      percentageUsed: Math.round(percentageUsed)
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

export default router;