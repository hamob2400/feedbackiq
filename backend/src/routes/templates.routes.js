import { Router } from 'express'
import { authRequired } from '../middleware/authRequired.js'
import { getDb } from '../db/database.js'

const router = Router()

router.get('/', authRequired, (req, res) => {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC').all(req.user.uid)
  res.json(rows)
})

router.post('/', authRequired, (req, res) => {
  const { name, body } = req.body || {}
  if (!name || !body) return res.status(400).json({ error: 'Name and body required' })

  const db = getDb()
  const result = db.prepare(
    'INSERT INTO templates (user_id, name, body) VALUES (?, ?, ?)'
  ).run(req.user.uid, name, body)

  res.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/:id', authRequired, (req, res) => {
  const { name, body } = req.body || {}
  const db = getDb()
  const tpl = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.uid)
  if (!tpl) return res.status(404).json({ error: 'Not found' })

  db.prepare(`
    UPDATE templates SET name = ?, body = ?, updated_at = datetime('now') WHERE id = ?
  `).run(name ?? tpl.name, body ?? tpl.body, tpl.id)

  res.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(tpl.id))
})

router.delete('/:id', authRequired, (req, res) => {
  const db = getDb()
  const result = db.prepare('DELETE FROM templates WHERE id = ? AND user_id = ?').run(req.params.id, req.user.uid)
  if (!result.changes) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
