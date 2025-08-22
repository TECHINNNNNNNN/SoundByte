import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js'
import { constructWebhookEvent, handleSubscriptionUpdate } from '../services/stripe.ts';

const router = express.Router();
const prisma = new PrismaClient();

// Stripe webhook endpoint - raw body required for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature');
  }

  let event;

  try {
    // Verify webhook signature
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Check for duplicate events (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id }
  });

  if (existingEvent?.processed) {
    return res.json({ received: true, duplicate: true });
  }

  // Record event
  await prisma.webhookEvent.upsert({
    where: { stripeEventId: event.id },
    create: {
      stripeEventId: event.id,
      type: event.type,
      processed: false
    },
    update: {}
  });

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout completed:', session.id);
        // Subscription will be created via subscription events
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Processing subscription:', {
          id: subscription.id,
          customer: subscription.customer,
          metadata: subscription.metadata,
          status: subscription.status
        });
        
        // If no userId in metadata, try to find it from the customer
        if (!subscription.metadata?.userId && subscription.customer) {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: subscription.customer }
          });
          if (user) {
            subscription.metadata = { ...subscription.metadata, userId: user.id };
            console.log('Found userId from customer:', user.id);
          }
        }
        
        await handleSubscriptionUpdate(subscription);
        console.log('Subscription updated:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        console.log('Subscription canceled:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Reset monthly usage on subscription renewal
        if (invoice.billing_reason === 'subscription_cycle') {
          const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: invoice.subscription },
            select: { userId: true }
          });

          if (subscription) {
            const period = new Date().toISOString().slice(0, 7);
            await prisma.usage.upsert({
              where: { userId_period: { userId: subscription.userId, period } },
              create: {
                userId: subscription.userId,
                period,
                tokens: 0,
                tokenLimit: 500000
              },
              update: {
                tokens: 0,
                tokenLimit: 500000
              }
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Payment failed for invoice:', invoice.id);
        // TODO: Send email notification
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true }
    });

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);

    // Record error
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processed: false,
        error: error.message
      }
    });

    res.status(500).send('Webhook processing failed');
  }
});

export default router;