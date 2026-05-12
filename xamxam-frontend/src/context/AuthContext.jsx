import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserProfile, login as fbLogin, logout as fbLogout, register as fbRegister } from '../firebase/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  /* ── Écouter les changements d'état Firebase Auth ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Charger le profil Firestore (contient le rôle)
        const profile = await getUserProfile(firebaseUser.uid)
        if (profile) {
          setUser({ ...profile, uid: firebaseUser.uid })
        } else {
          // Profil manquant → déconnecter
          await fbLogout()
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async (email, password) => {
    const { user: profile } = await fbLogin(email, password)
    // onAuthStateChanged va auto-mettre à jour le state
    return profile
  }

  const register = async (data) => {
    const result = await fbRegister(data)
    return result
  }

  const logout = async () => {
    await fbLogout()
    setUser(null)
  }

  const refreshUser = async () => {
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid)
      if (profile) setUser({ ...profile, uid: auth.currentUser.uid })
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      refreshUser,
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
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
