import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useRefresh } from '../../context/RefreshContext'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdSend } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useMyCourses } from '../../hooks/useInstructor'
import { instructorService } from '../../services/instructorService'
import { useDebounce } from '../../hooks/useDebounce'

const statusMap = {
  published: { color: 'green',  label: 'Publié' },
  draft:     { color: 'gray',   label: 'Brouillon' },
  pending:   { color: 'yellow', label: 'En attente' },
  rejected:  { color: 'red',    label: 'Refusé' },
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose ?? (() => {}), 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-5 py-3 rounded-xl shadow-lg text-sm`}
    >
      {message}
    </motion.div>
  )
}

export default function InstructorCoursesPage() {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast]           = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const debouncedSearch             = useDebounce(search, 400)

  const { courses, loading, error, reload } = useMyCourses({
    search: debouncedSearch,
    status: statusFilter,
  })
  const { refresh } = useRefresh()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDelete = useCallback(async (course) => {
    if (!confirm(`Supprimer "${course.title}" ? Cette action est irréversible.`)) return
    setDeleting(course.id)
    try {
      await instructorService.deleteCourse(course.id)
      showToast('Cours supprimé.')
      refresh()
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur lors de la suppression.', 'error')
    } finally {
      setDeleting(null)
    }
  }, [reload])

  const handleSubmit = useCallback(async (course) => {
    setSubmitting(course.id)
    try {
      await instructorService.submitCourse(course.id)
      showToast('Cours soumis pour validation !')
      refresh()
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur.', 'error')
    } finally {
      setSubmitting(null)
    }
  }, [reload])

  const handleSearchChange = (val) => {
    setSearch(val)
    reload({ search: val, status: statusFilter })
  }

  const handleStatusChange = (val) => {
    setStatusFilter(val)
    reload({ search: debouncedSearch, status: val })
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <AnimatePresence>
        {toast && <Toast key="t" {...toast} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes formations</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? '...' : `${courses.length} cours`}
          </p>
        </div>
        <Link to="/instructor/courses/create">
          <Button icon={<MdAdd />}>Créer un cours</Button>
        </Link>
      </motion.div>

      {error && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
          {error}
        </motion.div>
      )}

      {/* Filtres */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text" value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Rechercher un cours..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>
        <select value={statusFilter} onChange={e => handleStatusChange(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="pending">En attente</option>
          <option value="published">Publié</option>
          <option value="rejected">Refusé</option>
        </select>
      </motion.div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-slate-500 text-sm mb-4">
            {search || statusFilter ? 'Aucun cours trouvé.' : "Vous n'avez pas encore créé de cours."}
          </p>
          {!search && !statusFilter && (
            <Link to="/instructor/courses/create">
              <Button icon={<MdAdd />} size="sm">Créer mon premier cours</Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {courses.map((course) => {
            const status = statusMap[course.status] ?? statusMap.draft
            const thumbUrl = course.thumbnail
              ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${course.thumbnail}`
              : null

            return (
              <motion.div key={course.id} variants={fadeInUp}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                  {thumbUrl
                    ? <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover" />
                    : course.title.charAt(0)
                  }
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-slate-800 truncate">{course.title}</p>
                    <Badge color={status.color}>{status.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span>👥 {(course.students_count ?? 0).toLocaleString('fr-FR')} apprenants</span>
                    <span>💰 {Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA</span>
                    {course.category && <span>📂 {course.category.name}</span>}
                    <span>📊 {course.level}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(course.status === 'draft' || course.status === 'rejected') && (
                    <button
                      onClick={() => handleSubmit(course)}
                      disabled={submitting === course.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 text-xs font-medium transition-colors disabled:opacity-60"
                    >
                      {submitting === course.id
                        ? <FaSpinner className="animate-spin" />
                        : <MdSend />
                      }
                      Soumettre
                    </button>
                  )}
                  <Link to={`/instructor/courses/${course.id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors">
                    <MdEdit /> Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(course)}
                    disabled={deleting === course.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium transition-colors disabled:opacity-60"
                  >
                    {deleting === course.id ? <FaSpinner className="animate-spin" /> : <MdDelete />}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
