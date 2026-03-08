import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { LayoutDashboard, FileText, Bell, Settings, LogOut, Star } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Nav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <Link to="/" className="flex items-center gap-2 mr-6 font-bold text-indigo-400 text-lg tracking-tight">
          <Star size={18} fill="currentColor" /> FeedbackIQ
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
                <Icon size={15} />{label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {user.subscription_status !== 'pro' && (
            <Link to="/settings" className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition">
              Upgrade to Pro
            </Link>
          )}
          <span className="text-sm text-slate-400 hidden sm:block">{user.email}</span>
          <button onClick={() => { logout(); navigate('/login') }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
