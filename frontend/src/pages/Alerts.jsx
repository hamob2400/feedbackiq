import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Alerts() {
  const [rules, setRules] = useState([])
  const [logs, setLogs] = useState([])
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('negative_feedback')
  const [loading, setLoading] = useState(false)

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
    try { await api.createAlertRule({ name, condition, notify_email: true }); setName(''); await load() }
    catch (e) { alert(e?.response?.data?.message || 'Failed') }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this alert?')) return
    await api.deleteAlertRule(id); await load()
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 80px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>New Alert Rule</div>
        <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Alert Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Negative feedback alert" style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 12, color: '#1e293b' }} />
        <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Condition</label>
        <select value={condition} onChange={e => setCondition(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 16, color: '#1e293b' }}>
          <option value="negative_feedback">Negative feedback received</option>
          <option value="neutral_feedback">Neutral feedback received</option>
        </select>
        <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? '...' : '+ Create Alert'}
        </button>
      </div>

      {rules.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Active Rules</div>
          {rules.map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{r.name}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{r.condition === 'negative_feedback' ? '🔴 Negative feedback' : '🟡 Neutral feedback'}</div>
              </div>
              <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Recent Alerts</div>
          {logs.slice(0, 10).map(l => (
            <div key={l.id} style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 13, color: '#334155' }}>{l.message}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{new Date(l.triggered_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {rules.length === 0 && logs.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: 14 }}>No alerts yet. Create a rule above to get notified.</div>
      )}
    </div>
  )
}
