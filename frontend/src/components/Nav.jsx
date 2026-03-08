import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Nav() {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const links = [
    { to: '/', label: 'Home', icon: '📊' },
    { to: '/templates', label: 'Templates', icon: '✉️' },
    { to: '/alerts', label: 'Alerts', icon: '🔔' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ]
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <span style={{ color: '#1e293b', fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px' }}>FeedbackIQ</span>
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Sign out</button>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 60 }}>
        {links.map(({ to, label, icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', padding: '8px 16px', color: active ? '#2563eb' : '#94a3b8' }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
