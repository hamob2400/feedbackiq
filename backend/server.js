import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config } from './src/config.js'
import authRoutes from './src/routes/auth.routes.js'
import ebayRoutes from './src/routes/ebay.routes.js'
import feedbackRoutes from './src/routes/feedback.routes.js'
import templateRoutes from './src/routes/templates.routes.js'
import alertRoutes from './src/routes/alerts.routes.js'
import stripeRoutes from './src/routes/stripe.routes.js'
import { startCronJobs } from './src/services/cron.service.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure data dir exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true })

const app = express()

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    req.rawBody = req.body
    next()
  } else {
    express.json()(req, res, next)
  }
})

app.use(cors({ origin: config.frontendUrl, credentials: true }))
app.use(morgan('dev'))

app.get('/health', (req, res) => res.json({ ok: true, service: 'feedback-manager-backend', version: '1.0.0' }))

app.use('/api/auth', authRoutes)
app.use('/api/ebay', ebayRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/stripe', stripeRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

startCronJobs()

app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════╗
║   Feedback Manager API v1.0.0        ║
║   http://localhost:${config.port}             ║
╚══════════════════════════════════════╝
  `)
})
