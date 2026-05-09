import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaEnvelope, FaSpinner } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import { useStudents } from '../../hooks/useInstructor'
import { useMyCourses } from '../../hooks/useInstructor'
import { useDebounce } from '../../hooks/useDebounce'

function getStatus(progress) {
  if (progress >= 100) return { color: 'cyan',   label: 'Complété' }
  if (progress > 0)    return { color: 'green',  label: 'Actif' }
  return                      { color: 'yellow', label: 'Inactif' }
}

function StudentCard({ enrollment }) {
  const u      = enrollment.user ?? {}
  const course = enrollment.course ?? {}
  const prog   = enrollment.progress ?? 0
  const status = getStatus(prog)
  const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          {u.avatar
            ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-xl" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800 text-sm truncate">{u.name ?? 'Inconnu'}</p>
            {u.country && <span className="text-sm">{u.country}</span>}
          </div>
          <p className="text-slate-400 text-xs truncate">{course.title ?? '—'}</p>
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progression</span>
          <span className="font-semibold">{prog}%</span>
        </div>
        <ProgressBar value={prog} showPercent={false} color={prog >= 80 ? 'green' : 'cyan'} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>Email : <strong className="text-slate-700">{u.email ?? '—'}</strong></span>
        <a href={`mailto:${u.email}`} className="text-cyan-600 hover:text-cyan-800 transition-colors">
          <FaEnvelope />
        </a>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-28 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full mb-3" />
      <Skeleton className="h-3 w-36 mt-3" />
    </div>
  )
}

export default function InstructorStudentsPage() {
  const [search, setSearch]   = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const { students, loading, error, reload } = useStudents({
    search: debouncedSearch,
    course_id: courseFilter,
    per_page: 20,
  })

  const { courses } = useMyCourses({ per_page: 100 })

  // Re-fetch quand les filtres changent
  const handleSearch = useCallback((val) => {
    setSearch(val)
    reload({ search: val, course_id: courseFilter })
  }, [courseFilter, reload])

  const handleCourseFilter = useCallback((val) => {
    setCourseFilter(val)
    reload({ search: debouncedSearch, course_id: val })
  }, [debouncedSearch, reload])

  const active    = students.filter(e => (e.progress ?? 0) > 0 && (e.progress ?? 0) < 100).length
  const completed = students.filter(e => (e.progress ?? 0) >= 100).length
  const inactive  = students.filter(e => (e.progress ?? 0) === 0).length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes apprenants</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? '...' : `${students.length} apprenant(s) trouvé(s)`}
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
          {error}
        </motion.div>
      )}

      {/* Stats rapides */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Actifs',    value: active,    color: 'bg-green-50 text-green-700' },
          { label: 'Complétés', value: completed, color: 'bg-cyan-50 text-cyan-700' },
          { label: 'Inactifs',  value: inactive,  color: 'bg-yellow-50 text-yellow-700' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeInUp} className={`${s.color} rounded-2xl p-4 text-center`}>
            {loading ? <Skeleton className="h-8 w-8 mx-auto mb-1" /> : <p className="text-2xl font-bold">{s.value}</p>}
            <p className="text-xs opacity-80">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text" value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher un apprenant..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>
        <select
          value={courseFilter} onChange={e => handleCourseFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm min-w-[180px]">
          <option value="">Tous les cours</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </motion.div>

      {/* Grille apprenants */}
      {loading ? (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </motion.div>
      ) : students.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-500 text-sm">
            {search || courseFilter
              ? 'Aucun apprenant ne correspond à votre recherche.'
              : 'Aucun apprenant inscrit pour l\'instant.'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((enrollment, i) => (
            <StudentCard key={enrollment.id ?? i} enrollment={enrollment} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
