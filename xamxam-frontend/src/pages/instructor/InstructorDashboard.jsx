import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdPeople, MdSchool, MdStar, MdTrendingUp, MdAdd, MdRefresh } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../hooks/useInstructor'

const statusMap = {
  published: { color: 'green',  label: 'Publié' },
  draft:     { color: 'gray',   label: 'Brouillon' },
  pending:   { color: 'yellow', label: 'En attente' },
  rejected:  { color: 'red',    label: 'Refusé' },
}

export default function InstructorDashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useDashboard()

  const stats = data ? [
    {
      icon: <MdSchool />,
      label: 'Mes cours',
      value: data.total_courses ?? 0,
      light: 'bg-cyan-50 text-cyan-600',
    },
    {
      icon: <MdPeople />,
      label: 'Apprenants',
      value: (data.total_students ?? 0).toLocaleString('fr-FR'),
      light: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <MdStar />,
      label: 'Note moyenne',
      value: data.avg_rating ? `${data.avg_rating}/5` : '—',
      light: 'bg-yellow-50 text-yellow-600',
    },
    {
      icon: <MdTrendingUp />,
      label: 'Revenus',
      value: data.total_revenue
        ? `${Number(data.total_revenue).toLocaleString('fr-FR')} F`
        : '0 F',
      light: 'bg-green-50 text-green-600',
    },
  ] : []

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gérez vos formations et suivez vos apprenants</p>
        </div>
        <Link to="/instructor/courses/create">
          <Button icon={<MdAdd />}>Créer un cours</Button>
        </Link>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-center gap-2">
          <MdRefresh className="text-xl cursor-pointer" />
          {error}
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
                <Skeleton className="w-10 h-10 rounded-xl mb-3" />
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : stats.map((stat, i) => (
              <motion.div key={i} custom={i} variants={cardVariants} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover">
                <div className={`w-10 h-10 rounded-xl ${stat.light} flex items-center justify-center text-xl mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </motion.div>
            ))
        }
      </motion.div>

      {/* Mes formations */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-slate-800">Mes formations récentes</h3>
          <Link to="/instructor/courses" className="text-cyan-600 text-sm hover:underline">
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.courses_breakdown?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm mb-4">Vous n'avez pas encore de cours.</p>
            <Link to="/instructor/courses/create">
              <Button icon={<MdAdd />} size="sm">Créer mon premier cours</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(data?.courses_breakdown ?? []).slice(0, 5).map((course) => {
              const status = statusMap[course.status] ?? statusMap.draft
              return (
                <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {course.thumbnail
                      ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${course.thumbnail}`} alt="" className="w-full h-full object-cover" />
                      : course.title.charAt(0)
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800 text-sm truncate">{course.title}</p>
                      <Badge color={status.color}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                      <span>{course.students_count ?? 0} apprenants</span>
                      {course.rating > 0 && <span>⭐ {course.rating}</span>}
                    </div>
                    <ProgressBar
                      value={course.students_count > 0 ? Math.min(100, course.students_count) : 0}
                      showPercent={false}
                    />
                  </div>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="text-slate-400 hover:text-cyan-600 text-xs flex-shrink-0 transition-colors">
                    Modifier
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Inscriptions mensuelles */}
      {!loading && data?.monthly_enrollments?.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-5">Nouvelles inscriptions</h3>
          <div className="flex items-end gap-2 h-28">
            {(() => {
              const max = Math.max(...data.monthly_enrollments.map(d => d.count), 1)
              return data.monthly_enrollments.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{d.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / max) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-[10px] text-slate-400">{d.month}</span>
                </div>
              ))
            })()}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
