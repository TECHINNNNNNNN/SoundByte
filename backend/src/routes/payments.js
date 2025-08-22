import express from 'express';
import { PrismaClient } from "../../generated/prisma/index.js"
import { authenticateToken } from '../middleware/auth.js';
import * as stripeService from '../services/stripe.ts';

const router = express.Router();
const prisma = new PrismaClient();

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
    const session = await stripeService.createCheckoutSession(
      userId,
      email,
      `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.FRONTEND_URL}/payment/canceled`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const session = await stripeService.createPortalSession(
      userId,
      `${process.env.FRONTEND_URL}/profile`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription status
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const hasSubscription = await stripeService.hasActiveSubscription(userId);
    const remainingTokens = await stripeService.getRemainingTokens(userId);

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
    const period = new Date().toISOString().slice(0, 7);

    const usage = await prisma.usage.findUnique({
      where: { userId_period: { userId, period } }
    });

    if (!usage) {
      return res.json({
        period,
        tokensUsed: 0,
        tokenLimit: 0,
        percentageUsed: 0
      });
    }

    const totalLimit = usage.tokenLimit + usage.extraTokens;
    const percentageUsed = totalLimit > 0 ? (usage.tokens / totalLimit) * 100 : 0;

    res.json({
      period,
      tokensUsed: usage.tokens,
      tokenLimit: totalLimit,
      percentageUsed: Math.round(percentageUsed)
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

export default router;