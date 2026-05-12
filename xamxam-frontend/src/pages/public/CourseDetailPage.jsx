import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaStar, FaUsers, FaClock, FaPlayCircle, FaFilePdf,
  FaLock, FaCheckCircle, FaArrowLeft, FaHeart, FaSpinner,
} from 'react-icons/fa'
import { MdQuiz, MdExpandMore, MdExpandLess, MdArrowForward } from 'react-icons/md'
import { fadeInUp, fadeInRight, staggerContainer } from '../../animations/variants'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { studentService } from '../../services/studentService'

/* ── Ligne de leçon ──────────────────────────────────────── */
function LessonRow({ lesson, enrolled }) {
  const locked = !enrolled && !lesson.isFree
  const icons  = {
    video: <FaPlayCircle className="text-cyan-500" />,
    quiz:  <MdQuiz className="text-purple-500 text-base" />,
    pdf:   <FaFilePdf className="text-red-500" />,
  }
  const mins = lesson.duration > 0 ? `${Math.round(lesson.duration / 60)} min` : ''

  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
      locked ? 'opacity-60' : 'hover:bg-slate-50'
    }`}>
      <span className="text-base flex-shrink-0">{icons[lesson.type] ?? icons.video}</span>
      <span className="flex-1 text-sm text-slate-700">{lesson.title}</span>
      {lesson.isFree && <Badge color="green">Gratuit</Badge>}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
        {locked && <FaLock className="text-slate-300 text-xs" />}
        {mins && <span>{mins}</span>}
      </div>
    </div>
  )
}

/* ── Accordéon section ───────────────────────────────────── */
function SectionAccordion({ section, index, enrolled }) {
  const [open, setOpen] = useState(index === 0)
  const lessons = section.lessons || []

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div>
          <span className="font-semibold text-slate-800 text-sm">{section.title}</span>
          <span className="text-slate-400 text-xs ml-3">{lessons.length} leçon(s)</span>
        </div>
        {open
          ? <MdExpandLess className="text-slate-400 text-xl flex-shrink-0" />
          : <MdExpandMore className="text-slate-400 text-xl flex-shrink-0" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-0.5">
              {lessons.length === 0
                ? <p className="text-slate-400 text-xs text-center py-3 italic">Aucune leçon dans cette section</p>
                : lessons.map(l => <LessonRow key={l.id} lesson={l} enrolled={enrolled} />)
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function CourseDetailPage() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [course, setCourse]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [enrolled, setEnrolled]   = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    studentService.getCourse(id)
      .then(async courseData => {
        setCourse(courseData)
        if (user) {
          const [access, favs] = await Promise.all([
            studentService.checkAccess(id).catch(() => ({ enrolled: false, hasAccess: false })),
            studentService.getFavorites().catch(() => []),
          ])
          setEnrolled(access.enrolled)
          setHasAccess(access.hasAccess)
          if (access.enrollmentId) setEnrollmentId(access.enrollmentId)
          setFavorited(favs.some(f => f.id === id))
        }
      })
      .catch(() => setError('Impossible de charger ce cours.'))
      .finally(() => setLoading(false))
  }, [id, user])

  /* ── S'inscrire / Payer ── */
  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setEnrolling(true)
    try {
      const result = await studentService.enroll(id)

      setEnrolled(true)
      setEnrollmentId(result.enrollment?.id)

      if (result.hasAccess) {
        setHasAccess(true)
        navigate(`/courses/${id}/learn`)
      } else {
        navigate(`/courses/${id}/payment?enrollment=${result.enrollment?.id}`)
      }
    } catch (e) {
      if (e.message?.includes('already enrolled') || e.message?.includes('isNew')) {
        navigate(`/courses/${id}/learn`)
      } else {
        alert(e.message || 'Erreur inscription.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  /* ── Accéder au cours (déjà inscrit) ── */
  const handleAccess = () => {
    if (hasAccess) {
      navigate(`/courses/${id}/learn`)
    } else {
      navigate(`/courses/${id}/payment?enrollment=${enrollmentId}`)
    }
  }

  /* ── Favoris ── */
  const toggleFavorite = async () => {
    if (!user) { navigate('/login'); return }
    setFavLoading(true)
    try {
      const r = await studentService.toggleFavorite(id)
      setFavorited(r.favorited)
    } catch {}
    finally { setFavLoading(false) }
  }

  const totalLessons = course?.sections?.reduce((n, s) => n + (s.lessons?.length || 0), 0) ?? 0
  const isFree       = !course?.price || Number(course.price) === 0
  const thumbUrl     = course?.thumbnail || null

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="bg-white rounded-2xl h-80"><Skeleton className="w-full h-full rounded-2xl" /></div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Erreur ── */
  if (error) return (
    <div className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{error}</h2>
        <Link to="/courses"><Button>← Retour aux formations</Button></Link>
      </div>
    </div>
  )

  if (!course) return null

  return (
    <div className="min-h-screen bg-slate-50 pt-16">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <FaArrowLeft /> Retour aux formations
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Infos gauche */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="lg:col-span-2">
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-3 flex-wrap">
                {course.categoryName && <Badge color="cyan">{course.categoryName}</Badge>}
                {course.level && <Badge color="gray">{course.level}</Badge>}
                {isFree && <Badge color="green">Gratuit</Badge>}
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {course.title}
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-slate-400 text-base mb-5 max-w-2xl leading-relaxed">
                {course.description}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-5">
                {course.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FaStar className="text-yellow-400" />
                    <strong className="text-white">{Number(course.rating).toFixed(1)}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FaUsers /> {(course.enrollmentsCount ?? 0).toLocaleString('fr-FR')} apprenants
                </span>
                {course.language && (
                  <span className="flex items-center gap-1.5">
                    <FaClock /> {course.language}
                  </span>
                )}
                <span>📚 {totalLessons} leçon(s)</span>
              </motion.div>

              {course.instructorName && (
                <motion.div variants={fadeInUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {course.instructorName?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-slate-300 text-sm">
                    Formateur : <span className="text-white font-medium">{course.instructorName}</span>
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Carte sticky droite */}
            <motion.div variants={fadeInRight} initial="hidden" animate="visible">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden sticky top-24">
                {/* Image ou gradient */}
                <div className="h-44 bg-gradient-to-br from-cyan-500 to-blue-600 overflow-hidden flex items-center justify-center">
                  {thumbUrl
                    ? <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover" />
                    : <span className="text-6xl">📚</span>
                  }
                </div>

                <div className="p-5">
                  {/* Prix */}
                  <div className="flex items-baseline gap-2 mb-4">
                    {isFree
                      ? <span className="text-3xl font-bold text-green-600">Gratuit</span>
                      : <span className="text-3xl font-bold text-slate-800">
                          {Number(course.price).toLocaleString('fr-FR')} <span className="text-lg font-medium text-slate-500">FCFA</span>
                        </span>
                    }
                  </div>

                  {/* Bouton principal */}
                  {!enrolled ? (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-base transition-colors disabled:opacity-60 mb-3 ${
                        isFree
                          ? 'bg-green-500 hover:bg-green-400'
                          : 'bg-cyan-500 hover:bg-cyan-400'
                      }`}
                    >
                      {enrolling
                        ? <><FaSpinner className="animate-spin" /> Traitement...</>
                        : isFree
                        ? '🆓 S\'inscrire gratuitement'
                        : `💳 S'inscrire — ${Number(course.price).toLocaleString('fr-FR')} FCFA`
                      }
                    </button>
                  ) : hasAccess ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${id}/learn`)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-base transition-colors mb-3"
                    >
                      <MdArrowForward /> Continuer le cours
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAccess}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base transition-colors mb-3"
                    >
                      💳 Finaliser le paiement
                    </button>
                  )}

                  {/* Favori */}
                  {!enrolled && (
                    <button
                      type="button"
                      onClick={toggleFavorite}
                      disabled={favLoading}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all mt-2 ${
                        favorited ? 'border-red-300 bg-red-50 text-red-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <FaHeart className={favorited ? 'text-red-500' : 'text-slate-400'} />
                      {favorited ? 'Retiré des favoris' : 'Ajouter aux favoris'}
                    </button>
                  )}

                  {/* Avantages */}
                  <div className="mt-4 space-y-2 text-xs text-slate-500 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500 flex-shrink-0" /> Accès à vie après inscription</div>
                    <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500 flex-shrink-0" /> Certificat inclus</div>
                    <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500 flex-shrink-0" /> Disponible sur mobile</div>
                    {isFree && <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500 flex-shrink-0" /> Entièrement gratuit</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {[
              { id: 'overview',    label: 'Aperçu' },
              { id: 'curriculum',  label: 'Programme' },
              { id: 'instructor',  label: 'Formateur' },
            ].map(t => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === t.id ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu des onglets ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:max-w-[calc(100%-340px)]">

          {/* Aperçu */}
          {activeTab === 'overview' && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-3">À propos de ce cours</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{course.description}</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Informations</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ['Niveau',      course.level],
                    ['Langue',      course.language],
                    ['Sections',    `${course.sections?.length ?? 0} section(s)`],
                    ['Leçons',      `${totalLessons} leçon(s)`],
                    ['Apprenants',  (course.enrollmentsCount ?? 0).toLocaleString('fr-FR')],
                    ['Prix',        isFree ? 'Gratuit' : `${Number(course.price).toLocaleString('fr-FR')} FCFA`],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2.5">
                      <FaCheckCircle className="text-cyan-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600"><strong>{k} :</strong> {v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Programme */}
          {activeTab === 'curriculum' && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              <motion.div variants={fadeInUp} className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span>{course.sections?.length ?? 0} section(s)</span>
                <span>·</span>
                <span>{totalLessons} leçon(s)</span>
              </motion.div>

              {!course.sections?.length ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400">
                  <p className="text-4xl mb-2">📂</p>
                  <p>Aucun contenu disponible pour l'instant.</p>
                </div>
              ) : (
                course.sections.map((section, i) => (
                  <motion.div key={section.id} variants={fadeInUp}>
                    <SectionAccordion section={section} index={i} enrolled={enrolled} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Formateur */}
          {activeTab === 'instructor' && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl p-6 border border-slate-100">
              {course.instructorName ? (
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {course.instructorName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{course.instructorName}</h3>
                    <p className="text-slate-500 text-sm">Formateur sur XamXam Tech</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">Informations du formateur non disponibles.</p>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
