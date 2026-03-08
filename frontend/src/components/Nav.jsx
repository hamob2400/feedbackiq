import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Nav() {
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/templates', label: 'Templates', icon: '✉️' },
    { to: '/alerts', label: 'Alerts', icon: '🔔' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0f172a', borderBottom: '1px solid #1e293b',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>FeedbackIQ</span>
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer' }}>Sign out</button>
      </div>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#0f172a', borderTop: '1px solid #1e293b',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        height: 64
      }}>
        {links.map(({ to, label, icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              textDecoration: 'none', padding: '8px 16px',
              color: active ? '#3b82f6' : '#475569',
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
