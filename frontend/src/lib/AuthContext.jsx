import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken, clearToken, getToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (getToken()) {
      api.me()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.login(email, password)
    setToken(res.token)
    setUser(res.user)
    return res
  }

  const signup = async (email, password, name) => {
    const res = await api.signup(email, password, name)
    setToken(res.token)
    setUser(res.user)
    return res
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const refreshUser = async () => {
    const u = await api.me()
    setUser(u)
    return u
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
