import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaPlus, FaHeart, FaComment, FaEye, FaSpinner, FaFire } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import * as forumSvc from '../../firebase/forumService'

const CATEGORIES = ['Tous', 'React', 'Python', 'Design', 'Laravel', 'Mobile', 'DevOps', 'Général']
const INP = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm'

function PostCard({ post, onClick }) {
  const [liked, setLiked] = useState(false)
  const [cnt, setCnt]     = useState(post.likesCount || 0)
  const initials = post.userName?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '??'
  const time = post.createdAt?.seconds ? new Date(post.createdAt.seconds*1000).toLocaleDateString('fr-FR') : '—'

  const handleLike = async (e) => {
    e.stopPropagation()
    try { await forumSvc.likePost(post.id); setLiked(p=>!p); setCnt(p=>liked?p-1:p+1) } catch {}
  }

  return (
    <motion.div variants={fadeInUp} onClick={() => onClick(post)} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{post.userName}</span>
            {post.userRole === 'instructor' && <MdVerified className="text-cyan-500" />}
            <span className="text-slate-400 text-xs ml-auto">{time}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge color="cyan">{post.category}</Badge>
            {post.isPinned && <Badge color="yellow">📌 Épinglé</Badge>}
            {post.isSolved && <Badge color="green">✅ Résolu</Badge>}
          </div>
        </div>
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{post.title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.content}</p>
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs">#{t}</span>)}
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
        <button type="button" onClick={handleLike} className={`flex items-center gap-1.5 ${liked ? 'text-red-500' : 'hover:text-red-400'}`}><FaHeart /> {cnt}</button>
        <span className="flex items-center gap-1.5"><FaComment /> {post.repliesCount || 0}</span>
        <span className="flex items-center gap-1.5"><FaEye /> {post.views || 0}</span>
      </div>
    </motion.div>
  )
}

function PostDetail({ post, onBack }) {
  const { user } = useAuth()
  const [fullPost, setFullPost] = useState(post)
  const [newReply, setNewReply] = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)

  useState(() => {
    forumSvc.getPost(post.id).then(setFullPost).finally(() => setLoading(false))
  })

  const submit = async () => {
    if (!newReply.trim() || !user) return
    setSending(true)
    try {
      const r = await forumSvc.createReply(post.id, user.uid || user.id, user.name, user.role, newReply)
      setFullPost(p => ({ ...p, replies: [...(p.replies || []), r] }))
      setNewReply('')
    } catch (e) { alert(e.message) }
    finally { setSending(false) }
  }

  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-5">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm">← Retour au forum</button>
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {fullPost.userName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{fullPost.userName}</p>
            <p className="text-slate-400 text-xs">{fullPost.createdAt?.seconds ? new Date(fullPost.createdAt.seconds*1000).toLocaleDateString('fr-FR') : '—'}</p>
          </div>
          <div className="flex gap-2"><Badge color="cyan">{fullPost.category}</Badge>{fullPost.isSolved && <Badge color="green">✅</Badge>}</div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-3">{fullPost.title}</h2>
        <p className="text-slate-600 text-sm leading-relaxed">{fullPost.content}</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-800">{(fullPost.replies || []).length} Réponse(s)</h3>
        {(fullPost.replies || []).map((r, i) => (
          <div key={r.id || i} className={`bg-white rounded-2xl p-5 border ${r.userRole==='instructor' ? 'border-cyan-200 bg-cyan-50/30' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {r.userName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">{r.userName}</span>
                  {r.userRole === 'instructor' && <span className="text-xs text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded-full flex items-center gap-1"><MdVerified /> Formateur</span>}
                </div>
                <p className="text-slate-400 text-xs">{r.createdAt?.seconds ? new Date(r.createdAt.seconds*1000).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>

      {user ? (
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-3">Votre réponse</h4>
          <textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Partagez votre réponse..." rows={4} className={`${INP} resize-none mb-3`} />
          <Button onClick={submit} disabled={!newReply.trim() || sending}>
            {sending ? <><FaSpinner className="animate-spin" /> Envoi...</> : 'Publier la réponse'}
          </Button>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-sm text-slate-500">
          <a href="/login" className="text-cyan-600 hover:underline font-medium">Connectez-vous</a> pour répondre.
        </div>
      )}
    </motion.div>
  )
}

function NewPostModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title:'', content:'', category:'Général', tags:'' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const tags = form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : []
      const r = await forumSvc.createPost(user.uid||user.id, user.name, user.role, { ...form, tags })
      onCreated(r); onClose()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e=>e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-5">💬 Nouvelle discussion</h3>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie</label>
            <select className={INP} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATEGORIES.filter(c=>c!=='Tous').map(c=><option key={c}>{c}</option>)}
            </select></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre *</label>
            <input required className={INP} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Votre question..." /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
            <textarea required rows={4} className={`${INP} resize-none`} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Décrivez votre problème..." /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (séparés par virgules)</label>
            <input className={INP} value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="react, hooks..." /></div>
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

export default function ForumPage() {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('Tous')
  const [selectedPost, setSelectedPost] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useRefreshOnNav(() => {
    setLoading(true)
    forumSvc.getPosts({ category: category !== 'Tous' ? category : null })
      .then(data => setPosts(data || []))
      .catch(()=>{})
      .finally(() => setLoading(false))
  })

  const filtered = posts.filter(p => {
    const mc = category === 'Tous' || p.category === category
    const ms = p.title?.toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  if (selectedPost) return <div className="max-w-3xl mx-auto"><PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} /></div>

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Forum communautaire 💬</h1>
          <p className="text-slate-500 text-sm mt-1">Posez vos questions, partagez vos connaissances</p>
        </div>
        {user && <Button icon={<FaPlus />} onClick={() => setShowModal(true)}>Nouvelle discussion</Button>}
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
        {[
          { icon:<FaComment/>, label:'Discussions', value: loading?'...':posts.length, color:'bg-cyan-50 text-cyan-600' },
          { icon:<FaFire/>, label:'Épinglés', value: loading?'...':posts.filter(p=>p.isPinned).length, color:'bg-orange-50 text-orange-600' },
          { icon:<MdVerified/>, label:'Résolus', value: loading?'...':posts.filter(p=>p.isSolved).length, color:'bg-green-50 text-green-600' },
        ].map((s,i) => (
          <div key={i} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl flex justify-center mb-1">{s.icon}</div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs opacity-80">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="space-y-3">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={()=>setCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category===cat?'bg-cyan-500 text-white shadow-md':'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300'}`}>{cat}</button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-white rounded-2xl p-5 border border-slate-100"><div className="flex items-center gap-3 mb-3"><Skeleton className="w-10 h-10 rounded-xl"/><div className="flex-1"><Skeleton className="h-4 w-40 mb-1"/><Skeleton className="h-3 w-24"/></div></div><Skeleton className="h-5 w-3/4 mb-2"/><Skeleton className="h-4 w-full"/></div>)}</div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-slate-500">Aucune discussion trouvée.</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {filtered.map((post, i) => <motion.div key={post.id} custom={i} variants={cardVariants}><PostCard post={post} onClick={setSelectedPost} /></motion.div>)}
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <NewPostModal onClose={()=>setShowModal(false)} onCreated={p=>setPosts(prev=>[p,...prev])} />}
      </AnimatePresence>
    </motion.div>
  )
}
