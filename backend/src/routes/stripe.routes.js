import { Router } from 'express'
import Stripe from 'stripe'
import { authRequired } from '../middleware/authRequired.js'
import { getDb } from '../db/database.js'
import { config } from '../config.js'

const router = Router()

function getStripe() {
  return new Stripe(config.stripe.secretKey)
}

router.post('/create-checkout', authRequired, async (req, res) => {
  const stripe = getStripe()
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid)

  let customerId = user.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name || undefined })
    customerId = customer.id
    db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: config.stripe.priceId, quantity: 1 }],
    success_url: `${config.frontendUrl}/settings?subscription=success`,
    cancel_url: `${config.frontendUrl}/settings?subscription=cancelled`,
  })

  res.json({ url: session.url })
})

router.post('/portal', authRequired, async (req, res) => {
  const stripe = getStripe()
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid)

  if (!user.stripe_customer_id) return res.status(400).json({ error: 'No subscription found' })

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${config.frontendUrl}/settings`,
  })
  res.json({ url: session.url })
})

// Raw body needed for webhook signature verification
router.post('/webhook', async (req, res) => {
  const stripe = getStripe()
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, config.stripe.webhookSecret)
  } catch (e) {
    return res.status(400).json({ error: `Webhook error: ${e.message}` })
  }

  const db = getDb()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object
      db.prepare(`
        UPDATE users SET
          stripe_subscription_id = ?,
          subscription_status = ?,
          subscription_ends_at = ?
        WHERE stripe_customer_id = ?
      `).run(
        sub.id,
        sub.status === 'active' ? 'pro' : sub.status,
        sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        sub.customer
      )
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      db.prepare(`UPDATE users SET subscription_status = 'free', stripe_subscription_id = NULL WHERE stripe_customer_id = ?`)
        .run(sub.customer)
      break
    }
  }

  res.json({ received: true })
})

export default router
