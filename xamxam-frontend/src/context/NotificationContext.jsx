import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NotificationContext = createContext(null)

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
const COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const notify = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration)
    }
  }, [])

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const success = useCallback((msg) => notify({ message: msg, type: 'success' }), [notify])
  const error = useCallback((msg) => notify({ message: msg, type: 'error' }), [notify])
  const info = useCallback((msg) => notify({ message: msg, type: 'info' }), [notify])
  const warning = useCallback((msg) => notify({ message: msg, type: 'warning' }), [notify])

  return (
    <NotificationContext.Provider value={{ notify, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg pointer-events-auto ${COLORS[n.type]}`}
            >
              <span className="text-lg flex-shrink-0">{ICONS[n.type]}</span>
              <p className="text-sm flex-1">{n.message}</p>
              <button
                onClick={() => dismiss(n.id)}
                className="opacity-60 hover:opacity-100 text-lg leading-none ml-1"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider')
  return ctx
}
