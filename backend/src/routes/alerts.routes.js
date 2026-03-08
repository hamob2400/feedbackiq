import { Router } from 'express'
import { authRequired } from '../middleware/authRequired.js'
import { getDb } from '../db/database.js'

const router = Router()

router.get('/rules', authRequired, (req, res) => {
  const db = getDb()
  res.json(db.prepare('SELECT * FROM alert_rules WHERE user_id = ? ORDER BY created_at DESC').all(req.user.uid))
})

router.post('/rules', authRequired, (req, res) => {
  const { name, condition, threshold, notify_email } = req.body || {}
  if (!name || !condition) return res.status(400).json({ error: 'Name and condition required' })

  const db = getDb()
  const result = db.prepare(`
    INSERT INTO alert_rules (user_id, name, condition, threshold, notify_email)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.uid, name, condition, threshold ?? 1, notify_email ? 1 : 0)

  res.json(db.prepare('SELECT * FROM alert_rules WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/rules/:id', authRequired, (req, res) => {
  const db = getDb()
  const rule = db.prepare('SELECT * FROM alert_rules WHERE id = ? AND user_id = ?').get(req.params.id, req.user.uid)
  if (!rule) return res.status(404).json({ error: 'Not found' })

  const { name, condition, threshold, notify_email, enabled } = req.body
  db.prepare(`
    UPDATE alert_rules SET name=?, condition=?, threshold=?, notify_email=?, enabled=? WHERE id=?
  `).run(
    name ?? rule.name,
    condition ?? rule.condition,
    threshold ?? rule.threshold,
    notify_email !== undefined ? (notify_email ? 1 : 0) : rule.notify_email,
    enabled !== undefined ? (enabled ? 1 : 0) : rule.enabled,
    rule.id
  )
  res.json(db.prepare('SELECT * FROM alert_rules WHERE id = ?').get(rule.id))
})

router.delete('/rules/:id', authRequired, (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM alert_rules WHERE id = ? AND user_id = ?').run(req.params.id, req.user.uid)
  res.json({ ok: true })
})

router.get('/logs', authRequired, (req, res) => {
  const db = getDb()
  const logs = db.prepare(`
    SELECT al.*, ar.name as rule_name FROM alert_logs al
    LEFT JOIN alert_rules ar ON al.rule_id = ar.id
    WHERE al.user_id = ? ORDER BY al.triggered_at DESC LIMIT 50
  `).all(req.user.uid)
  res.json(logs)
})

export default router
