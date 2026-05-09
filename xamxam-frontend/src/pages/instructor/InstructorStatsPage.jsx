import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import { useInstructorStats } from '../../hooks/useInstructor'

const COLORS = ['cyan', 'blue', 'green', 'purple', 'yellow']

function StatCard({ label, value, icon, gradient, sub }) {
  return (
    <motion.div variants={fadeInUp} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-white/80 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <Skeleton className="h-8 w-8 rounded-lg mb-3" />
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

const statusMap = {
  published: { color: 'green', label: 'Publié' },
  draft:     { color: 'gray',  label: 'Brouillon' },
  pending:   { color: 'yellow',label: 'En attente' },
  rejected:  { color: 'red',   label: 'Refusé' },
}

export default function InstructorStatsPage() {
  const { data, loading, error } = useInstructorStats()

  const maxEnrollment = data?.monthly_enrollments?.length
    ? Math.max(...data.monthly_enrollments.map(d => d.count), 1)
    : 1

  const maxStudents = data?.courses_breakdown?.length
    ? Math.max(...data.courses_breakdown.map(c => c.students_count ?? 0), 1)
    : 1

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Mes statistiques 📊</h1>
        <p className="text-slate-500 text-sm mt-1">Suivi de vos performances et revenus</p>
      </motion.div>

      {error && (
        <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
          {error}
        </motion.div>
      )}

      {/* KPIs */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : [
              {
                label: 'Apprenants total', icon: '👥',
                value: (data?.total_students ?? 0).toLocaleString('fr-FR'),
                gradient: 'from-cyan-500 to-blue-600',
                sub: `${data?.total_courses ?? 0} cours`,
              },
              {
                label: 'Revenus total', icon: '💰',
                value: data?.total_revenue
                  ? `${Number(data.total_revenue).toLocaleString('fr-FR')} FCFA`
                  : '0 FCFA',
                gradient: 'from-green-500 to-emerald-600',
                sub: 'Cumul inscriptions',
              },
              {
                label: 'Note moyenne', icon: '⭐',
                value: data?.avg_rating ? `${data.avg_rating} / 5` : '—',
                gradient: 'from-yellow-400 to-orange-500',
                sub: `${data?.total_courses ?? 0} cours notés`,
              },
              {
                label: 'Taux de réussite quiz', icon: '✅',
                value: `${data?.quiz_pass_rate ?? 0}%`,
                gradient: 'from-purple-500 to-pink-600',
                sub: `${data?.total_quiz_attempts ?? 0} tentatives`,
              },
            ].map((kpi, i) => <StatCard key={i} {...kpi} />)
        }
      </motion.div>

      {/* Inscriptions mensuelles + Revenus par cours */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Graphique inscriptions */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-5">Inscriptions par mois</h3>
          {loading ? (
            <div className="flex items-end gap-2.5 h-36">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <Skeleton className="w-full rounded-t-lg" style={{ height: `${30 + Math.random() * 60}%` }} />
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          ) : !data?.monthly_enrollments?.length ? (
            <div className="flex items-center justify-center h-36 text-slate-400 text-sm">
              Pas encore de données d'inscriptions
            </div>
          ) : (
            <div className="flex items-end gap-2 h-36">
              {data.monthly_enrollments.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-400">{d.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxEnrollment) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-[10px] text-slate-400">{d.month}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Apprenants par cours */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-5">Apprenants par cours</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : !data?.courses_breakdown?.length ? (
            <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
              Aucun cours pour l'instant
            </div>
          ) : (
            <div className="space-y-4">
              {data.courses_breakdown.map((c, i) => (
                <div key={c.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{c.title}</span>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                      {(c.students_count ?? 0).toLocaleString('fr-FR')} apprenants
                    </span>
                  </div>
                  <ProgressBar
                    value={Math.round(((c.students_count ?? 0) / maxStudents) * 100)}
                    showPercent={false}
                    color={COLORS[i % COLORS.length]}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Détail par cours */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5">Détail par formation</h3>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : !data?.courses_breakdown?.length ? (
          <p className="text-slate-400 text-sm text-center py-8">Aucun cours trouvé.</p>
        ) : (
          <div className="space-y-3">
            {data.courses_breakdown.map((c) => {
              const status = statusMap[c.status] ?? statusMap.draft
              const revenue = Number(c.price ?? 0) * (c.students_count ?? 0)
              return (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {c.thumbnail
                      ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${c.thumbnail}`} alt="" className="w-full h-full object-cover" />
                      : c.title.charAt(0)
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-800 text-sm truncate">{c.title}</p>
                      <Badge color={status.color}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {c.rating > 0 && <span>⭐ {c.rating}</span>}
                      <span>👥 {(c.students_count ?? 0).toLocaleString('fr-FR')} apprenants</span>
                      <span>💰 {Number(c.price ?? 0).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800 text-sm">
                      {revenue.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-slate-400 text-xs">FCFA total</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
