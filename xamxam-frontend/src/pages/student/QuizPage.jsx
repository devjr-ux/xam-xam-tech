import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaCheckCircle, FaTimes, FaArrowRight, FaSpinner } from 'react-icons/fa'
import { MdQuiz } from 'react-icons/md'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import Skeleton from '../../components/ui/Skeleton'
import { staggerContainer, fadeInUp, scaleIn } from '../../animations/variants'
import api from '../../services/api'

/* ── Écran d'intro ─────────────────────────────────────── */
function QuizIntro({ quiz, onStart }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center max-w-lg mx-auto">
      <motion.div variants={scaleIn}
        className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6">
        📝
      </motion.div>
      <motion.h1 variants={fadeInUp} className="text-3xl font-bold text-slate-800 mb-2">{quiz.title}</motion.h1>
      <motion.p variants={fadeInUp} className="text-slate-500 mb-6">
        {quiz.lesson?.section?.course?.title || 'Quiz de formation'}
      </motion.p>

      <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Questions',   value: quiz.questions?.length ?? 0,           icon: '❓' },
          { label: 'Durée',       value: `${Math.round(quiz.duration / 60)} min`, icon: '⏱️' },
          { label: 'Score requis', value: `${quiz.passing_score}%`,              icon: '🎯' },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeInUp} className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-lg font-bold text-slate-800">{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
        <p className="text-amber-700 text-sm font-semibold mb-1">⚠️ Instructions</p>
        <ul className="text-amber-600 text-sm space-y-1 list-disc list-inside">
          <li>Une seule réponse possible par question</li>
          <li>Feedback immédiat après chaque réponse</li>
          <li>Le timer ne s'arrête pas</li>
          <li>Résultats détaillés à la fin</li>
        </ul>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Button size="lg" className="w-full justify-center" onClick={onStart}>
          Commencer le Quiz <FaArrowRight />
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ── Écran de résultats ─────────────────────────────────── */
function QuizResults({ quiz, result, timeSpent, onRetry }) {
  const passed = result.passed
  const navigate = useNavigate()

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
      {/* Score */}
      <motion.div variants={scaleIn}
        className={`rounded-3xl p-8 text-center mb-6 ${
          passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
        <div className="text-6xl mb-3">{passed ? '🏆' : '😔'}</div>
        <h2 className="text-3xl font-bold text-white mb-1">{result.score}%</h2>
        <p className="text-white/80 mb-3">{result.correct}/{result.total} bonnes réponses</p>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold">
          {passed ? <><FaCheckCircle /> Quiz réussi !</> : <><FaTimes /> Score insuffisant</>}
        </span>
        <p className="text-white/60 text-xs mt-2">Score minimum requis : {quiz.passing_score}%</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Correctes',   value: result.correct,                              color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Incorrectes', value: result.total - result.correct,               color: 'bg-red-50 text-red-700',   icon: '❌' },
          { label: 'Temps',       value: `${Math.floor(timeSpent/60)}m${timeSpent%60}s`, color: 'bg-blue-50 text-blue-700', icon: '⏱️' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeInUp} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs opacity-80">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Révision */}
      {result.details && (
        <motion.div variants={fadeInUp} className="space-y-4 mb-6">
          <h3 className="font-bold text-slate-800">Révision des réponses</h3>
          {result.details.map((d, i) => {
            const q = quiz.questions?.find(q => q.id === d.question_id) || {}
            return (
              <div key={i} className={`bg-white rounded-2xl p-5 border-2 ${d.is_correct ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${d.is_correct ? 'bg-green-500' : 'bg-red-500'}`}>
                    {d.is_correct ? '✓' : '✗'}
                  </span>
                  <p className="font-medium text-slate-800 text-sm">{q.question || `Question ${i + 1}`}</p>
                </div>
                {q.options && (
                  <div className="space-y-1.5 ml-10">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`px-3 py-2 rounded-xl text-xs ${
                        oi === d.correct_answer ? 'bg-green-100 text-green-700 font-semibold' :
                        oi === d.user_answer && !d.is_correct ? 'bg-red-100 text-red-700' :
                        'text-slate-500'
                      }`}>
                        {oi === d.correct_answer && '✓ '}
                        {oi === d.user_answer && !d.is_correct && '✗ '}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {d.explanation && (
                  <p className="text-xs text-slate-500 italic mt-3 ml-10 border-t border-slate-100 pt-2">
                    💡 {d.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="flex gap-3 flex-wrap">
        <Button variant="outline" className="flex-1 justify-center" onClick={onRetry}>
          Réessayer
        </Button>
        <Button className="flex-1 justify-center" onClick={() => navigate(-1)}>
          ← Retour au cours
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function QuizPage() {
  const { id: lessonId } = useParams()

  const [quiz, setQuiz]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [phase, setPhase]         = useState('intro')   // intro | quiz | results
  const [currentQ, setCurrentQ]   = useState(0)
  const [answers, setAnswers]     = useState({})
  const [selected, setSelected]   = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft]   = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [result, setResult]       = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef                  = useRef(null)

  /* ── Charger le quiz depuis l'API (par lesson ID) ── */
  useEffect(() => {
    if (!lessonId) return
    setLoading(true)
    api.get(`/lessons/${lessonId}/quiz`)
      .then(r => {
        setQuiz(r.data)
        setTimeLeft(r.data.duration || 600)
      })
      .catch(e => setError(e.response?.data?.message || 'Quiz introuvable.'))
      .finally(() => setLoading(false))
  }, [lessonId])

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timerRef.current); handleFinish({}); return 0 }
        return p - 1
      })
      setTimeSpent(p => p + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const handleFinish = async (finalAnswers) => {
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const answersArray = Object.values({ ...answers, ...finalAnswers })
      const r = await api.post(`/quizzes/${quiz.id}/submit`, { answers: answersArray })
      setResult(r.data)
      setPhase('results')
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de la soumission.')
    } finally { setSubmitting(false) }
  }

  const handleSelect = (oi) => {
    if (showFeedback) return
    setSelected(oi)
    setShowFeedback(true)
    setAnswers(p => ({ ...p, [currentQ]: oi }))
  }

  const handleNext = () => {
    setShowFeedback(false)
    setSelected(null)
    if (currentQ < (quiz?.questions?.length ?? 0) - 1) {
      setCurrentQ(p => p + 1)
    } else {
      handleFinish({ [currentQ]: selected })
    }
  }

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const retry = () => {
    setPhase('intro')
    setAnswers({})
    setCurrentQ(0)
    setSelected(null)
    setShowFeedback(false)
    setResult(null)
    setTimeLeft(quiz?.duration || 600)
    setTimeSpent(0)
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <FaSpinner className="animate-spin text-cyan-500 text-4xl" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-xl font-bold text-slate-800 mb-2">{error}</p>
        <Link to="/student/courses" className="text-cyan-600 hover:underline text-sm">
          ← Retour à mes cours
        </Link>
      </div>
    </div>
  )

  if (!quiz) return null

  const question = quiz.questions?.[currentQ]
  const qProgress = Math.round(((currentQ + (showFeedback ? 1 : 0)) / (quiz.questions?.length ?? 1)) * 100)

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {phase === 'intro' && (
        <div className="max-w-2xl mx-auto px-4">
          <QuizIntro quiz={quiz} onStart={() => { setPhase('quiz') }} />
        </div>
      )}

      {phase === 'quiz' && question && (
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-600">
              <MdQuiz className="text-purple-500 text-xl" />
              <span className="font-semibold text-sm truncate max-w-[200px]">{quiz.title}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
              timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'
            }`}>
              <FaClock className={timeLeft < 60 ? 'animate-pulse text-red-500' : ''} />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Question {currentQ + 1}/{quiz.questions?.length}</span>
              <span>{qProgress}%</span>
            </div>
            <ProgressBar value={qProgress} showPercent={false} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQ}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-4">
                <p className="text-lg font-bold text-slate-800 mb-6">{question.question}</p>
                <div className="space-y-3">
                  {(question.options || []).map((opt, oi) => {
                    let cls = 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 cursor-pointer'
                    if (showFeedback) {
                      if (oi === question.correct_option)            cls = 'border-green-400 bg-green-50'
                      else if (oi === selected)                      cls = 'border-red-400 bg-red-50'
                      else                                           cls = 'border-slate-100 opacity-50'
                    } else if (oi === selected) {
                      cls = 'border-cyan-500 bg-cyan-50'
                    }
                    return (
                      <motion.button key={oi} type="button"
                        whileHover={!showFeedback ? { scale: 1.01 } : {}}
                        onClick={() => handleSelect(oi)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${cls}`}
                      >
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          showFeedback && oi === question.correct_option ? 'border-green-500 bg-green-500 text-white' :
                          showFeedback && oi === selected ? 'border-red-500 bg-red-500 text-white' :
                          oi === selected ? 'border-cyan-500 bg-cyan-500 text-white' :
                          'border-slate-300 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <span className={`text-sm flex-1 ${
                          showFeedback && oi === question.correct_option ? 'text-green-700 font-semibold' : 'text-slate-700'
                        }`}>{opt}</span>
                        {showFeedback && oi === question.correct_option && <FaCheckCircle className="text-green-500 flex-shrink-0" />}
                        {showFeedback && oi === selected && oi !== question.correct_option && <FaTimes className="text-red-500 flex-shrink-0" />}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <AnimatePresence>
                {showFeedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
                      selected === question.correct_option
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                    <span className="text-xl">{selected === question.correct_option ? '✅' : '❌'}</span>
                    <div>
                      <p className={`font-semibold text-sm mb-1 ${selected === question.correct_option ? 'text-green-700' : 'text-red-700'}`}>
                        {selected === question.correct_option ? 'Bonne réponse !' : 'Mauvaise réponse'}
                      </p>
                      {question.explanation && (
                        <p className="text-slate-600 text-xs">{question.explanation}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showFeedback && (
                <Button className="w-full justify-center" disabled={submitting} onClick={handleNext}>
                  {submitting
                    ? <><FaSpinner className="animate-spin" /> Envoi...</>
                    : currentQ < (quiz.questions?.length ?? 0) - 1
                    ? <>Question suivante <FaArrowRight /></>
                    : <>Voir les résultats <FaArrowRight /></>
                  }
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {phase === 'results' && result && (
        <div className="max-w-2xl mx-auto px-4">
          <QuizResults quiz={quiz} result={result} timeSpent={timeSpent} onRetry={retry} />
        </div>
      )}
    </div>
  )
}
