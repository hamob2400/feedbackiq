import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const CONDITIONS = [
  { value: 'negative_feedback', label: 'Negative feedback received' },
  { value: 'neutral_feedback', label: 'Neutral feedback received' },
]

export default function Alerts() {
  const [rules, setRules] = useState([])
  const [logs, setLogs] = useState([])
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('negative_feedback')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    const [r, l] = await Promise.all([api.getAlertRules(), api.getAlertLogs()])
    setRules(r)
    setLogs(l)
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name.trim()) return setError('Name is required')
    try {
      const rule = await api.createAlertRule({ name, condition, notify_email: notifyEmail })
      setRules(prev => [rule, ...prev])
      setName('')
      setError('')
    } catch (e) { setError(e.response?.data?.error || 'Failed') }
  }

  const toggle = async (rule) => {
    const updated = await api.updateAlertRule(rule.id, { enabled: !rule.enabled })
    setRules(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  const remove = async (id) => {
    await api.deleteAlertRule(id)
    setRules(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Alert Rules</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300">Create New Alert</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Alert Name</label>
            <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Negative feedback alert"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Condition</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={condition} onChange={e => setCondition(e.target.value)}>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-indigo-500" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} />
          <span className="text-sm text-slate-300">Send email notification</span>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button onClick={create} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition">
          <Plus size={15} /> Create Alert
        </button>
      </div>

      <div className="space-y-3">
        {rules.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No alert rules yet.</div>}
        {rules.map(rule => (
          <div key={rule.id} className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${rule.enabled ? 'border-slate-700 bg-slate-900' : 'border-slate-800 bg-slate-900/50 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <Bell size={16} className={rule.enabled ? 'text-indigo-400' : 'text-slate-600'} />
              <div>
                <div className="text-sm font-medium">{rule.name}</div>
                <div className="text-xs text-slate-500">{CONDITIONS.find(c => c.value === rule.condition)?.label}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {rule.notify_email && <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Email</span>}
              <button onClick={() => toggle(rule)} className="text-slate-400 hover:text-indigo-400 transition">
                {rule.enabled ? <ToggleRight size={22} className="text-indigo-400" /> : <ToggleLeft size={22} />}
              </button>
              <button onClick={() => remove(rule.id)} className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-slate-800 transition"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <Clock size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-300">Alert History</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm text-slate-300">{log.message}</div>
                <div className="text-xs text-slate-600">{format(parseISO(log.triggered_at), 'MMM d, h:mm a')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
