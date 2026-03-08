import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className={`rounded-xl border p-5 bg-slate-900 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        <Icon size={18} className="opacity-60" />
      </div>
      <div className="text-4xl font-bold">{value ?? '–'}</div>
    </div>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 98 ? 'text-green-400' : score >= 95 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col items-center justify-center">
      <span className="text-sm text-slate-400 font-medium mb-2">Feedback Score</span>
      <span className={`text-5xl font-black ${color}`}>{score}%</span>
      <span className="text-xs text-slate-500 mt-1">positive rate</span>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [filter, setFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [s, r] = await Promise.all([api.feedbackSummary(), api.feedbackRecent({ limit: 20 })])
      setSummary(s)
      setRecent(r)
    } catch {
      setError('Connect your eBay account in Settings to view analytics.')
    }
  }

  useEffect(() => { load() }, [])

  const handleSync = async () => {
    setSyncing(true)
    try { await api.ebaySync(); await load() } catch (e) { setError(e.response?.data?.error || 'Sync failed') }
    finally { setSyncing(false) }
  }

  const chartData = summary?.byDate?.map(d => ({
    date: format(parseISO(d.date), 'MMM d'),
    positive: d.positive,
    negative: d.negative,
    score: d.positive - d.negative,
  })) ?? []

  const filtered = filter === 'all' ? recent : recent.filter(r => r.rating === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {user?.ebay_connected ? `Connected as ${user.ebay_user_id}` : 'eBay not connected'}
          </p>
        </div>
        {user?.ebay_connected && (
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition disabled:opacity-50">
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
          <AlertCircle size={18} className="text-yellow-400 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Positive" value={summary?.totals?.positive} color="border-green-900/50 text-green-400" icon={TrendingUp} />
        <StatCard label="Neutral" value={summary?.totals?.neutral} color="border-yellow-900/50 text-yellow-400" icon={Minus} />
        <StatCard label="Negative" value={summary?.totals?.negative} color="border-red-900/50 text-red-400" icon={TrendingDown} />
        <ScoreBadge score={summary?.score ?? 100} />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Feedback Trend (90 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
              <Area type="monotone" dataKey="positive" stroke="#4ade80" fill="url(#gPos)" strokeWidth={2} name="Positive" />
              <Area type="monotone" dataKey="negative" stroke="#f87171" fill="url(#gNeg)" strokeWidth={2} name="Negative" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300">Recent Feedback</h2>
          <div className="flex gap-1">
            {['all', 'positive', 'neutral', 'negative'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition
                  ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">No feedback yet. Sync your eBay account to load data.</div>
          )}
          {filtered.map((r, i) => (
            <div key={r.id || i} className="flex items-start justify-between px-5 py-4 hover:bg-slate-800/50 transition">
              <div className="flex-1 min-w-0 pr-4">
                <div className="font-medium text-sm truncate">{r.item_title || r.item_id || 'Unknown item'}</div>
                <div className="text-slate-400 text-sm mt-0.5 line-clamp-2">{r.comment_text}</div>
                <div className="text-slate-600 text-xs mt-1">{r.feedback_date ? format(parseISO(r.feedback_date.substring(0, 10)), 'MMM d, yyyy') : ''}</div>
              </div>
              <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium
                ${r.rating === 'positive' ? 'bg-green-900/50 text-green-400' :
                  r.rating === 'negative' ? 'bg-red-900/50 text-red-400' :
                  'bg-yellow-900/50 text-yellow-400'}`}>
                {r.rating}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
