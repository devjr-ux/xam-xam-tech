import { createContext, useContext, useState, useCallback } from 'react'

const RefreshContext = createContext(null)

export function RefreshProvider({ children }) {
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    setTick(n => n + 1)
  }, [])

  return (
    <RefreshContext.Provider value={{ tick, refresh }}>
      {children}
    </RefreshContext.Provider>
  )
}

export const useRefresh = () => {
  const ctx = useContext(RefreshContext)
  if (!ctx) throw new Error('useRefresh must be inside RefreshProvider')
  return ctx
}
