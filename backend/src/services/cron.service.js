import cron from 'node-cron'
import { getDb } from '../db/database.js'
import { fetchEbayFeedback } from '../services/ebay.service.js'
import { sendAlertEmail, buildNegativeFeedbackEmail } from '../services/email.service.js'

export function startCronJobs() {
  // Sync eBay feedback every 30 minutes for connected users
  cron.schedule('*/30 * * * *', async () => {
    console.log('[cron] Running eBay feedback sync...')
    const db = getDb()
    const users = db.prepare(`
      SELECT id FROM users WHERE ebay_access_token IS NOT NULL
    `).all()

    for (const user of users) {
      try {
        const count = await fetchEbayFeedback(user.id)
        if (count > 0) {
          await checkAndFireAlerts(user.id)
        }
      } catch (e) {
        console.error(`[cron] Sync failed for user ${user.id}:`, e.message)
      }
    }
  })

  console.log('[cron] Jobs started')
}

async function checkAndFireAlerts(userId) {
  const db = getDb()
  const rules = db.prepare(`
    SELECT * FROM alert_rules WHERE user_id = ? AND enabled = 1
  `).all(userId)

  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId)

  for (const rule of rules) {
    if (rule.condition === 'negative_feedback') {
      // Find unseen negative feedback (last 30 mins)
      const recent = db.prepare(`
        SELECT * FROM feedback_cache
        WHERE user_id = ? AND rating = 'negative'
        AND created_at >= datetime('now', '-35 minutes')
        ORDER BY feedback_date DESC
      `).all(userId)

      for (const fb of recent) {
        // Log the alert
        db.prepare(`INSERT INTO alert_logs (user_id, rule_id, message) VALUES (?, ?, ?)`).run(
          userId, rule.id, `Negative feedback on: ${fb.item_title || fb.item_id}`
        )

        if (rule.notify_email && user?.email) {
          const { subject, html } = buildNegativeFeedbackEmail(fb)
          await sendAlertEmail({ to: user.email, subject, html }).catch(console.error)
        }
      }
    }
  }
}
