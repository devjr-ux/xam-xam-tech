import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('xamxam_token'))
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('xamxam_token')
    localStorage.removeItem('xamxam_user')
  }, [])

  // Valider le token au démarrage (évite les tokens expirés après migrate:fresh)
  useEffect(() => {
    const t = localStorage.getItem('xamxam_token')
    if (!t) { setLoading(false); return }

    authService.me()
      .then(({ data }) => {
        setUser(data)
        setToken(t)
        localStorage.setItem('xamxam_user', JSON.stringify(data))
      })
      .catch(() => {
        // Token invalide → vider la session
        clearSession()
      })
      .finally(() => setLoading(false))
  }, [clearSession])

  // Écouter l'événement 401 de api.js
  useEffect(() => {
    const handler = () => clearSession()
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [clearSession])

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('xamxam_token', authToken)
    localStorage.setItem('xamxam_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(async () => {
    try { if (token) await authService.logout() } catch {}
    clearSession()
  }, [token, clearSession])

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await authService.me()
      setUser(data)
      localStorage.setItem('xamxam_user', JSON.stringify(data))
    } catch { clearSession() }
  }, [token, clearSession])

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, refreshUser,
      isAdmin:      () => user?.role === 'admin',
      isInstructor: () => user?.role === 'instructor',
      isStudent:    () => user?.role === 'student',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
