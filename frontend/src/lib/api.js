import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050'

const http = axios.create({ baseURL: BASE })

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('fm_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const setToken = (t) => localStorage.setItem('fm_token', t)
export const clearToken = () => localStorage.removeItem('fm_token')
export const getToken = () => localStorage.getItem('fm_token')

export const api = {
  // Auth
  signup: (email, password, name) => http.post('/api/auth/signup', { email, password, name }),
  login: (email, password) => http.post('/api/auth/login', { email, password }),
  me: () => http.get('/api/auth/me'),
  updateProfile: (data) => http.put('/api/auth/profile', data),

  // eBay
  ebayConnect: () => http.get('/api/ebay/connect'),
  ebayDisconnect: () => http.delete('/api/ebay/disconnect'),
  ebaySync: () => http.post('/api/ebay/sync'),

  // Feedback
  feedbackSummary: () => http.get('/api/feedback/summary'),
  feedbackRecent: (params) => http.get('/api/feedback/recent', { params }),
  feedbackStats: () => http.get('/api/feedback/stats'),

  // Templates
  getTemplates: () => http.get('/api/templates'),
  createTemplate: (data) => http.post('/api/templates', data),
  updateTemplate: (id, data) => http.put(`/api/templates/${id}`, data),
  deleteTemplate: (id) => http.delete(`/api/templates/${id}`),

  // Alerts
  getAlertRules: () => http.get('/api/alerts/rules'),
  createAlertRule: (data) => http.post('/api/alerts/rules', data),
  updateAlertRule: (id, data) => http.put(`/api/alerts/rules/${id}`, data),
  deleteAlertRule: (id) => http.delete(`/api/alerts/rules/${id}`),
  getAlertLogs: () => http.get('/api/alerts/logs'),

  // Stripe
  createCheckout: () => http.post('/api/stripe/create-checkout'),
  openPortal: () => http.post('/api/stripe/portal'),
}
