import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import { motion } from 'framer-motion'
import { FaPlay, FaSearch } from 'react-icons/fa'
import { MdEmojiEvents, MdArrowForward } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { studentService } from '../../services/studentService'

const GRADIENTS = ['from-cyan-500 to-blue-600','from-green-500 to-teal-600','from-purple-500 to-pink-600','from-orange-500 to-red-500','from-yellow-400 to-orange-500','from-blue-500 to-indigo-600']
const FILTERS = ['Tous', 'En cours', 'Terminés']

function getStatusLabel(prog) {
  if (prog >= 100) return 'completed'
  if (prog > 0)    return 'in_progress'
  return 'new'
}

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('Tous')
  const [search, setSearch]           = useState('')

  useRefreshOnNav(() => {
    setLoading(true)
    studentService.getMyCourses()
      .then(r => setEnrollments(r ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  })

  const filtered = enrollments.filter(e => {
    const course = e.course ?? {}
    const prog   = e.progress ?? 0
    const status = getStatusLabel(prog)
    const matchSearch = (course.title ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'Tous' ||
      (filter === 'En cours' && (status === 'in_progress' || status === 'new')) ||
      (filter === 'Terminés' && status === 'completed')
    return matchSearch && matchFilter
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes formations</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? '...' : `${enrollments.length} cours suivi(s)`}
          </p>
        </div>
        <Link to="/courses"><Button size="sm" icon={<MdArrowForward />}>Explorer plus de cours</Button></Link>
      </motion.div>

      {/* Filtres + Recherche */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un cours..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-cyan-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grille des cours */}
      {loading ? (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              <Skeleton className="h-28 w-full" />
              <div className="p-5">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <Skeleton className="h-2 w-full rounded-full mb-4" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-slate-500 text-sm mb-4">
            {enrollments.length === 0 ? "Vous n'êtes inscrit à aucun cours." : "Aucun cours trouvé."}
          </p>
          {enrollments.length === 0 && (
            <Link to="/courses"><Button size="sm" icon={<MdArrowForward />}>Découvrir les cours</Button></Link>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((enrollment, i) => {
            const course = enrollment.course ?? {}
            const prog   = enrollment.progress ?? 0
            const status = getStatusLabel(prog)
            const thumbUrl = course.thumbnail
              ? course.thumbnail
              : null

            return (
              <motion.div key={enrollment.id ?? i} custom={i} variants={cardVariants}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
                <div className={`h-28 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-between px-5 relative overflow-hidden`}>
                  {thumbUrl
                    ? <img src={thumbUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <span className="text-5xl z-10">📚</span>
                  }
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative z-10 ml-auto">
                    {status === 'completed' ? (
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                        <MdEmojiEvents /> Complété
                      </div>
                    ) : (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                        {prog}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-800 mb-1">{course.title ?? '—'}</h3>
                  <p className="text-slate-400 text-xs mb-1">par {course.instructor?.name ?? '—'}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-cyan-600">{Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA</span>
                    {course.level && <span>· {course.level}</span>}
                  </div>

                  <div className="mb-4">
                    <ProgressBar value={prog} color={status === 'completed' ? 'green' : 'cyan'} />
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/courses/${course.id}/learn`} className="flex-1">
                      <Button size="sm" className="w-full justify-center" icon={<FaPlay className="text-xs" />}
                        variant={status === 'completed' ? 'outline' : 'primary'}>
                        {status === 'completed' ? 'Revoir' : 'Continuer'}
                      </Button>
                    </Link>
                    {status === 'completed' && (
                      <Link to="/student/certificates">
                        <Button size="sm" variant="outline" icon={<MdEmojiEvents />}>Certificat</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
