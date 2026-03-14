import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'

const S = {
  page: { maxWidth: 520, margin: '0 auto', padding: '20px 16px 80px', background: '#f0f0f5', minHeight: '100vh' },
  section: { marginBottom: 28 },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 16, fontWeight: 700, color: '#1c1c1e', marginBottom: 10 },
  label: { fontSize: 15, color: '#1c1c1e', marginBottom: 6, display: 'block' },
  hint: { fontSize: 13, color: '#8e8e93', marginTop: 5, lineHeight: 1.5 },
  input: { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#1c1c1e' },
  select: { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#1c1c1e', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%238e8e93\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' },
  textarea: { width: '100%', padding: '12px 14px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: 10, fontSize: 14, fontFamily: 'monospace', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1c1c1e', minHeight: 140 },
  bigBtn: { width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: '#1a56db', color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f5' },
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 51, height: 31, borderRadius: 16, background: value ? '#34c759' : '#e5e5ea', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 27, height: 27, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.2s' }} />
    </div>
  )
}

export default function Settings() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [alertsOn, setAlertsOn] = useState(true)
  const [delay, setDelay] = useState('7')
  const [message, setMessage] = useState('Thank you for your purchase! We hope you are happy with the item. If so, please consider leaving us positive feedback.\nThank you!')
  const [excludeInput, setExcludeInput] = useState('')
  const [excluded, setExcluded] = useState([])
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

  async function handleSave() {
    setSaving(true)
    try { await api.updateProfile({ name }); await refresh() } catch {}
    setSaving(false)
  }

  function addExcluded() {
    const v = excludeInput.trim()
    if (v && !excluded.includes(v)) { setExcluded([...excluded, v]); setExcludeInput('') }
  }

  return (
    <div style={S.page}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: '#e53238' }}>e</span><span style={{ color: '#0064d2' }}>b</span><span style={{ color: '#f5af02' }}>a</span><span style={{ color: '#86b817' }}>y</span>
          <span style={{ color: '#1c1c1e' }}> Feedback Manager</span>
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 15, color: '#1c1c1e' }}>Sending feedback requests to buyers</div>
          <div style={{ fontSize: 13, color: alertsOn ? '#34c759' : '#8e8e93', fontWeight: 600 }}>alerts: {alertsOn ? 'On' : 'Off'}</div>
        </div>
        <Toggle value={alertsOn} onChange={setAlertsOn} />
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>🔗 eBay Account</div>
        {ebayConnected ? (
          <>
            <div style={S.row}><span style={{ fontSize: 15 }}>Status</span><span style={{ fontSize: 15, fontWeight: 700, color: '#34c759' }}>Connected ✅</span></div>
            {user?.ebay_user_id && <div style={S.row}><span style={{ fontSize: 15 }}>Account</span><span style={{ fontSize: 15, fontWeight: 600 }}>{user.ebay_user_id}</span></div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleSync} disabled={syncing} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #d1d1d6', background: '#fff', color: '#1a56db', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {syncing ? '⏳ Syncing...' : '↻ Sync Now'}
              </button>
              <button onClick={async () => { if (!confirm('Disconnect?')) return; await api.ebayDisconnect(); await refresh() }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #d1d1d6', background: '#fff', color: '#cc0000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Disconnect
              </button>
            </div>
            {syncMsg && <div style={{ marginTop: 8, fontSize: 13, color: '#8e8e93' }}>{syncMsg}</div>}
          </>
        ) : (
          <button onClick={async () => { const r = await api.ebayConnect(); window.location.href = r.url }} style={S.bigBtn}>Connect to eBay</button>
        )}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>⏰ Feedback Timing Settings</div>
        <select value={delay} onChange={e => setDelay(e.target.value)} style={S.select}>
          <option value="3">3 days after payment</option>
          <option value="5">5 days after payment</option>
          <option value="7">7 days after payment</option>
          <option value="14">14 days after payment</option>
          <option value="21">21 days after payment</option>
          <option value="30">30 days after payment</option>
        </select>
        <div style={S.hint}>Choose when to ask. Sellers who ship internationally often wait 20–30 days.</div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>✉️ Your Message to the Buyer</div>
        <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 8, lineHeight: 1.5 }}>This is the message buyers will receive when you ask them to give you positive feedback:</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} style={S.textarea} />
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {['{buyerName}', '{itemTitle}', '{orderId}'].map(v => (
            <button key={v} onClick={() => setMessage(m => m + v)} style={{ padding: '4px 10px', background: '#e8f0fe', color: '#1a56db', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>🚫 Exclude Certain Buyers</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={excludeInput} onChange={e => setExcludeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExcluded()} placeholder="Buyer username (optional)" style={{ ...S.input, flex: 1 }} />
          <button onClick={addExcluded} style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d1d6', background: '#f9f9fb', color: '#1c1c1e', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add Buyer</button>
        </div>
        {excluded.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {excluded.map(b => (
              <span key={b} onClick={() => setExcluded(excluded.filter(x => x !== b))} style={{ background: '#fee2e2', color: '#cc0000', padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{b} ×</span>
            ))}
          </div>
        )}
        <div style={S.hint}>Choose buyers that will not receive feedback requests, such as repeat customers or buyers who left negative feedback.</div>
      </div>

      {!isPro && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #e8e8ed', marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1e', marginBottom: 4 }}>⭐ Upgrade to Pro</div>
          <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 12, lineHeight: 1.5 }}>Unlock unlimited templates, email alerts, and advanced scheduling.</div>
          <button onClick={async () => { const r = await api.createCheckout(); window.location.href = r.url }} style={{ ...S.bigBtn, padding: '12px', fontSize: 15 }}>Upgrade — $5/mo</button>
        </div>
      )}

      <div style={S.section}>
        <div style={S.sectionTitle}>👤 Profile</div>
        <label style={S.label}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ ...S.input, marginBottom: 10 }} />
        <label style={S.label}>Email</label>
        <div style={{ ...S.input, color: '#8e8e93', marginBottom: 0 }}>{user?.email}</div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{ ...S.bigBtn, opacity: saving ? 0.7 : 1, marginBottom: 16 }}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1a56db', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Go back to Dashboard</button>
      </div>
    </div>
  )
}
