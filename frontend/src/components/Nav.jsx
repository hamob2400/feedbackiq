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
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e8e8ed', padding: '0 18px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#1c1c1e', letterSpacing: '-0.3px' }}>
          <span style={{ color: '#1a9e3f' }}>Feedback</span>IQ ⭐
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#8e8e93', fontSize: 14, cursor: 'pointer' }}>Sign out</button>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: '#fff', borderTop: '1px solid #e8e8ed', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 58 }}>
        {links.map(({ to, label, icon }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', padding: '6px 18px', color: active ? '#1a56db' : '#8e8e93' }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.02em' }}>{label.toUpperCase()}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
