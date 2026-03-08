# FeedbackIQ — eBay Feedback Manager SaaS

A full-stack SaaS app for eBay sellers to monitor feedback, manage response templates, set up email alerts, and handle subscriptions via Stripe.

---

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express (ESM) |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (30-day tokens, bcrypt passwords) |
| eBay API | OAuth 2.0 production, Trading API |
| Payments | Stripe Checkout + Billing Portal + Webhooks |
| Alerts | node-cron + Nodemailer |

---

## Setup

### 1. Clone & install

```bash
# Backend
cd backend
cp .env.sample .env   # fill in your secrets
npm install
npm run dev           # http://localhost:5050

# Frontend (new terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

### 2. Fill in your `.env`

```
PORT=5050
JWT_SECRET=<long random string>

# eBay Production
EBAY_CLIENT_ID=<your eBay Client ID>
EBAY_CLIENT_SECRET=<your eBay Client Secret>
EBAY_REDIRECT_URI=http://localhost:5050/api/ebay/callback
EBAY_ENV=production

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...   # your monthly plan price ID

# Email alerts (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password  # use Gmail App Password

FRONTEND_URL=http://localhost:5173
```

### 3. eBay App Setup
1. Go to https://developer.ebay.com → My Account → Application Keysets
2. Create a **Production** keyset
3. Set **OAuth Redirect URI** to: `http://localhost:5050/api/ebay/callback` (or your production URL)
4. Required scopes: `sell.reputation`, `sell.reputation.readonly`, `commerce.identity.readonly`

### 4. Stripe Setup
1. Create a product + recurring price in Stripe Dashboard
2. Copy the `price_...` ID to `STRIPE_PRICE_ID`
3. For webhooks: `stripe listen --forward-to localhost:5050/api/stripe/webhook`
4. Events to handle: `customer.subscription.created`, `updated`, `deleted`

---

## Features

### ✅ Auth
- Signup / Login with bcrypt-hashed passwords
- JWT tokens (30-day expiry)
- Profile update (name + password)

### ✅ eBay Integration
- Full OAuth 2.0 production flow
- Auto token refresh
- Feedback sync (pulls up to 200 entries)
- Auto-sync every 30 minutes via cron
- Manual sync button

### ✅ Dashboard
- Positive / Neutral / Negative counts
- Feedback score (% positive)
- 90-day area chart trend
- Recent feedback table with rating filter + search

### ✅ Templates
- Create / Edit / Delete response templates
- Variable placeholders: `{buyerName}`, `{itemTitle}`, `{orderId}`, `{sellerName}`
- Persisted to SQLite

### ✅ Alerts
- Create alert rules (negative/neutral feedback)
- Toggle enable/disable
- Email notifications via Nodemailer
- Alert history log

### ✅ Stripe Subscriptions
- Checkout session for Pro upgrade
- Billing portal for invoice/cancellation management
- Webhook updates subscription status in DB
- Free vs Pro gating ready

---

## Project Structure

```
feedback-manager/
├── backend/
│   ├── server.js
│   ├── .env.sample
│   ├── data/               ← SQLite DB stored here (auto-created)
│   └── src/
│       ├── config.js
│       ├── auth.js
│       ├── db/database.js  ← Schema + migrations
│       ├── middleware/authRequired.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── ebay.routes.js
│       │   ├── feedback.routes.js
│       │   ├── templates.routes.js
│       │   ├── alerts.routes.js
│       │   └── stripe.routes.js
│       └── services/
│           ├── ebay.service.js
│           ├── email.service.js
│           └── cron.service.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── lib/
        │   ├── api.js
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Templates.jsx
        │   ├── Alerts.jsx
        │   ├── Settings.jsx
        │   ├── Login.jsx
        │   └── Signup.jsx
        └── components/
            └── Nav.jsx
```

---

## Deploying to Production

1. **Backend**: Deploy to Railway / Render / Fly.io — set all env vars, SQLite file persists on disk
2. **Frontend**: `npm run build` → deploy `dist/` to Vercel / Netlify
3. Update `FRONTEND_URL` and `EBAY_REDIRECT_URI` to your production domains
4. Register production Stripe webhook endpoint

---

## What's left to add (optional)
- [ ] eBay messaging API to send templates directly from the app
- [ ] Multi-store support (multiple eBay accounts per user)
- [ ] CSV export of feedback data
- [ ] Weekly digest email
- [ ] Admin panel
