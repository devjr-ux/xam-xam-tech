import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaPlus, FaHeart, FaComment, FaEye, FaSpinner, FaFire } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import api from '../../services/api'

const CATEGORIES = ['Tous', 'React', 'Python', 'Design', 'Laravel', 'Mobile', 'DevOps', 'Général']
const INP = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm'

/* ── Carte post ─────────────────────────────────────────── */
function PostCard({ post, onClick }) {
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(post.replies?.length ?? 0)
  const initials = post.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  const handleLike = async (e) => {
    e.stopPropagation()
    try {
      await api.post(`/forum/posts/${post.id}/like`)
      setLiked(p => !p)
      setLikeCount(p => liked ? p - 1 : p + 1)
    } catch {}
  }

  return (
    <motion.div variants={fadeInUp} onClick={() => onClick(post)}
      className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{post.user?.name}</span>
            {post.user?.role === 'instructor' && <MdVerified className="text-cyan-500" />}
            <span className="text-slate-400 text-xs ml-auto">
              {new Date(post.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <Badge color="cyan">{post.category}</Badge>
            {post.is_pinned && <Badge color="yellow">📌 Épinglé</Badge>}
            {post.is_solved && <Badge color="green">✅ Résolu</Badge>}
          </div>
        </div>
      </div>

      <h3 className="font-bold text-slate-800 mb-2 text-base leading-snug">{post.title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.content}</p>

      {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
        <button type="button" onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-400'}`}>
          <FaHeart /> {likeCount}
        </button>
        <span className="flex items-center gap-1.5">
          <FaComment /> {post.replies?.length ?? 0}
        </span>
        <span className="flex items-center gap-1.5">
          <FaEye /> {post.views ?? 0}
        </span>
      </div>
    </motion.div>
  )
}

/* ── Détail post ─────────────────────────────────────────── */
function PostDetail({ post, onBack }) {
  const { user }                = useAuth()
  const [fullPost, setFullPost] = useState(post)
  const [newReply, setNewReply] = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const initials = fullPost.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  useEffect(() => {
    api.get(`/forum/posts/${post.id}`)
      .then(r => setFullPost(r.data))
      .finally(() => setLoading(false))
  }, [post.id])

  const submitReply = async () => {
    if (!newReply.trim()) return
    setSending(true)
    try {
      const r = await api.post(`/forum/posts/${post.id}/reply`, { content: newReply.trim() })
      setFullPost(p => ({ ...p, replies: [...(p.replies || []), r.data] }))
      setNewReply('')
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de l\'envoi.')
    } finally { setSending(false) }
  }

  const replies = fullPost.replies || []

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <button type="button" onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors">
        ← Retour au forum
      </button>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{fullPost.user?.name}</p>
            <p className="text-slate-400 text-xs">{new Date(fullPost.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge color="cyan">{fullPost.category}</Badge>
            {fullPost.is_solved && <Badge color="green">✅ Résolu</Badge>}
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-3">{fullPost.title}</h2>
        <p className="text-slate-600 leading-relaxed text-sm">{fullPost.content}</p>
        {fullPost.tags && Array.isArray(fullPost.tags) && fullPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {fullPost.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Réponses */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-16" /></div>
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800">{replies.length} Réponse(s)</h3>
          {replies.map((reply, i) => {
            const ri = reply.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
            return (
              <div key={reply.id ?? i}
                className={`bg-white rounded-2xl p-5 border ${reply.user?.role === 'instructor' ? 'border-cyan-200 bg-cyan-50/30' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {ri}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{reply.user?.name}</span>
                      {reply.user?.role === 'instructor' && (
                        <span className="flex items-center gap-1 text-xs text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded-full">
                          <MdVerified /> Formateur
                        </span>
                      )}
                      {reply.is_accepted && (
                        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">✓ Meilleure réponse</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">{new Date(reply.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{reply.content}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Zone de réponse */}
      {user ? (
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-3">Votre réponse</h4>
          <textarea
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
            placeholder="Partagez votre réponse ou votre expérience..."
            rows={4}
            className={`${INP} resize-none mb-3`}
          />
          <Button onClick={submitReply} disabled={!newReply.trim() || sending}>
            {sending ? <><FaSpinner className="animate-spin" /> Envoi...</> : 'Publier la réponse'}
          </Button>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-slate-500 text-sm">
          <a href="/login" className="text-cyan-600 hover:underline font-medium">Connectez-vous</a> pour répondre.
        </div>
      )}
    </motion.div>
  )
}

/* ── Modal nouveau post ──────────────────────────────────── */
function NewPostModal({ onClose, onCreated }) {
  const [form, setForm]   = useState({ title: '', content: '', category: 'Général', tags: '' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const payload = {
        title:    form.title.trim(),
        content:  form.content.trim(),
        category: form.category,
        tags:     form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const r = await api.post('/forum/posts', payload)
      onCreated(r.data)
      onClose()
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de la création.')
    } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-5">💬 Nouvelle discussion</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie</label>
            <select className={INP} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.filter(c => c !== 'Tous').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre *</label>
            <input required className={INP} value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Posez votre question clairement..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
            <textarea required rows={4} className={`${INP} resize-none`} value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Décrivez votre problème en détail..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (séparés par des virgules)</label>
            <input className={INP} value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="react, hooks, state..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 justify-center" disabled={saving}>
              {saving ? <><FaSpinner className="animate-spin" /> Publication...</> : 'Publier'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">Annuler</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function ForumPage() {
  const { user }                  = useAuth()
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('Tous')
  const [selectedPost, setSelectedPost] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useRefreshOnNav(() => {
    setLoading(true)
    api.get('/forum/posts')
      .then(r => setPosts(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  })

  const filtered = posts.filter(p => {
    const matchCat    = category === 'Tous' || p.category === category
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const solved   = posts.filter(p => p.is_solved).length
  const pinned   = posts.filter(p => p.is_pinned).length

  if (selectedPost) {
    return (
      <div className="max-w-3xl mx-auto">
        <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Forum communautaire 💬</h1>
          <p className="text-slate-500 text-sm mt-1">Posez vos questions, partagez vos connaissances</p>
        </div>
        {user && (
          <Button icon={<FaPlus />} onClick={() => setShowModal(true)}>
            Nouvelle discussion
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-3">
        {loading ? [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100"><Skeleton className="h-12 w-full" /></div>)
          : [
            { icon: <FaComment />, label: 'Discussions', value: posts.length,   color: 'bg-cyan-50 text-cyan-600' },
            { icon: <FaFire />,    label: 'Épinglés',    value: pinned,          color: 'bg-orange-50 text-orange-600' },
            { icon: <MdVerified />,label: 'Résolues',    value: solved,          color: 'bg-green-50 text-green-600' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeInUp} className={`${s.color} rounded-2xl p-4 text-center`}>
              <div className="text-2xl flex justify-center mb-1">{s.icon}</div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </motion.div>
          ))
        }
      </motion.div>

      {/* Recherche + filtres */}
      <motion.div variants={fadeInUp} className="space-y-3">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une discussion..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat ? 'bg-cyan-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1"><Skeleton className="h-4 w-40 mb-1" /><Skeleton className="h-3 w-24" /></div>
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-slate-500">Aucune discussion trouvée.</p>
          {user && <Button className="mt-4" onClick={() => setShowModal(true)}>Créer la première discussion</Button>}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div key={post.id} custom={i} variants={cardVariants}>
              <PostCard post={post} onClick={setSelectedPost} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <NewPostModal
            onClose={() => setShowModal(false)}
            onCreated={(newPost) => setPosts(p => [newPost, ...p])}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
