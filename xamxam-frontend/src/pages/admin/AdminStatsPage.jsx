import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import { useState } from 'react'
import { adminService } from '../../services/adminService'

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <Skeleton className="h-8 w-8 mb-2" />
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export default function AdminStatsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useRefreshOnNav(() => {
    setLoading(true)
    adminService.getDashboard()
      .then(r => setData(r))
      .finally(() => setLoading(false))
  })

  const top = data?.top_courses ?? []
  const maxStudents = top.length ? Math.max(...top.map(c => c.enrollments_count ?? 0), 1) : 1

  const kpis = data ? [
    { label: 'Utilisateurs total',    value: (data.total_users        ?? 0).toLocaleString('fr-FR'), icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Inscriptions total',    value: (data.total_enrollments  ?? 0).toLocaleString('fr-FR'), icon: '📋', color: 'bg-cyan-50 text-cyan-700' },
    { label: 'Taux de complétion',    value: '—',                                                    icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Certificats délivrés',  value: (data.total_certificates ?? 0).toLocaleString('fr-FR'), icon: '🏆', color: 'bg-yellow-50 text-yellow-700' },
  ] : []

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Statistiques globales 📊</h1>
        <p className="text-slate-500 text-sm mt-1">Analyse complète de la plateforme XamXam Tech</p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1,2,3,4].map(i => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="text-2xl mb-2">{kpi.icon}</div>
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                <p className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${kpi.color}`}>{kpi.label}</p>
              </motion.div>
            ))
        }
      </motion.div>

      {/* Répartition par rôle + Top cours */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Répartition utilisateurs */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-5">Répartition des utilisateurs</h3>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i}><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-2 w-full rounded-full" /></div>)}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: '🎓 Apprenants',  value: data?.total_students    ?? 0, color: 'cyan' },
                { label: '👨‍🏫 Formateurs', value: data?.total_instructors ?? 0, color: 'blue' },
                { label: '👑 Admins',      value: (data?.total_users ?? 0) - (data?.total_students ?? 0) - (data?.total_instructors ?? 0), color: 'purple' },
              ].map((item, i) => {
                const pct = data?.total_users > 0 ? Math.round((item.value / data.total_users) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5 text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.value.toLocaleString('fr-FR')} · {pct}%</span>
                    </div>
                    <ProgressBar value={pct} showPercent={false} color={item.color} />
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Stats cours */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-5">État des formations</h3>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i}><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-2 w-full rounded-full" /></div>)}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: '✅ Publiées',    value: data?.total_courses   ?? 0, total: data?.total_courses ?? 0, color: 'green' },
                { label: '⏳ En attente',  value: data?.pending_courses ?? 0, total: (data?.total_courses ?? 0) + (data?.pending_courses ?? 0), color: 'yellow' },
              ].map((item, i) => {
                const total = (data?.total_courses ?? 0) + (data?.pending_courses ?? 0)
                const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5 text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.value} cours · {pct}%</span>
                    </div>
                    <ProgressBar value={pct} showPercent={false} color={item.color} />
                  </div>
                )
              })}

              <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{data?.total_enrollments?.toLocaleString('fr-FR') ?? 0}</p>
                  <p className="text-xs text-slate-400">Inscriptions</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-800">{data?.total_certificates?.toLocaleString('fr-FR') ?? 0}</p>
                  <p className="text-xs text-slate-400">Certificats</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top formations */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5">Top formations par apprenants</h3>
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <div className="flex-1"><Skeleton className="h-4 w-48 mb-1" /><Skeleton className="h-2 w-full rounded-full" /></div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : top.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Aucune formation publiée</p>
        ) : (
          <div className="space-y-4">
            {top.map((course, i) => {
              const pct = Math.round(((course.enrollments_count ?? 0) / maxStudents) * 100)
              return (
                <div key={course.id} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{course.title}</span>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                        {Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <ProgressBar value={pct} showPercent={false} color={i < 2 ? 'cyan' : 'blue'} />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right flex-shrink-0">
                    {(course.enrollments_count ?? 0).toLocaleString('fr-FR')} élèves
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Utilisateurs récents */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5">Derniers utilisateurs inscrits</h3>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="flex-1"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-40" /></div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(data?.recent_users ?? []).map((u) => {
              const roles = { admin: { label: '👑 Admin', color: 'purple' }, instructor: { label: '👨‍🏫 Formateur', color: 'blue' }, student: { label: '🎓 Apprenant', color: 'green' } }
              const r = roles[u.role] || { label: u.role, color: 'gray' }
              const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={u.id} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      r.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>{r.label}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
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
