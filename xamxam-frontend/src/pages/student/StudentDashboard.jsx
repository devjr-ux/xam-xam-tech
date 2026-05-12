import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import { motion } from 'framer-motion'
import { MdSchool, MdEmojiEvents, MdQuiz, MdLocalFireDepartment } from 'react-icons/md'
import { FaPlay, FaArrowRight } from 'react-icons/fa'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { studentService } from '../../services/studentService'

const GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-green-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-500',
  'from-yellow-400 to-orange-500',
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useRefreshOnNav(() => {
    setLoading(true)
    studentService.getDashboard()
      .then(r => setData(r))
      .finally(() => setLoading(false))
  }, [])

  const enrollments  = data?.enrolled_courses ?? []
  const certificates = data?.certificates ?? []

  const stats = [
    { icon: <MdSchool />,             label: 'Cours suivis',   value: loading ? '...' : enrollments.length,       light: 'bg-cyan-50 text-cyan-600' },
    { icon: <MdEmojiEvents />,        label: 'Certificats',    value: loading ? '...' : certificates.length,      light: 'bg-yellow-50 text-yellow-600' },
    { icon: <MdQuiz />,               label: 'Quiz réussis',   value: loading ? '...' : (data?.quiz_passed ?? 0), light: 'bg-green-50 text-green-600' },
    { icon: <MdLocalFireDepartment />, label: 'Quiz tentés',   value: loading ? '...' : (data?.quiz_attempts ?? 0), light: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bonjour, {user?.name?.split(' ')[0]} 🎓</h1>
          <p className="text-slate-500 text-sm mt-1">Continuez votre apprentissage là où vous vous êtes arrêté</p>
        </div>
        <Link to="/courses"><Button size="sm" icon={<FaArrowRight />}>Explorer les cours</Button></Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} custom={i} variants={cardVariants} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover">
            <div className={`w-10 h-10 rounded-xl ${stat.light} flex items-center justify-center text-xl mb-3`}>{stat.icon}</div>
            {loading
              ? <><Skeleton className="h-7 w-12 mb-1" /><Skeleton className="h-4 w-20" /></>
              : <><p className="text-2xl font-bold text-slate-800">{stat.value}</p><p className="text-slate-500 text-sm">{stat.label}</p></>
            }
          </motion.div>
        ))}
      </motion.div>

      {/* Continuer l'apprentissage */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-slate-800">Continuer l'apprentissage</h3>
          <Link to="/student/courses" className="text-cyan-600 text-sm hover:underline">Voir tout</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                <Skeleton className="h-20 w-full" />
                <div className="p-4"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2 mb-3" /><Skeleton className="h-2 w-full rounded-full mb-3" /><Skeleton className="h-8 w-full rounded-xl" /></div>
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm mb-4">Vous n'êtes inscrit à aucun cours.</p>
            <Link to="/courses"><Button size="sm" icon={<FaArrowRight />}>Découvrir les cours</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enrollments.slice(0, 3).map((enrollment, i) => {
              const course = enrollment.course ?? {}
              const prog   = enrollment.progress ?? 0
              const thumbUrl = course.thumbnail
                ? course.thumbnail
                : null
              return (
                <div key={enrollment.id ?? i} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-20 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center relative overflow-hidden`}>
                    {thumbUrl
                      ? <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover" />
                      : <span className="text-4xl">📚</span>
                    }
                    <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-lg">{prog}%</div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-800 text-sm mb-1 truncate">{course.title ?? '—'}</p>
                    <ProgressBar value={prog} />
                    <Link to={`/courses/${course.id}/learn`}>
                      <Button size="sm" className="w-full justify-center mt-3" icon={<FaPlay className="text-xs" />}>
                        {prog >= 100 ? 'Revoir' : 'Continuer'}
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Score quiz moyen */}
      {!loading && data?.avg_quiz_score > 0 && (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Performance quiz</h3>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
              data.avg_quiz_score >= 70 ? 'bg-green-500' : data.avg_quiz_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {Math.round(data.avg_quiz_score)}%
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">Score moyen</p>
              <ProgressBar value={Math.round(data.avg_quiz_score)} color={data.avg_quiz_score >= 70 ? 'green' : 'cyan'} />
              <p className="text-xs text-slate-400 mt-1">{data.quiz_passed} réussi(s) sur {data.quiz_attempts} tentative(s)</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
