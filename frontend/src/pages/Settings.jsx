import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { CheckCircle, XCircle, ExternalLink, Zap } from 'lucide-react'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [ebayMsg, setEbayMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const ebay = searchParams.get('ebay')
    const sub = searchParams.get('subscription')
    if (ebay === 'connected') { setEbayMsg('✅ eBay connected successfully!'); refreshUser() }
    if (ebay === 'error') setEbayMsg('❌ eBay connection failed. Please try again.')
    if (sub === 'success') { refreshUser() }
  }, [])

  const saveProfile = async () => {
    try {
      await api.updateProfile({ name, password: password || undefined })
      setProfileMsg('Profile updated!')
      setPassword('')
      refreshUser()
    } catch (e) { setProfileMsg(e.response?.data?.error || 'Failed to update') }
  }

  const connectEbay = async () => {
    setConnecting(true)
    try {
      const { url } = await api.ebayConnect()
      window.location.href = url
    } catch (e) { setEbayMsg(e.response?.data?.error || 'Failed to connect'); setConnecting(false) }
  }

  const disconnectEbay = async () => {
    if (!confirm('Disconnect eBay? Your synced feedback data will remain.')) return
    await api.ebayDisconnect()
    await refreshUser()
    setEbayMsg('eBay disconnected.')
  }

  const syncNow = async () => {
    setSyncing(true)
    try {
      const { synced } = await api.ebaySync()
      setEbayMsg(`Synced ${synced} feedback entries.`)
    } catch (e) { setEbayMsg(e.response?.data?.error || 'Sync failed') }
    finally { setSyncing(false) }
  }

  const upgradePro = async () => {
    const { url } = await api.createCheckout()
    window.location.href = url
  }

  const manageSubscription = async () => {
    const { url } = await api.openPortal()
    window.location.href = url
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Display Name</label>
            <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">New Password (leave blank to keep current)</label>
            <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        {profileMsg && <p className="text-sm text-indigo-400">{profileMsg}</p>}
        <button onClick={saveProfile} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition">Save Profile</button>
      </section>

      {/* eBay */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">eBay Integration</h2>
          {user?.ebay_connected
            ? <span className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle size={14} /> Connected as {user.ebay_user_id}</span>
            : <span className="flex items-center gap-1.5 text-xs text-red-400"><XCircle size={14} /> Not connected</span>}
        </div>
        <p className="text-sm text-slate-400">Connect your eBay seller account to automatically sync feedback and analytics.</p>
        {ebayMsg && <p className="text-sm text-indigo-400">{ebayMsg}</p>}
        <div className="flex gap-2 flex-wrap">
          {user?.ebay_connected ? (
            <>
              <button onClick={syncNow} disabled={syncing} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition disabled:opacity-50">
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              <button onClick={disconnectEbay} className="px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm font-medium transition">
                Disconnect eBay
              </button>
            </>
          ) : (
            <button onClick={connectEbay} disabled={connecting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition disabled:opacity-50">
              <ExternalLink size={15} /> {connecting ? 'Redirecting...' : 'Connect eBay Account'}
            </button>
          )}
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Subscription</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide
            ${user?.subscription_status === 'pro' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
            {user?.subscription_status || 'free'}
          </span>
        </div>

        {user?.subscription_status === 'pro' ? (
          <>
            <p className="text-sm text-slate-400">You're on the Pro plan. Manage billing, invoices, and cancellation below.</p>
            {user?.subscription_ends_at && (
              <p className="text-xs text-slate-500">Next billing date: {new Date(user.subscription_ends_at).toLocaleDateString()}</p>
            )}
            <button onClick={manageSubscription} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition">
              <ExternalLink size={15} /> Manage Billing
            </button>
          </>
        ) : (
          <>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="font-medium text-slate-300">Upgrade to Pro to unlock:</p>
              <ul className="space-y-1 pl-4">
                {['Automatic eBay sync every 30 minutes', 'Email alerts for negative feedback', 'Unlimited response templates', 'Full analytics & history', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2"><Zap size={13} className="text-indigo-400 shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            <button onClick={upgradePro} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-sm font-bold transition">
              <Zap size={15} /> Upgrade to Pro
            </button>
          </>
        )}
      </section>
    </div>
  )
}
