import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaArrowLeft, FaPlayCircle, FaFilePdf, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaBars, FaTimes, FaSpinner,
} from 'react-icons/fa'
import { MdQuiz } from 'react-icons/md'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { studentService } from '../../services/studentService'

/* ── Lecteur selon le type de leçon ──────────────────────── */
function LessonPlayer({ lesson, courseId, totalLessons, onComplete }) {
  const [marking, setMarking] = useState(false)
  const navigate = useNavigate()

  const handleComplete = async () => {
    setMarking(true)
    try {
      await studentService.markLessonComplete(lesson.id, courseId, totalLessons)
      onComplete(lesson.id)
    } catch {}
    finally { setMarking(false) }
  }

  if (lesson.type === 'quiz') {
    const isDone = false // géré par le parent via completedIds
    return (
      <div className="bg-slate-800 rounded-2xl aspect-video flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <div className="text-7xl">📝</div>
          <p className="text-xl font-bold">{lesson.title}</p>
          <p className="text-slate-400 text-sm">Quiz interactif — complétez-le pour valider cette leçon</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate(`/student/quizzes/${lesson.id}`)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors"
            >
              📝 Commencer le Quiz
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={marking}
              className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {marking ? <FaSpinner className="animate-spin inline mr-2" /> : null}
              ✓ Marquer complété
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (lesson.type === 'pdf') {
    return (
      <div className="bg-slate-800 rounded-2xl aspect-video flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <div className="text-7xl">📄</div>
          <p className="text-xl font-bold">{lesson.title}</p>
          {lesson.pdfUrl ? (
            <a href={lesson.pdfUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">
              <FaFilePdf /> Ouvrir le PDF
            </a>
          ) : (
            <p className="text-slate-400 text-sm">Aucun PDF disponible</p>
          )}
          <button type="button" onClick={handleComplete} disabled={marking}
            className="block mx-auto px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors disabled:opacity-50">
            {marking ? <FaSpinner className="animate-spin inline mr-2" /> : null}
            Marquer comme complété
          </button>
        </div>
      </div>
    )
  }

  // Video
  const isYoutube = lesson.videoUrl?.includes('youtube.com') || lesson.videoUrl?.includes('youtu.be')
  const getYoutubeEmbed = (url) => {
    const id = url?.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null
  }

  return (
    <div className="bg-black rounded-2xl overflow-hidden aspect-video">
      {lesson.videoUrl && isYoutube ? (
        <iframe
          src={getYoutubeEmbed(lesson.videoUrl)}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      ) : lesson.videoUrl ? (
        <video
          controls
          src={lesson.videoUrl}
          className="w-full h-full"
          onEnded={handleComplete}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white gap-4">
          <FaPlayCircle className="text-5xl text-cyan-400" />
          <p className="text-slate-300 text-sm">{lesson.title}</p>
          <p className="text-slate-500 text-xs italic">Aucune vidéo disponible pour cette leçon</p>
          <button type="button" onClick={handleComplete} disabled={marking}
            className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors disabled:opacity-50">
            {marking ? <><FaSpinner className="animate-spin inline mr-2" />Marquage...</> : 'Marquer complété'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function LearnPage() {
  const { id: courseId } = useParams()

  const [course, setCourse]             = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [accessInfo, setAccessInfo]     = useState(null)
  const [completedIds, setCompletedIds] = useState(new Set())
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSections, setOpenSections] = useState([])

  useEffect(() => {
    if (!courseId) return
    setLoading(true)

    Promise.all([
      studentService.getCourse(courseId),
      studentService.checkAccess(courseId).catch(() => ({ hasAccess: false })),
      studentService.getProgress(courseId).catch(() => null),
    ]).then(([courseData, access, progress]) => {
      if (!access?.hasAccess) {
        setAccessDenied(true)
        setAccessInfo(access)
        setLoading(false)
        return
      }

      setCourse(courseData)

      // Leçons complétées depuis Firestore
      if (progress?.completedIds) {
        setCompletedIds(new Set(progress.completedIds))
      }

      if (courseData?.sections?.length > 0) {
        setOpenSections([courseData.sections[0].id])
        const firstLesson = courseData.sections[0].lessons?.[0]
        if (firstLesson) setActiveLesson(firstLesson)
      }
    }).finally(() => setLoading(false))
  }, [courseId])

  const allLessons = course?.sections?.flatMap(s => s.lessons || []) ?? []
  const progress   = allLessons.length > 0
    ? Math.round((completedIds.size / allLessons.length) * 100)
    : 0

  const toggleSection = (id) =>
    setOpenSections(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const markComplete = (lessonId) => {
    setCompletedIds(p => new Set([...p, lessonId]))
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx < allLessons.length - 1) setActiveLesson(allLessons[idx + 1])
  }

  const typeIcon = (type) => {
    if (type === 'video') return <FaPlayCircle className="text-cyan-500" />
    if (type === 'quiz')  return <MdQuiz className="text-purple-500 text-base" />
    return <FaFilePdf className="text-red-500" />
  }

  if (loading) return (
    <div className="flex h-screen bg-slate-900 items-center justify-center">
      <FaSpinner className="animate-spin text-cyan-500 text-4xl" />
    </div>
  )

  if (accessDenied) {
    const needsPayment = accessInfo?.enrolled && accessInfo?.paymentStatus === 'pending'
    return (
      <div className="flex h-screen bg-slate-900 items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">{needsPayment ? '💳' : '🔒'}</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {needsPayment ? 'Paiement requis' : 'Accès non autorisé'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {needsPayment
              ? 'Vous êtes inscrit à ce cours mais le paiement n\'a pas encore été finalisé.'
              : 'Vous devez vous inscrire à ce cours pour accéder au contenu.'}
          </p>
          <div className="flex flex-col gap-3">
            {needsPayment ? (
              <Link to={`/courses/${courseId}/payment`}
                className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-colors text-center">
                Finaliser le paiement
              </Link>
            ) : (
              <Link to={`/courses/${courseId}`}
                className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-colors text-center">
                Voir le cours et s'inscrire
              </Link>
            )}
            <Link to="/student/courses"
              className="py-3 px-6 rounded-xl border border-white/20 text-slate-300 hover:bg-white/5 transition-colors text-center">
              Mes cours
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!course) return (
    <div className="flex h-screen bg-slate-900 items-center justify-center text-white">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-xl">Cours introuvable</p>
        <Link to="/student/courses" className="text-cyan-400 hover:underline text-sm mt-2 inline-block">
          ← Retour à mes cours
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="hidden lg:flex flex-col bg-slate-800 border-r border-white/10 overflow-hidden flex-shrink-0"
          >
            <div className="p-4 border-b border-white/10">
              <Link to={`/courses/${courseId}`}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3 transition-colors">
                <FaArrowLeft /> Retour au cours
              </Link>
              <h2 className="text-white font-bold text-sm truncate">{course.title}</h2>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progression</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar value={progress} color="cyan" showPercent={false} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {course.sections?.map((section) => (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-slate-300 text-xs font-semibold uppercase tracking-wide truncate flex-1 text-left">
                      {section.title}
                    </span>
                    {openSections.includes(section.id)
                      ? <FaChevronUp className="text-slate-500 text-xs flex-shrink-0" />
                      : <FaChevronDown className="text-slate-500 text-xs flex-shrink-0" />
                    }
                  </button>

                  <AnimatePresence>
                    {openSections.includes(section.id) && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        {(section.lessons || []).map((lesson) => {
                          const isActive = activeLesson?.id === lesson.id
                          const isDone   = completedIds.has(lesson.id)
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => setActiveLesson(lesson)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isActive
                                  ? 'bg-cyan-500/20 border-l-2 border-cyan-500'
                                  : 'hover:bg-white/5 border-l-2 border-transparent'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {isDone
                                  ? <FaCheckCircle className="text-green-400 text-sm" />
                                  : typeIcon(lesson.type)
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug truncate ${
                                  isActive ? 'text-white font-medium'
                                  : isDone  ? 'text-slate-400 line-through'
                                  : 'text-slate-300'
                                }`}>{lesson.title}</p>
                                {lesson.duration > 0 && (
                                  <p className="text-slate-500 text-[10px] mt-0.5">
                                    {Math.round(lesson.duration / 60)} min
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-slate-800 border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(p => !p)}
            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <FaTimes size={13} /> : <FaBars size={13} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {activeLesson?.title || course.title}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <span className="text-slate-400 text-xs">{progress}% complété</span>
            <div className="w-20 bg-slate-700 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Zone de lecture */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-5">
              <LessonPlayer
                lesson={activeLesson}
                courseId={courseId}
                totalLessons={allLessons.length}
                onComplete={markComplete}
              />

              {/* Infos leçon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-white text-xl font-bold">{activeLesson.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    {typeIcon(activeLesson.type)}
                    <span className="text-slate-400 text-sm capitalize">{activeLesson.type}</span>
                    {activeLesson.duration > 0 && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 text-sm">{Math.round(activeLesson.duration / 60)} min</span>
                      </>
                    )}
                    {activeLesson.isFree && <Badge color="green">Gratuit</Badge>}
                    {completedIds.has(activeLesson.id) && <Badge color="green">✓ Complété</Badge>}
                  </div>
                </div>
                {!completedIds.has(activeLesson.id) && activeLesson.type !== 'quiz' && (
                  <Button
                    icon={<FaCheckCircle />}
                    onClick={async () => {
                      await studentService.markLessonComplete(activeLesson.id, courseId, allLessons.length)
                        .catch(() => {})
                      markComplete(activeLesson.id)
                    }}
                  >
                    Marquer complété
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                {(() => {
                  const idx = allLessons.findIndex(l => l.id === activeLesson.id)
                  return (
                    <>
                      <Button variant="secondary" disabled={idx <= 0}
                        onClick={() => idx > 0 && setActiveLesson(allLessons[idx - 1])}>
                        ← Précédente
                      </Button>
                      <span className="text-slate-400 text-xs">{idx + 1} / {allLessons.length}</span>
                      <Button disabled={idx >= allLessons.length - 1}
                        onClick={() => idx < allLessons.length - 1 && setActiveLesson(allLessons[idx + 1])}>
                        Suivante →
                      </Button>
                    </>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-center">
              <div>
                <p className="text-5xl mb-4">📚</p>
                <p>Sélectionnez une leçon dans le menu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
