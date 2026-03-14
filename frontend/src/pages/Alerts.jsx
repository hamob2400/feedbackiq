import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const S = {
  page: { maxWidth: 520, margin: '0 auto', padding: '16px 12px 80px', background: '#f0f0f5', minHeight: '100vh' },
  card: { background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 10, border: '1px solid #e8e8ed' },
  input: { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#1c1c1e' },
  select: { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#1c1c1e' },
}

export default function Alerts() {
  const [rules, setRules] = useState([])
  const [logs, setLogs] = useState([])
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('negative_feedback')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    try {
      const [r, l] = await Promise.all([api.getAlertRules(), api.getAlertLogs()])
      setRules(r.rules || []); setLogs(l.logs || [])
    } catch {}
  }

  async function handleCreate() {
    if (!name) return
    setLoading(true)
    try { await api.createAlertRule({ name, condition, notify_email: true }); setName(''); setShowForm(false); await load() }
    catch (e) { alert(e?.response?.data?.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1c1c1e' }}>Alerts</div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#1a56db', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ New Rule'}
        </button>
      </div>

      {showForm && (
        <div style={S.card}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Alert name (e.g. Negative feedback)" style={{ ...S.input, marginBottom: 10 }} />
          <select value={condition} onChange={e => setCondition(e.target.value)} style={{ ...S.select, marginBottom: 14 }}>
            <option value="negative_feedback">Negative feedback received</option>
            <option value="neutral_feedback">Neutral feedback received</option>
          </select>
          <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#1a56db', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : 'Create Alert Rule'}
          </button>
        </div>
      )}

      {rules.length > 0 && (
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', marginBottom: 12 }}>Active Rules</div>
          {rules.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: i > 0 ? 10 : 0, marginTop: i > 0 ? 10 : 0, borderTop: i > 0 ? '1px solid #f0f0f5' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1c1c1e' }}>{r.name}</div>
                <div style={{ color: '#8e8e93', fontSize: 13, marginTop: 2 }}>{r.condition === 'negative_feedback' ? 'Negative feedback' : 'Neutral feedback'}</div>
              </div>
              <button onClick={async () => { if (!confirm('Delete?')) return; await api.deleteAlertRule(r.id); await load() }} style={{ background: 'none', border: 'none', color: '#c7c7cc', cursor: 'pointer', fontSize: 22 }}>x</button>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', marginBottom: 12 }}>Recent Alerts</div>
          {logs.slice(0, 10).map((l, i) => (
            <div key={l.id} style={{ paddingTop: i > 0 ? 10 : 0, marginTop: i > 0 ? 10 : 0, borderTop: i > 0 ? '1px solid #f0f0f5' : 'none' }}>
              <div style={{ fontSize: 14, color: '#1c1c1e' }}>{l.message}</div>
              <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 3 }}>{new Date(l.triggered_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {rules.length === 0 && logs.length === 0 && !showForm && (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1c1c1e', marginBottom: 6 }}>No alerts yet</div>
          <div style={{ fontSize: 14, color: '#8e8e93' }}>Get notified when you receive negative or neutral feedback.</div>
        </div>
      )}
    </div>
  )
}
