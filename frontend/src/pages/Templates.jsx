import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'

const VARIABLES = ['{buyerName}', '{itemTitle}', '{orderId}', '{sellerName}']

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('Hello {buyerName}, thank you for your purchase of {itemTitle}! Please don\'t hesitate to reach out if you have any questions.')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setTemplates(await api.getTemplates()) } catch { setError('Could not load templates.') }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!name.trim() || !body.trim()) return setError('Name and body are required')
    setSaving(true)
    try {
      if (editing) {
        const updated = await api.updateTemplate(editing.id, { name, body })
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t))
        setEditing(null)
      } else {
        const t = await api.createTemplate({ name, body })
        setTemplates(prev => [t, ...prev])
      }
      setName('')
      setBody('Hello {buyerName}, thank you for your purchase of {itemTitle}!')
      setError('')
    } catch (e) { setError(e.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  const startEdit = (t) => {
    setEditing(t)
    setName(t.name)
    setBody(t.body)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditing(null)
    setName('')
    setBody('')
  }

  const remove = async (id) => {
    if (!confirm('Delete this template?')) return
    await api.deleteTemplate(id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const insertVar = (v) => setBody(prev => prev + v)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">{editing ? 'Edit Template' : 'Response Templates'}</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Template Name</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Positive feedback thank you"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Insert Variable</label>
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map(v => (
                <button key={v} onClick={() => insertVar(v)}
                  className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-400 hover:bg-slate-700 transition">
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Message Body</label>
          <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={5} value={body} onChange={e => setBody(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition disabled:opacity-50">
            {editing ? <><Save size={15} /> Update</> : <><Plus size={15} /> Create Template</>}
          </button>
          {editing && (
            <button onClick={cancelEdit} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition">
              <X size={15} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-200">{t.name}</h3>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(t)} className="p-1.5 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition"><Pencil size={14} /></button>
                <button onClick={() => remove(t.id)} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"><Trash2 size={14} /></button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-400 font-sans bg-slate-800/50 rounded-lg p-3">{t.body}</pre>
            <div className="flex flex-wrap gap-1">
              {VARIABLES.filter(v => t.body.includes(v)).map(v => (
                <span key={v} className="text-xs px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400 font-mono">{v}</span>
              ))}
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-500 text-sm">No templates yet. Create your first one above.</div>
        )}
      </div>
    </div>
  )
}
