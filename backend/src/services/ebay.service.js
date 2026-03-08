import axios from 'axios'
import { config } from '../config.js'
import { getDb } from '../db/database.js'

function base64Creds() {
  return Buffer.from(`${config.ebay.clientId}:${config.ebay.clientSecret}`).toString('base64')
}

export function getAuthUrl(state) {
  const scopes = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.reputation',
    'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
    'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
  ].join(' ')
  const params = new URLSearchParams({
    client_id: config.ebay.clientId,
    redirect_uri: config.ebay.ruName,
    response_type: 'code',
    scope: scopes,
    state,
  })
  return `${config.ebay.authUrl}/oauth2/authorize?${params}`
}

export async function exchangeCodeForTokens(code) {
  const res = await axios.post(
    `${config.ebay.baseUrl}/identity/v1/oauth2/token`,
    new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: config.ebay.ruName }),
    { headers: { Authorization: `Basic ${base64Creds()}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  return res.data
}

export async function refreshAccessToken(userId) {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user?.ebay_refresh_token) throw new Error('No refresh token')
  const res = await axios.post(
    `${config.ebay.baseUrl}/identity/v1/oauth2/token`,
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: user.ebay_refresh_token }),
    { headers: { Authorization: `Basic ${base64Creds()}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  const expiresAt = new Date(Date.now() + res.data.expires_in * 1000).toISOString()
  db.prepare('UPDATE users SET ebay_access_token = ?, ebay_token_expires_at = ? WHERE id = ?').run(res.data.access_token, expiresAt, userId)
  return res.data.access_token
}

export async function getValidAccessToken(userId) {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user?.ebay_access_token) throw new Error('eBay not connected')
  if (new Date(user.ebay_token_expires_at) - new Date() < 5 * 60 * 1000) return await refreshAccessToken(userId)
  return user.ebay_access_token
}

export async function getEbayUserInfo(accessToken) {
  const res = await axios.get(`${config.ebay.baseUrl}/commerce/identity/v1/user/`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return res.data
}

export async function fetchEbayFeedback(userId) {
  const token = await getValidAccessToken(userId)
  const db = getDb()
  const insert = db.prepare(`INSERT OR IGNORE INTO feedback_cache (user_id, ebay_feedback_id, feedback_type, item_id, item_title, comment_text, comment_type, feedback_date, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertMany = db.transaction((items) => {
    for (const f of items) {
      const rating = f.CommentType === 'Positive' ? 'positive' : f.CommentType === 'Negative' ? 'negative' : 'neutral'
      insert.run(userId, f.FeedbackID, f.Role, f.ItemID, f.ItemTitle || '', f.CommentText || '', f.CommentType, f.CommentTime, rating)
    }
  })
  let totalInserted = 0, pageNumber = 1, hasMore = true
  while (hasMore) {
    const xmlBody = `<?xml version="1.0" encoding="utf-8"?><GetFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents"><RequesterCredentials><eBayAuthToken>${token}</eBayAuthToken></RequesterCredentials><FeedbackType>FeedbackReceived</FeedbackType><DetailLevel>ReturnAll</DetailLevel><Pagination><EntriesPerPage>200</EntriesPerPage><PageNumber>${pageNumber}</PageNumber></Pagination></GetFeedbackRequest>`
    const res = await axios.post('https://api.ebay.com/ws/api.dll', xmlBody, {
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '1255',
        'X-EBAY-API-CALL-NAME': 'GetFeedback',
        'X-EBAY-API-APP-NAME': config.ebay.clientId,
        'X-EBAY-API-CERT-NAME': config.ebay.clientSecret,
        'Content-Type': 'text/xml',
      }
    })
    const xml = res.data
    const feedbackMatches = xml.match(/<FeedbackDetail>([\s\S]*?)<\/FeedbackDetail>/g) || []
    const feedbackList = feedbackMatches.map(block => ({
      FeedbackID: (block.match(/<FeedbackID>(.*?)<\/FeedbackID>/) || [])[1] || '',
      Role: (block.match(/<Role>(.*?)<\/Role>/) || [])[1] || '',
      ItemID: (block.match(/<ItemID>(.*?)<\/ItemID>/) || [])[1] || '',
      ItemTitle: (block.match(/<ItemTitle>(.*?)<\/ItemTitle>/) || [])[1] || '',
      CommentText: (block.match(/<CommentText>(.*?)<\/CommentText>/) || [])[1] || '',
      CommentType: (block.match(/<CommentType>(.*?)<\/CommentType>/) || [])[1] || '',
      CommentTime: (block.match(/<CommentTime>(.*?)<\/CommentTime>/) || [])[1] || '',
    }))
    if (feedbackList.length === 0) { hasMore = false }
    else { insertMany(feedbackList); totalInserted += feedbackList.length; pageNumber++; if (feedbackList.length < 200) hasMore = false }
  }
  return totalInserted
}
