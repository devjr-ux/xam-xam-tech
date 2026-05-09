import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaStar, FaUsers, FaSearch } from 'react-icons/fa'
import { MdArrowForward } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { studentService } from '../../services/studentService'
import { useDebounce } from '../../hooks/useDebounce'

const GRADIENTS = ['from-cyan-500 to-blue-600','from-green-500 to-teal-600','from-purple-500 to-pink-600','from-orange-500 to-red-500','from-yellow-400 to-orange-500','from-blue-500 to-indigo-600','from-red-500 to-rose-600','from-slate-500 to-slate-700']
const LEVELS = ['Débutant','Intermédiaire','Avancé']

export default function CoursesPage() {
  const [courses, setCourses]         = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeLevel, setActiveLevel] = useState('')
  const [sort, setSort]               = useState('newest')
  const debouncedSearch               = useDebounce(search, 400)

  const load = useCallback((params = {}) => {
    setLoading(true)
    studentService.getCourses({
      search: debouncedSearch,
      category: activeCategory,
      level: activeLevel,
      sort,
      per_page: 24,
      ...params,
    })
      .then(r => setCourses(r.data.data ?? r.data))
      .finally(() => setLoading(false))
  }, [debouncedSearch, activeCategory, activeLevel, sort])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    studentService.getCategories().then(r => setCategories(r.data ?? []))
  }, [])

  const handleCategory = (slug) => {
    const val = activeCategory === slug ? '' : slug
    setActiveCategory(val)
    load({ category: val })
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 variants={fadeInUp} initial="hidden" animate="visible"
            className="text-4xl font-bold text-white mb-4">
            Nos <span className="text-gradient">formations</span>
          </motion.h1>
          <motion.p variants={fadeInUp} initial="hidden" animate="visible"
            className="text-slate-400 max-w-xl mx-auto mb-8">
            Choisissez parmi nos formations certifiantes adaptées au marché africain.
          </motion.p>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-md mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Rechercher une formation..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filtres */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleCategory('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!activeCategory ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300'}`}>
              Tous
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => handleCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.slug ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300'}`}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Niveau + Tri */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-medium">Niveau :</span>
            {LEVELS.map(l => (
              <button key={l} onClick={() => { const v = activeLevel === l ? '' : l; setActiveLevel(v); load({ level: v }) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLevel === l ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                {l}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400">Trier :</span>
              <select value={sort} onChange={e => { setSort(e.target.value); load({ sort: e.target.value }) }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500">
                <option value="newest">Plus récents</option>
                <option value="popular">Plus populaires</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-6">
          {loading ? 'Chargement...' : `${courses.length} formation(s) trouvée(s)`}
        </p>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                  <Skeleton className="h-36 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-28 mb-3" />
                    <Skeleton className="h-3 w-32 mb-3" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            : courses.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-slate-500">Aucune formation trouvée pour ces critères.</p>
                </div>
              )
            : courses.map((course, i) => {
                const thumbUrl = course.thumbnail
                  ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${course.thumbnail}`
                  : null
                const isFree = !course.price || Number(course.price) === 0

                return (
                  <motion.div key={course.id} custom={i} variants={cardVariants}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 card-hover group">
                    <div className={`h-36 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center relative overflow-hidden`}>
                      {thumbUrl
                        ? <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover" />
                        : <span className="text-5xl">📚</span>
                      }
                      <div className="absolute top-2 left-2 flex gap-1">
                        {isFree && <Badge color="green">Gratuit</Badge>}
                        <Badge color="gray">{course.level}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-cyan-600 font-semibold">{course.category?.name ?? '—'}</span>
                      <h3 className="font-bold text-slate-800 text-sm mt-1 mb-1 group-hover:text-cyan-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-slate-400 text-xs mb-2">par {course.instructor?.name ?? '—'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        {course.rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <FaStar className="text-yellow-400" /> {Number(course.rating).toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <FaUsers className="text-slate-400" /> {(course.students_count ?? 0).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-800 text-sm">
                          {isFree ? 'Gratuit' : `${Number(course.price).toLocaleString('fr-FR')} FCFA`}
                        </span>
                        <Link to={`/courses/${course.id}`}>
                          <Button size="sm" icon={<MdArrowForward />}>Voir</Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })
          }
        </motion.div>
      </div>
    </div>
  )
}
