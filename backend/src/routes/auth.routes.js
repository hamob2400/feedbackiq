import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { signToken } from '../auth.js'
import { getDb } from '../db/database.js'
import { authRequired } from '../middleware/authRequired.js'

const router = Router()

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const hash = await bcrypt.hash(password, 12)
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ).run(email, hash, name || '')

  const user = { id: result.lastInsertRowid, email, name }
  const token = signToken(user)
  res.json({ token, user: { id: user.id, email, name } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' })

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken(user)
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription_status: user.subscription_status,
      ebay_connected: !!user.ebay_access_token,
      ebay_user_id: user.ebay_user_id,
    }
  })
})

router.get('/me', authRequired, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    subscription_status: user.subscription_status,
    subscription_ends_at: user.subscription_ends_at,
    ebay_connected: !!user.ebay_access_token,
    ebay_user_id: user.ebay_user_id,
  })
})

router.put('/profile', authRequired, async (req, res) => {
  const { name, password } = req.body || {}
  const db = getDb()
  if (name) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.uid)
  }
  if (password) {
    if (password.length < 8) return res.status(400).json({ error: 'Password too short' })
    const hash = await bcrypt.hash(password, 12)
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.uid)
  }
  res.json({ ok: true })
})

export default router
