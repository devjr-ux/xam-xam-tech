import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaClock, FaCheckCircle, FaTimes, FaArrowRight,
  FaArrowLeft, FaSpinner, FaAward,
} from 'react-icons/fa'
import { MdQuiz } from 'react-icons/md'
import ProgressBar from '../../components/ui/ProgressBar'
import { staggerContainer, fadeInUp, scaleIn } from '../../animations/variants'
import { getQuizByLesson, submitQuiz } from '../../firebase/quizService'
import { useAuth } from '../../context/AuthContext'

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/* ── Intro ─────────────────────────────────────────────────── */
function QuizIntro({ quiz, onStart }) {
  const n = quiz.questions?.length ?? 0
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible"
      className="text-center max-w-lg mx-auto">
      <motion.div variants={scaleIn}
        className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6">
        📝
      </motion.div>
      <motion.h1 variants={fadeInUp} className="text-3xl font-bold text-slate-800 mb-2">
        {quiz.title}
      </motion.h1>
      <motion.p variants={fadeInUp} className="text-slate-500 mb-6">Quiz de formation</motion.p>

      <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Questions',    value: n,                                              icon: '❓' },
          { label: 'Durée',        value: `${Math.round((quiz.duration || 600) / 60)} min`, icon: '⏱️' },
          { label: 'Score requis', value: `${quiz.passingScore ?? 60}%`,                 icon: '🎯' },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeInUp}
            className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-lg font-bold text-slate-800">{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {n === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          ⚠️ Ce quiz ne contient pas encore de questions. Contactez votre formateur.
        </div>
      ) : (
        <motion.div variants={fadeInUp}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-amber-700 text-sm font-semibold mb-1">⚠️ Instructions</p>
          <ul className="text-amber-600 text-sm space-y-1 list-disc list-inside">
            <li>Une seule réponse possible par question</li>
            <li>Feedback immédiat après chaque réponse</li>
            <li>Le timer ne s'arrête pas une fois lancé</li>
            <li>Résultats détaillés à la fin</li>
          </ul>
        </motion.div>
      )}

      <motion.div variants={fadeInUp}>
        <button
          disabled={n === 0}
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
        >
          Commencer le Quiz <FaArrowRight />
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── Résultats ──────────────────────────────────────────────── */
function QuizResults({ quiz, result, timeSpent, onRetry }) {
  const navigate = useNavigate()
  const { passed } = result

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible"
      className="max-w-2xl mx-auto">
      {/* Score */}
      <motion.div variants={scaleIn}
        className={`rounded-3xl p-8 text-center mb-6 ${
          passed
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
        <div className="text-6xl mb-3">{passed ? '🏆' : '😔'}</div>
        <h2 className="text-3xl font-bold text-white mb-1">{result.score}%</h2>
        <p className="text-white/80 mb-3">{result.correct}/{result.total} bonnes réponses</p>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold">
          {passed ? <><FaCheckCircle /> Quiz réussi !</> : <><FaTimes /> Score insuffisant</>}
        </span>
        <p className="text-white/60 text-xs mt-2">Score minimum : {quiz.passingScore ?? 60}%</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Correctes',   value: result.correct,                                   color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Incorrectes', value: result.total - result.correct,                    color: 'bg-red-50 text-red-700',     icon: '❌' },
          { label: 'Temps',       value: `${Math.floor(timeSpent/60)}m${timeSpent%60}s`,   color: 'bg-blue-50 text-blue-700',   icon: '⏱️' },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeInUp} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs opacity-80">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Révision */}
      {result.details?.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-4 mb-6">
          <h3 className="font-bold text-slate-800">Révision des réponses</h3>
          {result.details.map((d, i) => {
            const q = quiz.questions?.find(q => q.id === d.questionId) || {}
            return (
              <div key={i}
                className={`bg-white rounded-2xl p-5 border-2 ${d.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${d.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {d.isCorrect ? '✓' : '✗'}
                  </span>
                  <p className="font-medium text-slate-800 text-sm">{q.question || `Question ${i + 1}`}</p>
                </div>
                {q.options && (
                  <div className="space-y-1.5 ml-10">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`px-3 py-2 rounded-xl text-xs ${
                        oi === d.correctAnswer ? 'bg-green-100 text-green-700 font-semibold' :
                        oi === d.userAnswer && !d.isCorrect ? 'bg-red-100 text-red-700' :
                        'text-slate-500'
                      }`}>
                        {oi === d.correctAnswer && '✓ '}
                        {oi === d.userAnswer && !d.isCorrect && '✗ '}
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

      {/* Bannière certificat */}
      {result.certificateIssued && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 mb-6 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaAward className="text-white text-3xl" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">🎓 Félicitations ! Certificat obtenu !</p>
            <p className="text-white/80 text-sm mt-0.5">
              Vous avez complété tous les quiz et le cours. Votre diplôme est disponible.
            </p>
          </div>
          <button
            onClick={() => navigate('/student/certificates')}
            className="flex-shrink-0 px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-50 transition-colors"
          >
            Voir mon diplôme →
          </button>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          Réessayer
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-2xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
        >
          ← Retour au cours
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function QuizPage() {
  const { id: lessonId } = useParams()
  const { user }         = useAuth()
  const navigate         = useNavigate()

  const [quiz, setQuiz]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [phase, setPhase]       = useState('intro')  // intro | quiz | results
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers]   = useState({})
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [timeSpent, setTimeSpent] = useState(0)
  const [result, setResult]     = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const timerRef        = useRef(null)
  const answersRef      = useRef({})
  const submittingRef   = useRef(false)
  const quizStartedRef  = useRef(false)  // empêche auto-submit avant démarrage
  const handleFinishRef = useRef(null)   // ref stable vers handleFinish

  // Sync answers dans la ref (évite stale closure dans le timer)
  useEffect(() => { answersRef.current = answers }, [answers])

  // Chargement du quiz
  useEffect(() => {
    if (!lessonId) return
    setLoading(true)
    setError(null)
    getQuizByLesson(lessonId)
      .then(q => {
        setQuiz(q)
        setTimeLeft(q.duration || 600)
      })
      .catch(e => setError(e.message || 'Quiz introuvable.'))
      .finally(() => setLoading(false))
  }, [lessonId])

  // handleFinish stable via useCallback + ref
  const handleFinish = useCallback(async (finalAnswers = {}) => {
    if (submittingRef.current) return
    submittingRef.current = true
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const merged = { ...answersRef.current, ...finalAnswers }
      const res = await submitQuiz(user?.uid, quiz.id, merged)
      setResult(res)
      setPhase('results')
    } catch (e) {
      alert(e.message || 'Erreur lors de la soumission. Réessayez.')
      submittingRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [quiz, user])

  // Maintient la ref à jour
  useEffect(() => { handleFinishRef.current = handleFinish }, [handleFinish])

  // Timer — décrémentation pure, auto-submit via ref quand 0
  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 1)
        if (next === 0) {
          clearInterval(timerRef.current)
          // Délai micro pour sortir du state updater
          setTimeout(() => handleFinishRef.current({}), 0)
        }
        return next
      })
      setTimeSpent(p => p + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // Démarrer le quiz
  const startQuiz = () => {
    quizStartedRef.current = true
    submittingRef.current  = false
    setPhase('quiz')
  }

  // Sélection d'une réponse
  const handleSelect = (oi) => {
    if (showFeedback || submitting) return
    setSelected(oi)
    setShowFeedback(true)
    setAnswers(prev => ({ ...prev, [currentQ]: oi }))
  }

  // Question suivante ou fin
  const handleNext = () => {
    const total = quiz?.questions?.length ?? 0
    if (currentQ < total - 1) {
      setShowFeedback(false)
      setSelected(null)
      setCurrentQ(p => p + 1)
    } else {
      // Dernière question — on passe la réponse sélectionnée
      handleFinish({ [currentQ]: selected })
    }
  }

  // Réessayer
  const retry = () => {
    quizStartedRef.current = false
    submittingRef.current  = false
    setPhase('intro')
    setAnswers({})
    setCurrentQ(0)
    setSelected(null)
    setShowFeedback(false)
    setResult(null)
    setTimeLeft(quiz?.duration || 600)
    setTimeSpent(0)
  }

  /* ── Rendus conditionnels ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <FaSpinner className="animate-spin text-cyan-500 text-4xl" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Quiz indisponible</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-all"
        >
          <FaArrowLeft /> Retour au cours
        </button>
      </div>
    </div>
  )

  if (!quiz) return null

  const questions = quiz.questions ?? []
  const question  = questions[currentQ]
  const qProgress = questions.length > 0
    ? Math.round(((currentQ + (showFeedback ? 1 : 0)) / questions.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* INTRO */}
      {phase === 'intro' && (
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors"
          >
            <FaArrowLeft /> Retour au cours
          </button>
          <QuizIntro quiz={quiz} onStart={startQuiz} />
        </div>
      )}

      {/* QUIZ */}
      {phase === 'quiz' && (
        <div className="max-w-2xl mx-auto px-4">
          {/* Header timer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-600">
              <MdQuiz className="text-purple-500 text-xl" />
              <span className="font-semibold text-sm truncate max-w-[200px]">{quiz.title}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
              timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
            }`}>
              <FaClock />
              {fmt(timeLeft)}
            </div>
          </div>

          {/* Progression */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Question {currentQ + 1} / {questions.length}</span>
              <span>{qProgress}%</span>
            </div>
            <ProgressBar value={qProgress} showPercent={false} />
          </div>

          {/* Pas de questions */}
          {questions.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-600 font-semibold mb-2">Aucune question disponible</p>
              <p className="text-slate-400 text-sm mb-4">Ce quiz ne contient pas encore de questions.</p>
              <button onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-all">
                ← Retour
              </button>
            </div>
          )}

          {/* Question */}
          {question && (
            <AnimatePresence mode="wait">
              <motion.div key={currentQ}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.22 }}
              >
                <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-4">
                  <p className="text-lg font-bold text-slate-800 mb-6">{question.question}</p>
                  <div className="space-y-3">
                    {(question.options || []).map((opt, oi) => {
                      let cls = 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 cursor-pointer'
                      if (showFeedback) {
                        if (oi === question.correctOption)   cls = 'border-green-400 bg-green-50'
                        else if (oi === selected)            cls = 'border-red-400 bg-red-50'
                        else                                 cls = 'border-slate-100 opacity-40'
                      } else if (oi === selected) {
                        cls = 'border-cyan-500 bg-cyan-50'
                      }
                      return (
                        <motion.button
                          key={oi}
                          type="button"
                          whileHover={!showFeedback ? { scale: 1.01 } : {}}
                          onClick={() => handleSelect(oi)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${cls}`}
                        >
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            showFeedback && oi === question.correctOption ? 'border-green-500 bg-green-500 text-white' :
                            showFeedback && oi === selected              ? 'border-red-500 bg-red-500 text-white' :
                            oi === selected                              ? 'border-cyan-500 bg-cyan-500 text-white' :
                            'border-slate-300 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </div>
                          <span className={`text-sm flex-1 ${
                            showFeedback && oi === question.correctOption ? 'text-green-700 font-semibold' : 'text-slate-700'
                          }`}>{opt}</span>
                          {showFeedback && oi === question.correctOption && <FaCheckCircle className="text-green-500 flex-shrink-0" />}
                          {showFeedback && oi === selected && oi !== question.correctOption && <FaTimes className="text-red-500 flex-shrink-0" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
                        selected === question.correctOption
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <span className="text-xl">{selected === question.correctOption ? '✅' : '❌'}</span>
                      <div>
                        <p className={`font-semibold text-sm mb-1 ${selected === question.correctOption ? 'text-green-700' : 'text-red-700'}`}>
                          {selected === question.correctOption ? 'Bonne réponse !' : 'Mauvaise réponse'}
                        </p>
                        {question.explanation && (
                          <p className="text-slate-600 text-xs">{question.explanation}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton suivant */}
                {showFeedback && (
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {submitting
                      ? <><FaSpinner className="animate-spin" /> Envoi en cours...</>
                      : currentQ < questions.length - 1
                      ? <>Question suivante <FaArrowRight /></>
                      : <>Voir les résultats <FaArrowRight /></>}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* RÉSULTATS */}
      {phase === 'results' && result && (
        <div className="max-w-2xl mx-auto px-4">
          <QuizResults
            quiz={quiz}
            result={result}
            timeSpent={timeSpent}
            onRetry={retry}
          />
        </div>
      )}
    </div>
  )
}
