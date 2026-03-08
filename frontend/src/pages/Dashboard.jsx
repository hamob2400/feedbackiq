import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
  const chartData = summary?.byDate || []
  const scoreColor = score >= 98 ? '#22c55e' : score >= 95 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px 24px 28px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Feedback Score</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: '-2px' }}>{score}<span style={{ fontSize: 24, fontWeight: 600 }}>%</span></div>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{totals.total || 0} total ratings</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {[['#22c55e', totals.positive || 0, 'Positive'], ['#f59e0b', totals.neutral || 0, 'Neutral'], ['#ef4444', totals.negative || 0, 'Negative']].map(([color, count, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ color: '#94a3b8', fontSize: 13 }}><span style={{ color: '#f1f5f9', fontWeight: 700 }}>{count}</span> {label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{ background: '#0f172a', padding: '16px 0 8px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 24, marginBottom: 12 }}>90-Day Trend</div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide /><YAxis hide />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#scoreGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700 }}>Recent Feedback</div>
          <button onClick={load} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>↻ Refresh</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback..." style={{ width: '100%', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['all', 'positive', 'neutral', 'negative'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === f ? (f === 'positive' ? '#22c55e' : f === 'neutral' ? '#f59e0b' : f === 'negative' ? '#ef4444' : '#3b82f6') : '#1e293b', color: filter === f ? '#fff' : '#64748b' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        {loading ? <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ textAlign: 'center', color: '#64748b', padding: 40, fontSize: 14 }}>{recent.length === 0 ? 'No feedback yet. Connect eBay to sync.' : 'No results.'}</div>
          : filtered.map(f => {
            const colors = { positive: '#22c55e', neutral: '#f59e0b', negative: '#ef4444' }
            const color = colors[f.rating] || '#64748b'
            const date = f.feedback_date ? new Date(f.feedback_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
            return (
              <div key={f.id} style={{ background: '#1e293b', borderRadius: 12, padding: '14px 16px', marginBottom: 10, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.rating}</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>{date}</span>
                </div>
                {f.comment_text && <div style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>{f.comment_text}</div>}
                {f.item_title && <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>📦 {f.item_title}</div>}
              </div>
            )
          })}
      </div>
    </div>
  )
}
