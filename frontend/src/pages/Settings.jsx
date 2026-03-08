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
    try { const res = await api.ebaySync(); setSyncMsg('✅ Synced ' + res.synced + ' items') }
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

  const Section = ({ title, children }) => (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )

  const Row = ({ label, value, valueColor }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ color: '#64748b', fontSize: 14 }}>{label}</span>
      <span style={{ color: valueColor || '#1e293b', fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )

  const Btn = ({ onClick, label, loading, primary, danger, fullWidth }) => (
    <button onClick={onClick} disabled={loading} style={{ padding: '12px 18px', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600, width: fullWidth ? '100%' : 'auto', background: primary ? '#2563eb' : danger ? '#fee2e2' : '#f1f5f9', color: primary ? '#fff' : danger ? '#dc2626' : '#64748b', opacity: loading ? 0.6 : 1, marginTop: 4 }}>
      {loading ? '...' : label}
    </button>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 80px' }}>
      <Section title="eBay Account">
        {ebayConnected ? (
          <>
            <Row label="Status" value="Connected ✅" valueColor="#16a34a" />
            {user?.ebay_user_id && <Row label="eBay ID" value={user.ebay_user_id} />}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn onClick={handleSync} loading={syncing} label="↻ Sync Now" primary />
              <Btn onClick={handleDisconnect} label="Disconnect" danger />
            </div>
            {syncMsg && <div style={{ marginTop: 10, fontSize: 13, color: '#64748b' }}>{syncMsg}</div>}
          </>
        ) : (
          <>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 14 }}>Connect your eBay account to start tracking feedback automatically.</div>
            <Btn onClick={handleConnect} label="🔗 Connect eBay Account" primary fullWidth />
          </>
        )}
      </Section>
      <Section title="Subscription">
        <Row label="Plan" value={isPro ? 'Pro ⭐' : 'Free'} valueColor={isPro ? '#d97706' : '#94a3b8'} />
        {!isPro && (
          <>
            <div style={{ color: '#64748b', fontSize: 13, margin: '12px 0 8px' }}>Upgrade for unlimited templates and email alerts.</div>
            <Btn onClick={handleUpgrade} label="Upgrade to Pro — $5/mo" primary fullWidth />
          </>
        )}
      </Section>
      <Section title="Profile">
        <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 12 }} />
        <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
        <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>{user?.email}</div>
        <Btn onClick={handleSaveName} loading={saving} label="Save Changes" primary fullWidth />
      </Section>
    </div>
  )
}
