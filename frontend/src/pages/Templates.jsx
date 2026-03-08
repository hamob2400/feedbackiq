import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('Hello {buyerName}, thank you for your purchase of {itemTitle}! Please don\'t hesitate to reach out if you need anything.')
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    try { const r = await api.getTemplates(); setTemplates(r.templates || []) } catch {}
  }

  async function handleCreate() {
    if (!name || !body) return
    setLoading(true)
    try { await api.createTemplate({ name, body }); setName(''); await load() }
    catch (e) { alert(e?.response?.data?.message || 'Failed to create template') }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this template?')) return
    await api.deleteTemplate(id); await load()
  }

  const vars = ['{buyerName}', '{itemTitle}', '{orderId}', '{sellerName}']

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 80px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>New Template</div>
        <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Template Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Thank you message" style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 12, color: '#1e293b' }} />
        <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {vars.map(v => (
            <button key={v} onClick={() => setBody(b => b + v)} style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1e293b', marginBottom: 12 }} />
        <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? '...' : '+ Create Template'}
        </button>
      </div>
      {templates.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: 14 }}>No templates yet. Create your first one above.</div>
      ) : templates.map(t => (
        <div key={t.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 10, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{t.name}</span>
            <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{t.body}</div>
        </div>
      ))}
    </div>
  )
}
