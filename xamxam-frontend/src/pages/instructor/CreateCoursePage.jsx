import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FaPlus, FaTrash, FaEdit, FaCheck, FaSpinner,
  FaImage, FaTimes, FaSave, FaChevronDown, FaChevronUp,
  FaRocket, FaBook, FaInfoCircle, FaTags,
} from 'react-icons/fa'
import { instructorService } from '../../services/instructorService'

/* ══════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
const INP  = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-colors'
const BTN  = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'
const BTNP = `${BTN} bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-500/20`
const BTNO = `${BTN} border-2 border-slate-300 text-slate-600 hover:bg-slate-50`

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm flex items-center gap-2 ${
        type === 'error' ? 'bg-red-500' : type === 'warn' ? 'bg-amber-500' : 'bg-green-500'
      }`}
    >
      {type === 'error' ? <FaTimes /> : <FaCheck />} {msg}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MODAL LEÇON
══════════════════════════════════════════════════════════════ */
function LessonModal({ lesson, onSave, onClose }) {
  const [f, setF] = useState({
    title:    lesson.title    || '',
    type:     lesson.type     || 'video',
    videoUrl: lesson.videoUrl || lesson.video_url || '',
    pdfUrl:   lesson.pdfUrl   || lesson.pdf_url   || '',
    duration: lesson.duration || 0,
    isFree:   lesson.isFree   ?? lesson.is_free   ?? false,
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setErr('') }

  const submit = async () => {
    if (!f.title.trim()) { setErr('Le titre est obligatoire.'); return }
    setBusy(true)
    try { await onSave(lesson.id, f); onClose() }
    catch (e) { setErr(e.message || 'Erreur serveur, réessayez.') }
    finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">✏️ Modifier la leçon</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><FaTimes /></button>
        </div>

        <div className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">{err}</div>}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre *</label>
            <input className={INP} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Ex : Introduction à React" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
              <select className={INP} value={f.type} onChange={e => set('type', e.target.value)}>
                <option value="video">🎥 Vidéo</option>
                <option value="pdf">📄 PDF</option>
                <option value="quiz">📝 Quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durée (minutes)</label>
              <input type="number" min="0" className={INP} value={Math.round(f.duration / 60)}
                onChange={e => set('duration', Number(e.target.value) * 60)} />
            </div>
          </div>

          {f.type === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Vidéo</label>
              <input className={INP} value={f.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
          )}
          {f.type === 'pdf' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL PDF</label>
              <input className={INP} value={f.pdfUrl} onChange={e => set('pdfUrl', e.target.value)} placeholder="https://drive.google.com/..." />
            </div>
          )}

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 accent-cyan-500" checked={f.isFree} onChange={e => set('isFree', e.target.checked)} />
            <div>
              <p className="text-sm font-medium text-slate-700">Leçon gratuite</p>
              <p className="text-xs text-slate-400">Accessible sans inscription au cours</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button type="button" onClick={submit} disabled={busy} className={BTNP + ' flex-1 justify-center'}>
            {busy ? <FaSpinner className="animate-spin" /> : <FaCheck />}
            {busy ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={onClose} className={BTNO}>Annuler</button>
        </div>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CARTE SECTION
══════════════════════════════════════════════════════════════ */
function SectionCard({ section, index, courseId, onRename, onDelete, onAddLesson, onEditLesson, onDeleteLesson }) {
  const [open, setOpen]   = useState(true)
  const [title, setTitle] = useState(section.title)
  const [renaming, setRenaming] = useState(false)

  const doRename = async () => {
    const t = title.trim()
    if (!t || t === section.title) return
    setRenaming(true)
    await onRename(section.id, t).catch(() => setTitle(section.title))
    setRenaming(false)
  }

  const lessons = section.lessons || []

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <span className="w-7 h-7 rounded-lg bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <input
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={doRename}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur() } }}
        />
        <button type="button" onClick={doRename} disabled={renaming || title.trim() === section.title}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-30">
          {renaming ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />} Sauver
        </button>
        <button type="button" onClick={() => setOpen(p => !p)}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
          {open ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
        </button>
        <button type="button" onClick={() => onDelete(section.id)}
          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors">
          <FaTrash className="text-xs" />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          {lessons.length === 0 && (
            <p className="text-center text-slate-400 text-xs py-4 italic">
              Aucune leçon. Cliquez sur "Ajouter une leçon" ci-dessous.
            </p>
          )}

          {lessons.map(lesson => (
            <div key={lesson.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 group transition-all">
              <span className="text-base flex-shrink-0">
                {lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{lesson.title || 'Sans titre'}</p>
                <p className="text-xs text-slate-400">
                  {lesson.type === 'video' ? 'Vidéo' : lesson.type === 'pdf' ? 'PDF' : 'Quiz'}
                  {lesson.duration > 0 && ` · ${Math.round(lesson.duration / 60)} min`}
                  {lesson.isFree && ' · 🆓 Gratuit'}
                </p>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => onEditLesson(lesson, section.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium">
                  <FaEdit className="text-[10px]" /> Modifier
                </button>
                <button type="button" onClick={() => onDeleteLesson(section.id, lesson.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center">
                  <FaTrash className="text-[10px]" />
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={() => onAddLesson(section.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 text-sm transition-all mt-1">
            <FaPlus className="text-xs" /> Ajouter une leçon
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'info',    icon: <FaInfoCircle />, label: 'Informations' },
  { id: 'content', icon: <FaBook />,       label: 'Contenu' },
  { id: 'price',   icon: <FaTags />,       label: 'Tarification' },
  { id: 'publish', icon: <FaRocket />,     label: 'Publication' },
]
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé']
const LANGS  = ['Français', 'Wolof', 'Anglais']

export default function CreateCoursePage() {
  const { id: editId } = useParams()
  const navigate       = useNavigate()

  const [tab, setTab]         = useState('info')
  const [courseId, setCourseId] = useState(editId || null)
  const [toast, setToast]     = useState(null)
  const [modalLesson, setModalLesson] = useState(null)

  const [info, setInfo]       = useState({ title: '', description: '', category_id: '', level: 'Débutant', language: 'Français', price: '' })
  const [thumb, setThumb]     = useState(null)
  const [thumbUrl, setThumbUrl] = useState(null)
  const [cats, setCats]       = useState([])
  const [infoErr, setInfoErr] = useState({})
  const [savingInfo, setSavingInfo] = useState(false)

  const [sections, setSections] = useState([])
  const [loadingSec, setLoadingSec] = useState(false)
  const [addingSec, setAddingSec]   = useState(false)

  const [price, setPrice]         = useState('')
  const [savingPrice, setSavingPrice] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const ok  = (msg) => setToast({ msg, type: 'ok' })
  const err = (msg) => setToast({ msg, type: 'error' })

  /* ── Init catégories ── */
  useEffect(() => {
    instructorService.getCategories()
      .then(data => setCats(Array.isArray(data) ? data : []))
  }, [])

  /* ── Init cours existant ── */
  useEffect(() => {
    if (!editId) return
    instructorService.getCourse(editId).then(c => {
      setInfo({
        title: c.title || '', description: c.description || '',
        category_id: c.categoryId || '', level: c.level || 'Débutant',
        language: c.language || 'Français', price: c.price || '',
      })
      setPrice(String(c.price || ''))
      if (c.thumbnail) setThumbUrl(c.thumbnail)
    })
  }, [editId])

  /* ── Charger sections ── */
  useEffect(() => {
    if (tab !== 'content' || !courseId) return
    setLoadingSec(true)
    instructorService.getSections(courseId)
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(() => err('Erreur chargement sections.'))
      .finally(() => setLoadingSec(false))
  }, [tab, courseId])

  const openTab = (id) => {
    if (id !== 'info' && !courseId) {
      alert('Sauvegardez d\'abord les informations du cours.')
      return
    }
    setTab(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ══════════════════════════════════════════════════════════
     ONGLET 1 : INFOS
  ══════════════════════════════════════════════════════════ */
  const saveInfo = async () => {
    const e = {}
    if (!info.title.trim())       e.title = 'Titre obligatoire'
    if (!info.description.trim()) e.desc  = 'Description obligatoire'
    if (!info.category_id)        e.cat   = 'Sélectionnez une catégorie'
    if (Object.keys(e).length) { setInfoErr(e); return }

    setInfoErr({})
    setSavingInfo(true)

    const cat = cats.find(c => c.id === info.category_id)
    const data = {
      title:        info.title.trim(),
      description:  info.description.trim(),
      categoryId:   info.category_id,
      categoryName: cat?.name || '',
      level:        info.level,
      language:     info.language,
      price:        Number(info.price) || 0,
    }

    try {
      if (courseId) {
        await instructorService.updateCourse(courseId, data)
        // Upload thumbnail si une nouvelle image a été sélectionnée
        if (thumb) {
          try {
            await instructorService.uploadThumbnail(courseId, thumb)
            setThumb(null) // reset après upload réussi
          } catch (ex) {
            err('Image non uploadée : ' + (ex.message || 'vérifiez votre connexion.'))
            setSavingInfo(false)
            return
          }
        }
        ok('Informations mises à jour !')
      } else {
        const course = await instructorService.createCourse(data)
        const newId = course.id

        if (!newId) { err('Réponse inattendue. Réessayez.'); setSavingInfo(false); return }

        if (thumb) {
          try {
            await instructorService.uploadThumbnail(newId, thumb)
            setThumb(null)
          } catch (ex) {
            err('Cours créé mais image non uploadée : ' + (ex.message || 'vérifiez les règles Firebase Storage.'))
          }
        }

        setCourseId(newId)
        setPrice(String(data.price))
        setTab('content')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        ok('Cours créé ! Ajoutez maintenant vos sections et leçons.')
      }
    } catch (ex) {
      err(ex.message || 'Erreur serveur.')
    } finally {
      setSavingInfo(false)
    }
  }

  /* ══════════════════════════════════════════════════════════
     ONGLET 2 : CONTENU
  ══════════════════════════════════════════════════════════ */
  const addSection = async () => {
    setAddingSec(true)
    try {
      const section = await instructorService.createSection(courseId, {
        title: `Section ${sections.length + 1}`, order: sections.length,
      })
      setSections(p => [...p, { ...section, lessons: [] }])
      ok('Section ajoutée !')
    } catch (ex) { err(ex.message || 'Erreur création section.') }
    finally { setAddingSec(false) }
  }

  const renameSection = async (id, title) => {
    await instructorService.updateSection(id, { title }, courseId)
    setSections(p => p.map(s => s.id === id ? { ...s, title } : s))
    ok('Section renommée.')
  }

  const deleteSection = async (id) => {
    if (!window.confirm('Supprimer cette section et toutes ses leçons ?')) return
    try {
      await instructorService.deleteSection(id, courseId)
      setSections(p => p.filter(s => s.id !== id))
      ok('Section supprimée.')
    } catch { err('Erreur suppression section.') }
  }

  const addLesson = async (sectionId) => {
    try {
      const lesson = await instructorService.createLesson(courseId, {
        section_id: sectionId, title: 'Nouvelle leçon', type: 'video', is_free: false, order: 0,
      })
      setSections(p => p.map(s => s.id === sectionId ? { ...s, lessons: [...(s.lessons || []), lesson] } : s))
      setModalLesson({ lesson, sectionId })
    } catch (ex) { err(ex.message || 'Erreur création leçon.') }
  }

  const saveLesson = async (lessonId, sectionId, data) => {
    const updated = await instructorService.updateLesson(lessonId, data, sectionId, courseId)
    setSections(p => p.map(s => ({
      ...s,
      lessons: (s.lessons || []).map(l => l.id === lessonId ? { ...l, ...updated } : l),
    })))
    ok('Leçon enregistrée !')
  }

  const deleteLesson = async (sectionId, lessonId) => {
    if (!window.confirm('Supprimer cette leçon ?')) return
    try {
      await instructorService.deleteLesson(lessonId, sectionId, courseId)
      setSections(p => p.map(s => s.id === sectionId
        ? { ...s, lessons: (s.lessons || []).filter(l => l.id !== lessonId) }
        : s
      ))
    } catch { err('Erreur suppression leçon.') }
  }

  /* ══════════════════════════════════════════════════════════
     ONGLET 3 : TARIFICATION
  ══════════════════════════════════════════════════════════ */
  const savePrice = async () => {
    setSavingPrice(true)
    try {
      await instructorService.updateCourse(courseId, { price: Number(price) || 0 })
      ok('Prix enregistré !')
    } catch { err('Erreur sauvegarde prix.') }
    finally { setSavingPrice(false) }
  }

  /* ══════════════════════════════════════════════════════════
     ONGLET 4 : PUBLICATION
  ══════════════════════════════════════════════════════════ */
  const submitCourse = async () => {
    setSubmitting(true)
    try {
      await instructorService.submitCourse(courseId)
      ok('Cours soumis pour validation ! Redirection...')
      setTimeout(() => navigate('/instructor/courses'), 2000)
    } catch (ex) { err(ex.message || 'Erreur soumission.') }
    finally { setSubmitting(false) }
  }

  const totalLessons = sections.reduce((n, s) => n + (s.lessons?.length || 0), 0)

  return (
    <div className="max-w-4xl space-y-0">
      <AnimatePresence>
        {toast && <Toast key="t" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {modalLesson && (
          <LessonModal
            key="modal"
            lesson={modalLesson.lesson}
            onSave={(lessonId, data) => saveLesson(lessonId, modalLesson.sectionId, data)}
            onClose={() => setModalLesson(null)}
          />
        )}
      </AnimatePresence>

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {editId ? '✏️ Modifier la formation' : '➕ Créer une formation'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Remplissez chaque onglet, puis soumettez votre cours.</p>
        </div>
        {courseId && (
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium">
            ✓ Cours créé — brouillon
          </span>
        )}
      </div>

      {/* ── Onglets ── */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl overflow-hidden">
        {TABS.map(t => {
          const locked  = t.id !== 'info' && !courseId
          const current = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => openTab(t.id)}
              disabled={locked}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                current
                  ? 'border-cyan-500 text-cyan-600 bg-cyan-50'
                  : locked
                  ? 'border-transparent text-slate-300 cursor-not-allowed'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={current ? 'text-cyan-500' : locked ? 'text-slate-300' : 'text-slate-400'}>
                {t.icon}
              </span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── ONGLET INFORMATIONS ── */}
      {tab === 'info' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-5">
          {courseId && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-800 text-sm flex items-center gap-2">
              ℹ️ Vous modifiez les informations du cours déjà créé.
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              className={`${INP} ${infoErr.title ? 'border-red-400 bg-red-50' : ''}`}
              placeholder="Ex : React.js de Zéro à Expert"
              value={info.title}
              onChange={e => { setInfo(p => ({ ...p, title: e.target.value })); setInfoErr(p => ({ ...p, title: '' })) }}
            />
            {infoErr.title && <p className="text-red-500 text-xs mt-1">⚠️ {infoErr.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`${INP} resize-none ${infoErr.desc ? 'border-red-400 bg-red-50' : ''}`}
              rows={4}
              placeholder="Décrivez ce que les apprenants vont apprendre..."
              value={info.description}
              onChange={e => { setInfo(p => ({ ...p, description: e.target.value })); setInfoErr(p => ({ ...p, desc: '' })) }}
            />
            {infoErr.desc && <p className="text-red-500 text-xs mt-1">⚠️ {infoErr.desc}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                className={`${INP} ${infoErr.cat ? 'border-red-400 bg-red-50' : ''}`}
                value={info.category_id}
                onChange={e => { setInfo(p => ({ ...p, category_id: e.target.value })); setInfoErr(p => ({ ...p, cat: '' })) }}
              >
                <option value="">-- Choisir --</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              {infoErr.cat && <p className="text-red-500 text-xs mt-1">⚠️ {infoErr.cat}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Niveau</label>
              <select className={INP} value={info.level} onChange={e => setInfo(p => ({ ...p, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Langue</label>
              <select className={INP} value={info.language} onChange={e => setInfo(p => ({ ...p, language: e.target.value }))}>
                {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image de couverture</label>
            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-all overflow-hidden group">
              {thumbUrl
                ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-cyan-500">
                    <FaImage className="text-3xl" />
                    <span className="text-sm">Cliquer pour uploader (JPG / PNG, max 2 Mo)</span>
                  </div>
              }
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setThumb(f); setThumbUrl(URL.createObjectURL(f)) }
              }} />
            </label>
          </div>

          <button type="button" onClick={saveInfo} disabled={savingInfo} className={BTNP + ' w-full justify-center py-3.5 text-base'}>
            {savingInfo
              ? <><FaSpinner className="animate-spin" /> Sauvegarde en cours...</>
              : courseId
              ? <><FaSave /> Mettre à jour les informations</>
              : <><FaCheck /> Créer le cours et débloquer les autres onglets →</>
            }
          </button>
        </div>
      )}

      {/* ── ONGLET CONTENU ── */}
      {tab === 'content' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">📚 Sections et Leçons</h2>
              <p className="text-slate-500 text-sm">{sections.length} section(s) · {totalLessons} leçon(s)</p>
            </div>
            <button type="button" onClick={addSection} disabled={addingSec} className={BTNP}>
              {addingSec ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              {addingSec ? 'Création...' : 'Ajouter une section'}
            </button>
          </div>

          {loadingSec ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <FaSpinner className="animate-spin text-cyan-500 text-2xl" />
              <span>Chargement des sections...</span>
            </div>
          ) : sections.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-slate-600 font-semibold mb-1">Aucune section</p>
              <p className="text-slate-400 text-sm mb-4">Commencez par créer votre première section</p>
              <button type="button" onClick={addSection} disabled={addingSec} className={BTNP}>
                {addingSec ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                Créer la première section
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((s, i) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  index={i}
                  courseId={courseId}
                  onRename={renameSection}
                  onDelete={deleteSection}
                  onAddLesson={addLesson}
                  onEditLesson={(lesson, sectionId) => setModalLesson({ lesson, sectionId })}
                  onDeleteLesson={deleteLesson}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ONGLET TARIFICATION ── */}
      {tab === 'price' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">💰 Tarification</h2>
            <p className="text-slate-500 text-sm">Définissez le prix de votre formation en FCFA</p>
          </div>

          <div className="max-w-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix (FCFA)</label>
            <input
              type="number" min="0" className={INP}
              placeholder="Ex : 25000"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1.5">Entrez 0 pour un cours entièrement gratuit</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 mb-3">Suggestions :</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Gratuit',       val: 0,     desc: 'Accès libre' },
                { label: '15 000 FCFA',   val: 15000, desc: 'Cours basique' },
                { label: '25 000 FCFA',   val: 25000, desc: 'Cours standard' },
                { label: '40 000 FCFA',   val: 40000, desc: 'Cours premium' },
              ].map(p => (
                <button key={p.val} type="button"
                  onClick={() => setPrice(String(p.val))}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    Number(price) === p.val ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <p className="font-bold text-slate-800 text-sm">{p.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={savePrice} disabled={savingPrice} className={BTNP}>
            {savingPrice ? <><FaSpinner className="animate-spin" /> Sauvegarde...</> : <><FaSave /> Enregistrer le prix</>}
          </button>
        </div>
      )}

      {/* ── ONGLET PUBLICATION ── */}
      {tab === 'publish' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">🚀 Publication</h2>
            <p className="text-slate-500 text-sm">Soumettez votre cours pour validation par l'équipe XamXam</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-2 gap-4">
            {[
              ['Titre',       info.title || '—'],
              ['Sections',    `${sections.length} section(s)`],
              ['Leçons',      `${totalLessons} leçon(s)`],
              ['Niveau',      info.level],
              ['Prix',        price && Number(price) > 0 ? `${Number(price).toLocaleString('fr-FR')} FCFA` : 'Gratuit'],
              ['Langue',      info.language],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start gap-2">
                <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{v}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            ⏱️ Après soumission, votre cours sera examiné sous <strong>24 à 48h</strong>.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={submitCourse} disabled={submitting}
              className={BTNP + ' flex-1 justify-center py-3.5 text-base bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'}>
              {submitting ? <><FaSpinner className="animate-spin" /> Soumission...</> : '🚀 Soumettre pour validation'}
            </button>
            <button type="button" onClick={() => navigate('/instructor/courses')} className={BTNO + ' justify-center'}>
              💾 Garder en brouillon
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
