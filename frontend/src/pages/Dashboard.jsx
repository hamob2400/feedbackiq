import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const S = {
  page: { maxWidth: 520, margin: '0 auto', padding: '12px 12px 80px', background: '#f0f0f5', minHeight: '100vh' },
  card: { background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 10, border: '1px solid #e8e8ed' },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: '#1c1c1e', marginBottom: 12 },
  divider: { borderTop: '1px solid #f0f0f5', margin: '10px 0' },
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [alertLogs, setAlertLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [s, r, a] = await Promise.all([
        api.feedbackSummary(),
        api.feedbackRecent({ limit: 50 }),
        api.getAlertLogs().catch(() => ({ logs: [] }))
      ])
      setSummary(s)
      setRecent(r.feedback || [])
      setAlertLogs(a.logs || [])
    } catch {}
    setLoading(false)
  }

  async function handleSync() {
    setSyncing(true)
    try { await api.ebaySync(); await load() } catch {}
    setSyncing(false)
  }

  const filtered = recent.filter(f => {
    const matchFilter = filter === 'all' || f.rating === filter
    const matchSearch = !search || f.comment_text?.toLowerCase().includes(search.toLowerCase()) || f.item_title?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const score = summary?.score ?? 0
  const totals = summary?.totals || {}
  const ebayConnected = summary?.ebay_connected
  const recentAlerts = alertLogs.slice(0, 3)

  return (
    <div style={S.page}>

      {!ebayConnected && (
        <button onClick={async () => { const r = await api.ebayConnect(); window.location.href = r.url }}
          style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: '#1a56db', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
          Connect to eBay
        </button>
      )}

      <div style={S.card}>
        <div style={{ fontSize: 28, fontWeight: 800, color: score >= 98 ? '#1a9e3f' : score >= 95 ? '#c97c00' : '#cc0000', marginBottom: 2 }}>
          {score}% Positive feedback
        </div>
        <div style={{ fontSize: 15, color: '#3c3c43', marginBottom: 10 }}>{(totals.total || 0).toLocaleString()} ratings</div>
        <div style={S.divider} />
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1c1e', marginBottom: 8 }}>This Month's Feedback:</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 16 }}>🟢</span>
            <span style={{ fontWeight: 700, color: '#1a9e3f', fontSize: 15 }}>{totals.positive || 0} Positive</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 16 }}>🟡</span>
            <span style={{ fontWeight: 700, color: '#c97c00', fontSize: 15 }}>{totals.neutral || 0} Neutral</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 16 }}>🔴</span>
            <span style={{ fontWeight: 700, color: '#cc0000', fontSize: 15 }}>{totals.negative || 0} Negative</span>
          </span>
        </div>
        <button onClick={handleSync} disabled={syncing}
          style={{ marginTop: 14, width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #e8e8ed', background: '#f9f9fb', color: '#1a56db', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: syncing ? 0.6 : 1 }}>
          {syncing ? '⏳ Syncing...' : '↻ Sync Feedback Now'}
        </button>
      </div>

      {recentAlerts.length > 0 && (
        <div style={{ ...S.card, background: '#fffbe6', border: '1px solid #ffe58f' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#cc0000', marginBottom: 10 }}>Alerts</div>
          {recentAlerts.map((a, i) => (
            <div key={a.id || i} style={{ marginBottom: i < recentAlerts.length - 1 ? 12 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#cc0000', marginBottom: 6 }}>⚠️ {a.message}</div>
              <button style={{ padding: '8px 18px', background: '#f5a623', color: '#1c1c1e', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Fix This Feedback
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={S.sectionTitle}>Recent Feedback</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback..."
          style={{ width: '100%', padding: '9px 13px', background: '#f9f9fb', border: '1px solid #e8e8ed', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 10, color: '#1c1c1e' }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
          {[['all', '#1c1c1e', 'All'], ['positive', '#1a9e3f', 'Positive'], ['neutral', '#c97c00', 'Neutral'], ['negative', '#cc0000', 'Negative']].map(([f, color, label]) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 14px', borderRadius: 20, border: filter === f ? 'none' : '1px solid #e8e8ed',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              background: filter === f ? color : '#f9f9fb',
              color: filter === f ? '#fff' : '#8e8e93'
            }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', padding: '24px 0' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8e8e93', padding: '24px 0', fontSize: 14 }}>
            {recent.length === 0 ? '📭 No feedback synced yet.' : 'No results.'}
          </div>
        ) : filtered.map((f, i) => {
          const labelColor = f.rating === 'positive' ? '#1a9e3f' : f.rating === 'neutral' ? '#c97c00' : '#cc0000'
          const labelText = f.rating === 'positive' ? 'Positive' : f.rating === 'neutral' ? 'Neutral' : 'Negative'
          const date = f.feedback_date ? new Date(f.feedback_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
          return (
            <div key={f.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f0f0f5', paddingTop: i === 0 ? 0 : 10, marginTop: i === 0 ? 0 : 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <span style={{ fontWeight: 700, color: labelColor, fontSize: 14 }}>{labelText}</span>
                <span style={{ fontSize: 13, color: '#8e8e93' }}>{date}</span>
              </div>
              {f.comment_text && <div style={{ color: '#1c1c1e', fontSize: 15, lineHeight: 1.5 }}>{f.comment_text}</div>}
              {f.item_title && <div style={{ color: '#8e8e93', fontSize: 13, marginTop: 3 }}>📦 {f.item_title}</div>}
              {(f.rating === 'negative' || f.rating === 'neutral') && (
                <button style={{ marginTop: 7, padding: '7px 16px', background: '#f5a623', color: '#1c1c1e', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Fix This Feedback
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
