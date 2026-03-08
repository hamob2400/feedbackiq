import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 5050,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  ebay: {
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CLIENT_SECRET,
    redirectUri: process.env.EBAY_REDIRECT_URI || 'http://localhost:5050/api/ebay/callback',
    ruName: process.env.EBAY_RU_NAME,
    env: process.env.EBAY_ENV || 'production',
    get baseUrl() {
      return this.env === 'sandbox'
        ? 'https://api.sandbox.ebay.com'
        : 'https://api.ebay.com'
    },
    get authUrl() {
      return this.env === 'sandbox'
        ? 'https://auth.sandbox.ebay.com'
        : 'https://auth.ebay.com'
    }
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
}

