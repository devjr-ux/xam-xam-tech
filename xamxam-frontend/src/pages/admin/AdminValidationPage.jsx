import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheck, FaTimes, FaEye, FaClock, FaSpinner } from 'react-icons/fa'
import { MdSchool } from 'react-icons/md'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { adminService } from '../../services/adminService'
import { useRefresh } from '../../context/RefreshContext'

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-5 py-3 rounded-xl shadow-lg text-sm`}>
      {message}
    </motion.div>
  )
}

function PreviewModal({ course, onClose, onPublish, onReject, acting }) {
  const thumbUrl = course.thumbnail
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${course.thumbnail}`
    : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white flex items-center gap-4">
          {thumbUrl
            ? <img src={thumbUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            : <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">📚</div>
          }
          <div>
            <h3 className="text-xl font-bold">{course.title}</h3>
            <p className="text-white/80 text-sm mt-0.5">par {course.instructor?.name ?? '—'}</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">{course.description || 'Pas de description.'}</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Niveau',    value: course.level ?? '—' },
              { label: 'Langue',    value: course.language ?? '—' },
              { label: 'Prix',      value: `${Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA` },
            ].map((d, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3">
                <p className="font-bold text-slate-800 text-sm">{d.value}</p>
                <p className="text-slate-400 text-xs">{d.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {course.category && <Badge color="cyan">{course.category.name}</Badge>}
            <Badge color="gray">{course.level}</Badge>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <Button className="flex-1 justify-center" icon={acting === course.id + 'publish' ? <FaSpinner className="animate-spin" /> : <FaCheck />}
            onClick={() => onPublish(course.id)} disabled={!!acting}>
            Publier
          </Button>
          <Button variant="danger" className="flex-1 justify-center" icon={acting === course.id + 'reject' ? <FaSpinner className="animate-spin" /> : <FaTimes />}
            onClick={() => onReject(course.id)} disabled={!!acting}>
            Refuser
          </Button>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminValidationPage() {
  const { refresh }             = useRefresh()
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [preview, setPreview]   = useState(null)
  const [acting, setActing]     = useState(null)
  const [history, setHistory]   = useState([])
  const [toast, setToast]       = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  useEffect(() => {
    adminService.getCourses({ status: 'pending', per_page: 50 })
      .then(r => setCourses(r.data.data ?? r.data))
      .finally(() => setLoading(false))
  }, [])

  const publish = async (id) => {
    setActing(id + 'publish')
    try {
      await adminService.publishCourse(id)
      const c = courses.find(c => c.id === id)
      setCourses(p => p.filter(c => c.id !== id))
      setHistory(p => [{ ...c, verdict: 'published', at: new Date().toLocaleTimeString('fr-FR') }, ...p])
      setPreview(null)
      showToast('Cours publié avec succès !')
      refresh()
    } catch { showToast('Erreur.', 'error') }
    finally { setActing(null) }
  }

  const reject = async (id) => {
    setActing(id + 'reject')
    try {
      await adminService.rejectCourse(id)
      const c = courses.find(c => c.id === id)
      setCourses(p => p.filter(c => c.id !== id))
      setHistory(p => [{ ...c, verdict: 'rejected', at: new Date().toLocaleTimeString('fr-FR') }, ...p])
      setPreview(null)
      showToast('Cours refusé.')
      refresh()
    } catch { showToast('Erreur.', 'error') }
    finally { setActing(null) }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <AnimatePresence>{toast && <Toast key="t" {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Validation des formations ✅</h1>
        <p className="text-slate-500 text-sm mt-1">Examinez et approuvez les soumissions en attente</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
        {[
          { icon: <FaClock />, label: 'En attente', value: loading ? '...' : courses.length, color: 'bg-yellow-50 text-yellow-700' },
          { icon: <FaCheck />, label: 'Approuvés', value: history.filter(h => h.verdict === 'published').length, color: 'bg-green-50 text-green-700' },
          { icon: <FaTimes />, label: 'Refusés', value: history.filter(h => h.verdict === 'rejected').length, color: 'bg-red-50 text-red-700' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeInUp} className={`${s.color} rounded-2xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Liste en attente */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="flex-1"><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-64" /></div>
              <div className="flex gap-2"><Skeleton className="w-8 h-8 rounded-xl" /><Skeleton className="w-8 h-8 rounded-xl" /><Skeleton className="w-8 h-8 rounded-xl" /></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-slate-700">Tout est validé !</h3>
          <p className="text-slate-400 text-sm">Aucune soumission en attente.</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {courses.map((course) => (
            <motion.div key={course.id} variants={fadeInUp}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-2xl flex-shrink-0">
                  <MdSchool className="text-cyan-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-800 text-sm">{course.title}</h3>
                    <Badge color="cyan">Cours</Badge>
                    {course.category && <Badge color="gray">{course.category.name}</Badge>}
                  </div>
                  <p className="text-slate-400 text-xs mb-1">
                    {course.instructor?.name ?? '—'} · {course.level} · <strong className="text-slate-600">{Number(course.price ?? 0).toLocaleString('fr-FR')} FCFA</strong>
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FaClock className="text-slate-300" />
                    Soumis le {new Date(course.updated_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setPreview(course)}
                    className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors" title="Prévisualiser">
                    <FaEye className="text-xs" />
                  </button>
                  <button onClick={() => publish(course.id)} disabled={!!acting}
                    className="w-8 h-8 rounded-xl bg-green-50 hover:bg-green-100 text-green-500 flex items-center justify-center transition-colors disabled:opacity-50" title="Publier">
                    {acting === course.id + 'publish' ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                  </button>
                  <button onClick={() => reject(course.id)} disabled={!!acting}
                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50" title="Refuser">
                    {acting === course.id + 'reject' ? <FaSpinner className="animate-spin text-xs" /> : <FaTimes className="text-xs" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Historique */}
      {history.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Historique de session</h3>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.verdict === 'published' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {item.verdict === 'published' ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                </div>
                <span className="text-sm text-slate-700 flex-1 truncate">{item.title}</span>
                <span className="text-xs text-slate-400 hidden sm:block">{item.instructor?.name}</span>
                <Badge color={item.verdict === 'published' ? 'green' : 'red'}>
                  {item.verdict === 'published' ? 'Publié' : 'Refusé'}
                </Badge>
                <span className="text-xs text-slate-400">{item.at}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {preview && (
          <PreviewModal key="modal" course={preview} onClose={() => setPreview(null)}
            onPublish={publish} onReject={reject} acting={acting} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
