import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import Templates from './pages/Templates'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/templates" element={<RequireAuth><Templates /></RequireAuth>} />
        <Route path="/alerts" element={<RequireAuth><Alerts /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
