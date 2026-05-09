import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaTrash, FaBan, FaCheck, FaSpinner } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { adminService } from '../../services/adminService'
import { useRefresh } from '../../context/RefreshContext'
import { useDebounce } from '../../hooks/useDebounce'

const roleBadge = { admin: 'purple', instructor: 'blue', student: 'green' }
const roleLabel = { admin: 'Admin', instructor: 'Formateur', student: 'Apprenant' }

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-5 py-3 rounded-xl shadow-lg text-sm`}>
      {message}
    </motion.div>
  )
}

export default function AdminUsersPage() {
  const { refresh }             = useRefresh()
  const [users, setUsers]       = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [acting, setActing]     = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toast, setToast]       = useState(null)
  const debouncedSearch         = useDebounce(search, 400)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback((params = {}) => {
    setLoading(true)
    adminService.getUsers({ search: debouncedSearch, role: roleFilter, ...params })
      .then(r => { setUsers(r.data.data ?? r.data); setMeta(r.data.meta ?? null) })
      .finally(() => setLoading(false))
  }, [debouncedSearch, roleFilter])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (user) => {
    setActing(user.id)
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    try {
      await adminService.updateUser(user.id, { status: newStatus })
      setUsers(p => p.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
      showToast(`Utilisateur ${newStatus === 'active' ? 'activé' : 'suspendu'}.`)
      refresh()
    } catch {
      showToast('Erreur lors de la mise à jour.', 'error')
    } finally { setActing(null) }
  }

  const deleteUser = async (user) => {
    setConfirmDel(null)
    setActing(user.id)
    try {
      await adminService.deleteUser(user.id)
      setUsers(p => p.filter(u => u.id !== user.id))
      showToast('Utilisateur supprimé.')
      refresh()
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur.', 'error')
    } finally { setActing(null) }
  }

  const handleSearch = (val) => { setSearch(val); load({ search: val, role: roleFilter }) }
  const handleRole   = (val) => { setRoleFilter(val); load({ search: debouncedSearch, role: val }) }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <AnimatePresence>{toast && <Toast key="t" {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-1">{loading ? '...' : `${meta?.total ?? users.length} utilisateurs`}</p>
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
        </div>
        <select value={roleFilter} onChange={e => handleRole(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
          <option value="">Tous les rôles</option>
          <option value="student">Apprenants</option>
          <option value="instructor">Formateurs</option>
          <option value="admin">Admins</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Rôle</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Inscription</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><Skeleton className="w-9 h-9 rounded-xl" /><div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-36" /></div></div></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-1.5"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                    </tr>
                  ))
                : users.map((user) => {
                    const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                              <p className="text-slate-400 text-xs truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge color={roleBadge[user.role] ?? 'gray'}>{roleLabel[user.role] ?? user.role}</Badge>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-slate-500 text-xs">{new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge color={user.status === 'active' ? 'green' : 'red'}>
                            {user.status === 'active' ? '● Actif' : '● Suspendu'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => toggleStatus(user)} disabled={acting === user.id}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${user.status === 'active' ? 'bg-orange-50 hover:bg-orange-100 text-orange-500' : 'bg-green-50 hover:bg-green-100 text-green-500'}`}>
                              {acting === user.id ? <FaSpinner className="animate-spin text-xs" /> : user.status === 'active' ? <FaBan className="text-xs" /> : <FaCheck className="text-xs" />}
                            </button>
                            <button onClick={() => setConfirmDel(user)} disabled={acting === user.id}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50">
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="text-center py-12 text-slate-400"><p className="text-4xl mb-2">👥</p><p className="text-sm">Aucun utilisateur trouvé</p></div>
          )}
        </div>
      </motion.div>

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Supprimer {confirmDel.name} ?</h3>
              <p className="text-slate-500 text-sm mb-5">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <Button variant="danger" className="flex-1 justify-center" onClick={() => deleteUser(confirmDel)}>Supprimer</Button>
                <Button variant="ghost" className="flex-1 justify-center" onClick={() => setConfirmDel(null)}>Annuler</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
