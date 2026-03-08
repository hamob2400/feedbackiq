import { Router } from 'express'
import { authRequired } from '../middleware/authRequired.js'
import { getDb } from '../db/database.js'

const router = Router()

router.get('/summary', authRequired, (req, res) => {
  const db = getDb()
  const uid = req.user.uid

  const totals = db.prepare(`
    SELECT
      SUM(CASE WHEN rating = 'positive' THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN rating = 'neutral'  THEN 1 ELSE 0 END) as neutral,
      SUM(CASE WHEN rating = 'negative' THEN 1 ELSE 0 END) as negative,
      COUNT(*) as total
    FROM feedback_cache WHERE user_id = ?
  `).get(uid)

  const byDate = db.prepare(`
    SELECT
      substr(feedback_date, 1, 10) as date,
      SUM(CASE WHEN rating = 'positive' THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN rating = 'neutral'  THEN 1 ELSE 0 END) as neutral,
      SUM(CASE WHEN rating = 'negative' THEN 1 ELSE 0 END) as negative
    FROM feedback_cache
    WHERE user_id = ?
    GROUP BY date
    ORDER BY date ASC
    LIMIT 90
  `).all(uid)

  const score = totals.total > 0
    ? Math.round((totals.positive / totals.total) * 100)
    : 100

  res.json({ totals, byDate, score })
})

router.get('/recent', authRequired, (req, res) => {
  const db = getDb()
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const rating = req.query.rating // optional filter
  const search = req.query.search

  let query = `SELECT * FROM feedback_cache WHERE user_id = ?`
  const params = [req.user.uid]

  if (rating) { query += ` AND rating = ?`; params.push(rating) }
  if (search) { query += ` AND (item_title LIKE ? OR comment_text LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }

  query += ` ORDER BY feedback_date DESC LIMIT ?`
  params.push(limit)

  const rows = db.prepare(query).all(...params)
  res.json(rows)
})

router.get('/stats', authRequired, (req, res) => {
  const db = getDb()
  const uid = req.user.uid

  const monthly = db.prepare(`
    SELECT
      strftime('%Y-%m', feedback_date) as month,
      SUM(CASE WHEN rating = 'positive' THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN rating = 'negative' THEN 1 ELSE 0 END) as negative
    FROM feedback_cache
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `).all(uid)

  const topItems = db.prepare(`
    SELECT item_title, COUNT(*) as count, rating
    FROM feedback_cache
    WHERE user_id = ? AND item_title != ''
    GROUP BY item_title, rating
    ORDER BY count DESC
    LIMIT 10
  `).all(uid)

  res.json({ monthly: monthly.reverse(), topItems })
})

export default router
