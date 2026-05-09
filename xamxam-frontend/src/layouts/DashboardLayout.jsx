import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSearch } from 'react-icons/fa'
import Sidebar from '../components/shared/Sidebar'
import NotificationsPanel from '../components/shared/NotificationsPanel'
import { useAuth } from '../context/AuthContext'
import { slideDown } from '../animations/variants'
import adminMenu from '../routes/menus/adminMenu'
import instructorMenu from '../routes/menus/instructorMenu'
import studentMenu from '../routes/menus/studentMenu'
import { getRoleLabel } from '../utils/formatters'

export default function DashboardLayout() {
  const { user } = useAuth()

  const getMenu = () => {
    if (user?.role === 'admin') return adminMenu
    if (user?.role === 'instructor') return instructorMenu
    return studentMenu
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar menuItems={getMenu()} role={user?.role || 'student'} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <motion.header
          variants={slideDown}
          initial="hidden"
          animate="visible"
          className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 lg:pl-6 pl-16"
        >
          <div className="relative max-w-xs w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <NotificationsPanel />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
