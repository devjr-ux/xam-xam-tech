import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './config'

/* ── Liste des posts ─────────────────────────────────────── */
export async function getPosts(filters = {}) {
  let q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'))
  if (filters.category && filters.category !== 'Tous') {
    q = query(collection(db, 'forum_posts'),
      where('category', '==', filters.category),
      orderBy('createdAt', 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/* ── Détail d'un post + réponses ─────────────────────────── */
export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'forum_posts', postId))
  if (!snap.exists()) throw new Error('Post introuvable.')

  // Incrémenter les vues
  await updateDoc(doc(db, 'forum_posts', postId), { views: increment(1) })

  const post = { id: snap.id, ...snap.data() }
  const repliesSnap = await getDocs(
    query(collection(db, 'forum_posts', postId, 'replies'), orderBy('createdAt'))
  )
  post.replies = repliesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  return post
}

/* ── Créer un post ───────────────────────────────────────── */
export async function createPost(userId, userName, userRole, data) {
  const ref = await addDoc(collection(db, 'forum_posts'), {
    userId, userName, userRole,
    category:     data.category || 'Général',
    title:        data.title.trim(),
    content:      data.content.trim(),
    tags:         data.tags || [],
    isPinned:     false,
    isSolved:     false,
    views:        0,
    likesCount:   0,
    repliesCount: 0,
    createdAt:    serverTimestamp(),
  })
  return { id: ref.id, userId, userName, ...data }
}

/* ── Répondre ────────────────────────────────────────────── */
export async function createReply(postId, userId, userName, userRole, content) {
  const ref = await addDoc(collection(db, 'forum_posts', postId, 'replies'), {
    userId, userName, userRole,
    content:    content.trim(),
    isAccepted: false,
    createdAt:  serverTimestamp(),
  })
  await updateDoc(doc(db, 'forum_posts', postId), { repliesCount: increment(1) })
  return { id: ref.id, userId, userName, userRole, content, isAccepted: false }
}

/* ── Liker ───────────────────────────────────────────────── */
export async function likePost(postId) {
  await updateDoc(doc(db, 'forum_posts', postId), { likesCount: increment(1) })
}
