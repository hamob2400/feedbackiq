import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([api.feedbackSummary(), api.feedbackRecent({ limit: 20 })])
      setSummary(s)
      setRecent(r.feedback || [])
    } catch {}
    setLoading(false)
  }

  const filtered = recent.filter(f => {
    const matchFilter = filter === 'all' || f.rating === filter
    const matchSearch = !search || f.comment_text?.toLowerCase().includes(search.toLowerCase()) || f.item_title?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const score = summary?.score ?? 100
  const totals = summary?.totals || {}
  const scoreColor = score >= 98 ? '#16a34a' : score >= 95 ? '#d97706' : '#dc2626'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ background: '#fff', margin: 16, borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Feedback Score</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 52, fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: '-2px' }}>{score}<span style={{ fontSize: 22 }}>%</span></div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{totals.total || 0} total ratings</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['#16a34a', '#dcfce7', totals.positive || 0, 'Positive'], ['#d97706', '#fef9c3', totals.neutral || 0, 'Neutral'], ['#dc2626', '#fee2e2', totals.negative || 0, 'Negative']].map(([color, bg, count, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, borderRadius: 20, padding: '4px 12px' }}>
                <span style={{ fontWeight: 800, color, fontSize: 15 }}>{count}</span>
                <span style={{ color, fontSize: 12, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Recent Feedback</div>
          <button onClick={load} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>↻ Refresh</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search feedback..." style={{ width: '100%', padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'positive', 'neutral', 'negative'].map(f => {
            const colors = { all: '#2563eb', positive: '#16a34a', neutral: '#d97706', negative: '#dc2626' }
            const active = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: active ? 'none' : '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? colors[f] : '#fff', color: active ? '#fff' : '#64748b' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          })}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: 14 }}>
            {recent.length === 0 ? '📭 No feedback yet. Sync your eBay account.' : 'No results found.'}
          </div>
        ) : filtered.map(f => {
          const cfg = { positive: ['#16a34a', '#dcfce7'], neutral: ['#d97706', '#fef9c3'], negative: ['#dc2626', '#fee2e2'] }
          const [color, bg] = cfg[f.rating] || ['#64748b', '#f1f5f9']
          const date = f.feedback_date ? new Date(f.feedback_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
          return (
            <div key={f.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.rating}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{date}</span>
              </div>
              {f.comment_text && <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.6 }}>{f.comment_text}</div>}
              {f.item_title && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>📦 {f.item_title}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
