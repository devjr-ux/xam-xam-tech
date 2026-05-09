import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGraduationCap, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({ menuItems, role }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const roleColors = {
    admin: 'from-purple-600 to-indigo-700',
    instructor: 'from-blue-600 to-cyan-600',
    student: 'from-cyan-500 to-blue-600',
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <FaGraduationCap className="text-white text-base" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg">
            Xam<span className="text-cyan-400">Xam</span>
          </span>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white font-bold text-sm`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        {menuItems.map((section, si) => (
          <div key={si} className="mb-4">
            {!collapsed && section.label && (
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                {section.label}
              </p>
            )}
            {section.items.map(({ icon, label, to, badge }, i) => {
              const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
              return (
                <Link
                  key={i}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className={`text-lg flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-cyan-400'}`}>
                    {icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1">{label}</span>
                  )}
                  {!collapsed && badge && (
                    <span className="bg-cyan-500 text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className="text-lg flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex flex-col bg-slate-900 border-r border-white/10 h-screen sticky top-0 overflow-hidden"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 right-3 z-10 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          {collapsed ? <FaBars size={12} /> : <FaTimes size={12} />}
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"
        >
          <FaBars />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/60 z-40"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 overflow-y-auto"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
