import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export default function Settings() {
  const { user, refresh } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const ebayConnected = user?.ebay_connected
  const isPro = user?.subscription_status === 'active'

  async function handleSync() {
    setSyncing(true); setSyncMsg('')
    try { const res = await api.ebaySync(); setSyncMsg(`✅ Synced ${res.synced} items`) }
    catch { setSyncMsg('❌ Sync failed') }
    setSyncing(false)
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect eBay?')) return
    await api.ebayDisconnect(); await refresh()
  }

  async function handleConnect() {
    const res = await api.ebayConnect(); window.location.href = res.url
  }

  async function handleSaveName() {
    setSaving(true)
    try { await api.updateProfile({ name }); await refresh() } catch {}
    setSaving(false)
  }

  async function handleUpgrade() {
    const res = await api.createCheckout(); window.location.href = res.url
  }

  async function handlePortal() {
    const res = await api.openPortal(); window.location.href = res.url
  }

  const Btn = ({ onClick, label, loading, primary, danger, fullWidth }) => (
    <button onClick={onClick} disabled={loading} style={{
      padding: '11px 18px', borderRadius: 10, border: 'none', cursor: loading ? 'wait' : 'pointer',
      fontSize: 14, fontWeight: 600, width: fullWidth ? '100%' : 'auto',
      background: primary ? '#3b82f6' : danger ? '#450a0a' : '#334155',
      color: primary ? '#fff' : danger ? '#ef4444' : '#94a3b8',
      opacity: loading ? 0.6 : 1
    }}>{loading ? '...' : label}</button>
  )

  const Row = ({ label, value, valueColor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ color: '#64748b', fontSize: 14 }}>{label}</span>
      <span style={{ color: valueColor || '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 16 }}>{children}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 80px' }}>
      <Section title="eBay Account">
        {ebayConnected ? (
          <div>
            <Row label="Status" value="Connected ✅" valueColor="#22c55e" />
            {user?.ebay_user_id && <Row label="Account" value={user.ebay_user_id} />}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Btn onClick={handleSync} loading={syncing} label="↻ Sync Now" primary />
              <Btn onClick={handleDisconnect} label="Disconnect" danger />
            </div>
            {syncMsg && <div style={{ marginTop: 10, fontSize: 13, color: '#94a3b8' }}>{syncMsg}</div>}
          </div>
        ) : (
          <div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Connect your eBay account to start tracking feedback.</div>
            <Btn onClick={handleConnect} label="Connect eBay Account" primary fullWidth />
          </div>
        )}
      </Section>

      <Section title="Plan">
        <Row label="Current plan" value={isPro ? 'Pro ⭐' : 'Free'} valueColor={isPro ? '#f59e0b' : '#94a3b8'} />
        {isPro ? (
          <div style={{ marginTop: 16 }}><Btn onClick={handlePortal} label="Manage Subscription" fullWidth /></div>
        ) : (
          <div>
            <div style={{ color: '#64748b', fontSize: 13, margin: '12px 0' }}>Upgrade for unlimited templates, email alerts, and priority sync.</div>
            <Btn onClick={handleUpgrade} label="Upgrade to Pro — $5/mo" primary fullWidth />
          </div>
        )}
      </Section>

      <Section title="Profile">
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
          <div style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#475569', fontSize: 14 }}>{user?.email}</div>
        </div>
        <Btn onClick={handleSaveName} loading={saving} label="Save Changes" primary fullWidth />
      </Section>
    </div>
  )
}
