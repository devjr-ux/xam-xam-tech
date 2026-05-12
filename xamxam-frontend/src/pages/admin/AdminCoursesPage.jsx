import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaCheck, FaTimes, FaTrash, FaSpinner } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { adminService } from '../../services/adminService'
import { useDebounce } from '../../hooks/useDebounce'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'

const statusConfig = {
  published: { color: 'green',  label: 'Publié' },
  pending:   { color: 'yellow', label: 'En attente' },
  draft:     { color: 'gray',   label: 'Brouillon' },
  rejected:  { color: 'red',    label: 'Refusé' },
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-5 py-3 rounded-xl shadow-lg text-sm`}>
      {message}
    </motion.div>
  )
}

export default function AdminCoursesPage() {
  const [courses, setCourses]   = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [acting, setActing]     = useState(null)
  const [toast, setToast]       = useState(null)
  const debouncedSearch         = useDebounce(search, 400)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback((params = {}) => {
    setLoading(true)
    adminService.getCourses({ search: debouncedSearch, status: statusFilter, ...params })
      .then(r => { const arr = Array.isArray(r) ? r : (r?.data ?? []); setCourses(arr); setMeta(null) })
      .finally(() => setLoading(false))
  }, [debouncedSearch, statusFilter])

  useEffect(() => { load() }, [load])
  useRefreshOnNav(load)

  const act = async (id, action) => {
    setActing(id + action)
    try {
      if (action === 'publish') {
        await adminService.publishCourse(id)
        setCourses(p => p.map(c => c.id === id ? { ...c, status: 'published' } : c))
        showToast('Cours publié !')
      } else if (action === 'reject') {
        await adminService.rejectCourse(id)
        setCourses(p => p.map(c => c.id === id ? { ...c, status: 'rejected' } : c))
        showToast('Cours refusé.')
      } else if (action === 'delete') {
        if (!confirm('Supprimer ce cours définitivement ?')) { setActing(null); return }
        await adminService.deleteCourse(id)
        setCourses(p => p.filter(c => c.id !== id))
        showToast('Cours supprimé.')
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur.', 'error')
    } finally { setActing(null) }
  }

  const handleSearch = (val) => { setSearch(val); load({ search: val, status: statusFilter }) }
  const handleStatus = (val) => { setStatusFilter(val); load({ search: debouncedSearch, status: val }) }

  const counts = {
    total:     courses.length,
    published: courses.filter(c => c.status === 'published').length,
    pending:   courses.filter(c => c.status === 'pending').length,
    draft:     courses.filter(c => c.status === 'draft').length,
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <AnimatePresence>{toast && <Toast key="t" {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Gestion des formations</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez, validez et publiez les formations</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
        {[
          { label: 'Total',      value: loading ? '...' : counts.total,     color: 'bg-slate-100 text-slate-700' },
          { label: 'Publiés',    value: loading ? '...' : counts.published,  color: 'bg-green-100 text-green-700' },
          { label: 'En attente', value: loading ? '...' : counts.pending,    color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Brouillons', value: loading ? '...' : counts.draft,      color: 'bg-gray-100 text-gray-700' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-xl px-4 py-2 text-sm font-semibold`}>
            {s.label} : {s.value}
          </div>
        ))}
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => handleStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
          <option value="">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="pending">En attente</option>
          <option value="draft">Brouillons</option>
          <option value="rejected">Refusés</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Formation</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Formateur</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Apprenants</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Prix</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl" /><div><Skeleton className="h-4 w-36 mb-1" /><Skeleton className="h-3 w-20" /></div></div></td>
                      <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-1.5"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                    </tr>
                  ))
                : courses.map((course) => {
                    const status = statusConfig[course.status] ?? statusConfig.draft
                    const thumbUrl = course.thumbnail || null
                    return (
                      <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                              {thumbUrl ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" /> : '📚'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">{course.title}</p>
                              <p className="text-slate-400 text-xs">{course.categoryName ?? '—'} · {course.level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-slate-600 text-sm">{course.instructorName ?? '—'}</span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-slate-600 text-sm">{(course.enrollmentsCount ?? 0).toLocaleString('fr-FR')}</span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-slate-700 text-sm font-semibold">
                            {Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge color={status.color}>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {course.status === 'pending' && (
                              <>
                                <button onClick={() => act(course.id, 'publish')} disabled={!!acting}
                                  className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 flex items-center justify-center transition-colors disabled:opacity-50" title="Publier">
                                  {acting === course.id + 'publish' ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                                </button>
                                <button onClick={() => act(course.id, 'reject')} disabled={!!acting}
                                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50" title="Refuser">
                                  {acting === course.id + 'reject' ? <FaSpinner className="animate-spin text-xs" /> : <FaTimes className="text-xs" />}
                                </button>
                              </>
                            )}
                            <button onClick={() => act(course.id, 'delete')} disabled={!!acting}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50">
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
          {!loading && courses.length === 0 && (
            <div className="text-center py-12 text-slate-400"><p className="text-4xl mb-2">📚</p><p className="text-sm">Aucune formation trouvée</p></div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
