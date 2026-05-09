import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaTrash, FaCheck, FaSave, FaSpinner } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { instructorService } from '../../services/instructorService'

const emptyQuestion = () => ({
  _id: Date.now() + Math.random(),
  question: '', options: ['', '', '', ''],
  correct_option: 0, explanation: '', points: 1,
})

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const colors = { success: 'bg-green-600', error: 'bg-red-600' }
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2`}
    >
      {type === 'success' && <FaCheck />} {message}
    </motion.div>
  )
}

export default function CreateQuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lessonIdParam = searchParams.get('lesson')

  const [myCourses, setMyCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [sections, setSections] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(lessonIdParam ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeQ, setActiveQ] = useState(0)

  const [quiz, setQuiz] = useState({
    title: '', passing_score: 60, duration: 15,
    questions: [emptyQuestion()],
  })

  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Charger mes cours ──────────────────────────────────────────
  useEffect(() => {
    instructorService.getMyCourses({ per_page: 100 })
      .then(r => setMyCourses(r.data.data ?? r.data))
  }, [])

  // ── Charger sections quand un cours est sélectionné ────────────
  useEffect(() => {
    if (!selectedCourse) return
    instructorService.getSections(selectedCourse)
      .then(r => setSections(r.data))
  }, [selectedCourse])

  // ── Toutes les leçons aplaties du cours ────────────────────────
  const allLessons = sections.flatMap(s =>
    (s.lessons ?? []).filter(l => l.type !== 'quiz').map(l => ({
      ...l, sectionTitle: s.title,
    }))
  )

  const updateQuiz = (field, val) => setQuiz(p => ({ ...p, [field]: val }))

  const addQuestion = () => {
    const q = emptyQuestion()
    setQuiz(p => ({ ...p, questions: [...p.questions, q] }))
    setActiveQ(quiz.questions.length)
  }

  const removeQuestion = (i) => {
    if (quiz.questions.length === 1) return
    setQuiz(p => ({ ...p, questions: p.questions.filter((_, j) => j !== i) }))
    setActiveQ(Math.max(0, i - 1))
  }

  const updateQuestion = (i, field, val) =>
    setQuiz(p => ({
      ...p,
      questions: p.questions.map((q, j) => j === i ? { ...q, [field]: val } : q),
    }))

  const updateOption = (qi, oi, val) =>
    setQuiz(p => ({
      ...p,
      questions: p.questions.map((q, j) =>
        j === qi ? { ...q, options: q.options.map((o, k) => k === oi ? val : o) } : q
      ),
    }))

  // ── Sauvegarder ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedLesson) { showToast('Sélectionnez une leçon.', 'error'); return }
    if (!quiz.title)     { showToast('Ajoutez un titre au quiz.', 'error'); return }

    const emptyQs = quiz.questions.some(q => !q.question || q.options.some(o => !o))
    if (emptyQs) { showToast('Remplissez toutes les questions et options.', 'error'); return }

    setSaving(true)
    try {
      const payload = {
        title:         quiz.title,
        passing_score: quiz.passing_score,
        duration:      quiz.duration,
        questions:     quiz.questions.map(q => ({
          question:       q.question,
          options:        q.options,
          correct_option: q.correct_option,
          explanation:    q.explanation,
          points:         q.points,
        })),
      }

      await instructorService.createQuiz(selectedLesson, payload)
      setSaved(true)
      showToast('Quiz sauvegardé avec succès !')
      setTimeout(() => navigate('/instructor/courses'), 2000)
    } catch (e) {
      const msg = e.response?.data?.message
        || Object.values(e.response?.data?.errors || {})[0]?.[0]
        || 'Erreur lors de la sauvegarde.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const currentQ = quiz.questions[activeQ] ?? quiz.questions[0]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <AnimatePresence>
        {toast && <Toast key="t" {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Créer un Quiz</h1>
          <p className="text-slate-500 text-sm mt-1">
            {quiz.questions.length} question(s) · Score requis : {quiz.passing_score}%
          </p>
        </div>
        <Button icon={saved ? <FaCheck /> : saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          onClick={handleSave} variant={saved ? 'outline' : 'primary'} disabled={saving}>
          {saved ? 'Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </motion.div>

      {/* Paramètres */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Paramètres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cours */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Cours
            </label>
            <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedLesson('') }}>
              <option value="">Sélectionner un cours...</option>
              {myCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {/* Leçon */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Leçon *
            </label>
            <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}
              disabled={!selectedCourse}>
              <option value="">Choisir une leçon...</option>
              {allLessons.map(l => (
                <option key={l.id} value={l.id}>{l.sectionTitle} — {l.title}</option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Titre du quiz *
            </label>
            <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              placeholder="Ex : Les Bases de React"
              value={quiz.title} onChange={e => updateQuiz('title', e.target.value)} />
          </div>

          {/* Durée */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Score (%)
              </label>
              <input type="number" min="0" max="100"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                value={quiz.passing_score} onChange={e => updateQuiz('passing_score', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Durée (min)
              </label>
              <input type="number" min="1"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                value={quiz.duration} onChange={e => updateQuiz('duration', Number(e.target.value))} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Liste des questions */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Questions</h3>
            <Badge color="cyan">{quiz.questions.length}</Badge>
          </div>
          <div className="p-2">
            {quiz.questions.map((q, i) => (
              <button key={q._id} onClick={() => setActiveQ(i)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all mb-1 group ${activeQ === i ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-slate-50'}`}>
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${activeQ === i ? 'bg-cyan-500 text-white' : q.question ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {q.question ? '✓' : i + 1}
                </span>
                <span className="text-xs text-slate-600 truncate flex-1">
                  {q.question || `Question ${i + 1}`}
                </span>
                {quiz.questions.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); removeQuestion(i) }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                    <FaTrash className="text-[10px]" />
                  </button>
                )}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <button onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-cyan-400 text-slate-400 hover:text-cyan-600 text-xs transition-all">
              <FaPlus /> Ajouter
            </button>
          </div>
        </motion.div>

        {/* Éditeur de question */}
        <motion.div variants={fadeInUp} className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">Question {activeQ + 1}</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Points :</label>
                <input type="number" min="1"
                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={currentQ.points}
                  onChange={e => updateQuestion(activeQ, 'points', Number(e.target.value))} />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 block mb-2">Énoncé *</label>
              <textarea rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
                placeholder="Posez votre question clairement..."
                value={currentQ.question}
                onChange={e => updateQuestion(activeQ, 'question', e.target.value)} />
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 block mb-3">
                Réponses (✓ = bonne réponse)
              </label>
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oi) => (
                  <div key={oi}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${currentQ.correct_option === oi ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <button onClick={() => updateQuestion(activeQ, 'correct_option', oi)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${currentQ.correct_option === oi ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-slate-400 hover:border-green-400'}`}>
                      {currentQ.correct_option === oi ? '✓' : String.fromCharCode(65 + oi)}
                    </button>
                    <input
                      className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}...`}
                      value={opt}
                      onChange={e => updateOption(activeQ, oi, e.target.value)} />
                    {currentQ.correct_option === oi && (
                      <span className="text-xs font-semibold text-green-600 flex-shrink-0">Bonne réponse</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Explication (optionnelle)
              </label>
              <textarea rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
                placeholder="Expliquez pourquoi cette réponse est correcte..."
                value={currentQ.explanation}
                onChange={e => updateQuestion(activeQ, 'explanation', e.target.value)} />
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Aperçu apprenant</p>
            <p className="font-semibold text-slate-800 mb-4">{currentQ.question || 'Votre question ici...'}</p>
            <div className="space-y-2">
              {currentQ.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-600">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt || `Option ${String.fromCharCode(65 + oi)}`}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
