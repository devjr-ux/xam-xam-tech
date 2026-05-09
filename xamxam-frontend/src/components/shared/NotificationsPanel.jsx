import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBell, FaTimes, FaCheck } from 'react-icons/fa'
import { slideDown } from '../../animations/variants'

const mockNotifications = [
  { id: 1, type: 'enrollment', message: 'Aminata Diallo s\'est inscrite à votre cours React.js', time: 'Il y a 5min', read: false, icon: '🎓' },
  { id: 2, type: 'quiz', message: 'Ibrahim Touré a terminé le quiz avec 95%', time: 'Il y a 20min', read: false, icon: '🏆' },
  { id: 3, type: 'forum', message: 'Nouvelle réponse à votre discussion "React Hooks"', time: 'Il y a 1h', read: false, icon: '💬' },
  { id: 4, type: 'system', message: 'Votre cours a été approuvé et publié', time: 'Il y a 2h', read: true, icon: '✅' },
  { id: 5, type: 'payment', message: 'Paiement reçu : 25,000 FCFA', time: 'Hier', read: true, icon: '💰' },
]

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
      >
        <FaBell className="text-sm" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              variants={slideDown}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  {unread > 0 && (
                    <span className="bg-cyan-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{unread}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-cyan-600 hover:text-cyan-800">
                      Tout lire
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <FaBell className="text-3xl mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${!n.read ? 'bg-cyan-50/30' : ''}`}
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${!n.read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-1">{n.time}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.read && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
                        <button
                          onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                          className="text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 text-center">
                  <button className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
