import { Router } from 'express'
import { authRequired } from '../middleware/authRequired.js'
import { getAuthUrl, exchangeCodeForTokens, fetchEbayFeedback, getEbayUserInfo } from '../services/ebay.service.js'
import { getDb } from '../db/database.js'
import { config } from '../config.js'

const router = Router()

// Step 1: redirect user to eBay OAuth
router.get('/connect', authRequired, (req, res) => {
  const state = Buffer.from(JSON.stringify({ uid: req.user.uid })).toString('base64')
  const url = getAuthUrl(state)
  res.json({ url })
})

// Step 2: eBay redirects here with code
router.get('/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code) return res.redirect(`${config.frontendUrl}/settings?ebay=error`)

  try {
    const { uid } = JSON.parse(Buffer.from(state, 'base64').toString())
    const tokens = await exchangeCodeForTokens(code)

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    const db = getDb()

    // Get eBay user info
    let ebayUserId = null
    try {
      const info = await getEbayUserInfo(tokens.access_token)
      ebayUserId = info.username || info.userId
    } catch {}

    db.prepare(`
      UPDATE users SET
        ebay_access_token = ?,
        ebay_refresh_token = ?,
        ebay_token_expires_at = ?,
        ebay_user_id = ?
      WHERE id = ?
    `).run(tokens.access_token, tokens.refresh_token, expiresAt, ebayUserId, uid)

    // Kick off initial sync
    fetchEbayFeedback(uid).catch(console.error)

    res.redirect(`${config.frontendUrl}/settings?ebay=connected`)
  } catch (e) {
    console.error('eBay callback error:', e.message)
    res.redirect(`${config.frontendUrl}/settings?ebay=error`)
  }
})

router.delete('/disconnect', authRequired, (req, res) => {
  const db = getDb()
  db.prepare(`
    UPDATE users SET ebay_access_token = NULL, ebay_refresh_token = NULL,
    ebay_token_expires_at = NULL, ebay_user_id = NULL WHERE id = ?
  `).run(req.user.uid)
  res.json({ ok: true })
})

// Manual sync trigger
router.post('/sync', authRequired, async (req, res) => {
  try {
    const count = await fetchEbayFeedback(req.user.uid)
    res.json({ ok: true, synced: count })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

export default router
