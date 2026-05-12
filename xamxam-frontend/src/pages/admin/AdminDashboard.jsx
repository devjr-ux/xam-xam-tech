import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import { MdPeople, MdSchool, MdEmojiEvents, MdTrendingUp } from 'react-icons/md'
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { adminService } from '../../services/adminService'

const roleBadge = { instructor: 'blue', student: 'green', admin: 'purple' }
const roleLabel = { instructor: 'Formateur', student: 'Apprenant', admin: 'Admin' }

export default function AdminDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useRefreshOnNav(() => {
    setLoading(true)
    adminService.getDashboard()
      .then(r => setData(r))
      .finally(() => setLoading(false))
  })

  const stats = data ? [
    { icon: <MdPeople />,         label: 'Utilisateurs',  value: data.total_users?.toLocaleString('fr-FR') ?? '0',        change: `${data.total_students} apprenants`,  light: 'bg-blue-50 text-blue-600' },
    { icon: <MdSchool />,         label: 'Formations',    value: data.total_courses?.toLocaleString('fr-FR') ?? '0',       change: `${data.pending_courses ?? 0} en attente`, light: 'bg-cyan-50 text-cyan-600' },
    { icon: <FaUserGraduate />,   label: 'Apprenants',    value: data.total_students?.toLocaleString('fr-FR') ?? '0',      change: `${data.total_instructors} formateurs`, light: 'bg-green-50 text-green-600' },
    { icon: <MdEmojiEvents />,    label: 'Certificats',   value: data.total_certificates?.toLocaleString('fr-FR') ?? '0', change: `${data.total_enrollments} inscriptions`, light: 'bg-purple-50 text-purple-600' },
  ] : []

  const maxStudents = data?.top_courses?.length
    ? Math.max(...data.top_courses.map(c => c.enrollments_count ?? 0), 1)
    : 1

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord Admin 👑</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de la plateforme XamXam Tech</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between mb-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          : stats.map((stat, i) => (
              <motion.div key={i} custom={i} variants={cardVariants} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.light} flex items-center justify-center text-xl`}>
                    {stat.icon}
                  </div>
                  <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MdTrendingUp /> {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </motion.div>
            ))
        }
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Courses */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Top formations</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(data?.top_courses ?? []).map((course, i) => {
                const pct = Math.round(((course.enrollments_count ?? 0) / maxStudents) * 100)
                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-slate-700 truncate block max-w-[200px]">{course.title}</span>
                        <p className="text-xs text-slate-400">{(course.enrollments_count ?? 0).toLocaleString('fr-FR')} apprenants · {Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-600 ml-2">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} showPercent={false} color="cyan" />
                  </div>
                )
              })}
              {!data?.top_courses?.length && <p className="text-slate-400 text-sm text-center py-4">Aucune formation publiée</p>}
            </div>
          )}
        </motion.div>

        {/* Recent Users */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Utilisateurs récents</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.recent_users ?? []).map((u) => {
                const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge color={roleBadge[u.role] ?? 'gray'}>{roleLabel[u.role] ?? u.role}</Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {u.createdAt ? new Date(u.createdAt.seconds ? u.createdAt.seconds*1000 : u.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
              {!data?.recent_users?.length && <p className="text-slate-400 text-sm text-center py-4">Aucun utilisateur</p>}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
