import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaStar, FaUsers, FaSpinner } from 'react-icons/fa'
import { MdArrowForward } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import api from '../../services/api'

const GRADIENTS = [
  'from-cyan-500 to-blue-600', 'from-green-500 to-teal-600',
  'from-purple-500 to-pink-600', 'from-orange-500 to-red-500',
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading]     = useState(true)
  const [removing, setRemoving]   = useState(null)

  useRefreshOnNav(() => {
    setLoading(true)
    api.get('/favorites')
      .then(r => setFavorites(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  })

  const remove = async (courseId) => {
    setRemoving(courseId)
    try {
      await api.post(`/courses/${courseId}/favorite`)
      setFavorites(p => p.filter(c => c.id !== courseId))
    } catch {}
    finally { setRemoving(null) }
  }

  const isFree = (course) => !course.price || Number(course.price) === 0

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Mes favoris ❤️</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loading ? '...' : `${favorites.length} cours sauvegardé(s)`}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              <Skeleton className="h-32 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="text-5xl mb-3">💔</div>
          <h3 className="font-bold text-slate-700 mb-2">Aucun favori pour l'instant</h3>
          <p className="text-slate-400 text-sm mb-4">Ajoutez des cours en favoris depuis le catalogue.</p>
          <Link to="/courses"><Button size="sm" icon={<MdArrowForward />}>Explorer les cours</Button></Link>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((course, i) => {
            const thumbUrl = course.thumbnail
              ? `${import.meta.env.VITE_API_URL?.replace('/api','')}/storage/${course.thumbnail}`
              : null
            return (
              <motion.div key={course.id} custom={i} variants={cardVariants}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow group">
                <div className={`h-32 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center overflow-hidden`}>
                  {thumbUrl
                    ? <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover" />
                    : <span className="text-5xl">📚</span>
                  }
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-cyan-600 transition-colors truncate">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-xs mb-2">par {course.instructor?.name ?? '—'}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    {course.rating > 0 && <span><FaStar className="inline text-yellow-400" /> {Number(course.rating).toFixed(1)}</span>}
                    <span><FaUsers className="inline text-slate-400" /> {(course.students_count ?? 0).toLocaleString('fr-FR')}</span>
                    <span className="font-semibold text-cyan-600 ml-auto">
                      {isFree(course) ? 'Gratuit' : `${Number(course.price).toLocaleString('fr-FR')} F`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button size="sm" className="w-full justify-center">Voir le cours</Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(course.id)}
                      disabled={removing === course.id}
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors"
                      title="Retirer des favoris"
                    >
                      {removing === course.id ? <FaSpinner className="animate-spin text-xs" /> : <FaHeart className="text-sm" />}
                    </button>
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
