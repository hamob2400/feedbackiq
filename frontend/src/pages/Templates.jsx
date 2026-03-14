import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const S = {
  page: { maxWidth: 520, margin: '0 auto', padding: '16px 12px 80px', background: '#f0f0f5', minHeight: '100vh' },
  card: { background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 10, border: '1px solid #e8e8ed' },
  input: { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#1c1c1e' },
  textarea: { width: '100%', padding: '12px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 14, fontFamily: 'monospace', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1c1c1e', minHeight: 120 },
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('Hello {buyerName}, thank you for your purchase of {itemTitle}! We hope you love it. If you have a moment, we\'d really appreciate your feedback.\nThank you!')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    try { const r = await api.getTemplates(); setTemplates(r.templates || []) } catch {}
  }

  async function handleCreate() {
    if (!name || !body) return
    setLoading(true)
    try { await api.createTemplate({ name, body }); setName(''); setShowForm(false); await load() }
    catch (e) { alert(e?.response?.data?.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1c1c1e' }}>✉️ Templates</div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#1a56db', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>New Template</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Template name (e.g. Thank you message)" style={{ ...S.input, marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 6 }}>Insert variable:</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {['{buyerName}', '{itemTitle}', '{orderId}', '{sellerName}'].map(v => (
              <button key={v} onClick={() => setBody(b => b + v)} style={{ padding: '4px 10px', background: '#e8f0fe', color: '#1a56db', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{v}</button>
            ))}
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} style={{ ...S.textarea, marginBottom: 12 }} />
          <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#1a56db', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      )}

      {templates.length === 0 && !showForm ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✉️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1c1c1e', marginBottom: 6 }}>No templates yet</div>
          <div style={{ fontSize: 14, color: '#8e8e93' }}>Create message templates to request feedback from buyers.</div>
        </div>
      ) : templates.map(t => (
        <div key={t.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1e' }}>{t.name}</div>
            <button onClick={async () => { if (!confirm('Delete?')) return; await api.deleteTemplate(t.id); await load() }} style={{ background: 'none', border: 'none', color: '#c7c7cc', cursor: 'pointer', fontSize: 22 }}>×</button>
          </div>
          <div style={{ fontSize: 13, color: '#3c3c43', lineHeight: 1.6, fontFamily: 'monospace', background: '#f9f9fb', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8e8ed' }}>{t.body}</div>
        </div>
      ))}
    </div>
  )
}
