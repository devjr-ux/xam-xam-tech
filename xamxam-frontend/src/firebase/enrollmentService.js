import {
  doc, getDoc, getDocs, setDoc, updateDoc,
  collection, query, where, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './config'
import { checkAndIssueCertificate } from './certificateService'

/* ID unique : userId_courseId */
const enrollId = (userId, courseId) => `${userId}_${courseId}`

/* ── Vérifier accès ──────────────────────────────────────── */
export async function checkAccess(userId, courseId) {
  const snap = await getDoc(doc(db, 'enrollments', enrollId(userId, courseId)))
  if (!snap.exists()) return { enrolled: false, hasAccess: false }
  const data = snap.data()
  return {
    enrolled:       true,
    hasAccess:      ['free', 'paid'].includes(data.paymentStatus),
    paymentStatus:  data.paymentStatus,
    enrollmentId:   snap.id,
  }
}

/* ── S'inscrire ──────────────────────────────────────────── */
export async function enroll(userId, courseId, isFree) {
  const id     = enrollId(userId, courseId)
  const exists = await getDoc(doc(db, 'enrollments', id))
  if (exists.exists()) {
    const data = exists.data()
    return { enrollment: { id, ...data }, hasAccess: ['free','paid'].includes(data.paymentStatus), isNew: false }
  }

  const paymentStatus = isFree ? 'free' : 'pending'
  const enrollment = {
    userId, courseId, paymentStatus,
    progress: 0, completedAt: null, paidAt: null,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'enrollments', id), enrollment)

  // Incrémenter le compteur du cours
  await updateDoc(doc(db, 'courses', courseId), { enrollmentsCount: increment(1) })

  return { enrollment: { id, ...enrollment }, hasAccess: isFree, isNew: true }
}

/* ── Confirmer paiement ──────────────────────────────────── */
export async function confirmPayment(userId, courseId, paymentData) {
  const id  = enrollId(userId, courseId)
  const ref = doc(db, 'enrollments', id)
  await updateDoc(ref, {
    paymentStatus:    'paid',
    paymentReference: paymentData.reference || `PAY-${Date.now()}`,
    paidAt:           serverTimestamp(),
  })
  return { hasAccess: true, paymentStatus: 'paid' }
}

/* ── Mes cours ───────────────────────────────────────────── */
export async function getMyCourses(userId) {
  const snap = await getDocs(query(collection(db, 'enrollments'), where('userId', '==', userId)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/* ── Marquer leçon complétée ─────────────────────────────── */
export async function markLessonComplete(userId, lessonId, courseId, totalLessons) {
  // Enregistrer la complétion
  const compId = `${userId}_${lessonId}`
  await setDoc(doc(db, 'lesson_completions', compId), {
    userId, lessonId, courseId, completedAt: serverTimestamp(),
  }, { merge: true })

  // Recalculer la progression
  const completedSnap = await getDocs(
    query(collection(db, 'lesson_completions'), where('userId', '==', userId), where('courseId', '==', courseId))
  )
  const completedCount = completedSnap.size
  const progress       = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const enrollRef = doc(db, 'enrollments', enrollId(userId, courseId))
  await updateDoc(enrollRef, {
    progress,
    lastLessonId: lessonId,
    completedAt:  progress >= 100 ? serverTimestamp() : null,
  })

  // Vérifier si le certificat peut être émis (100% + tous quiz validés)
  let certificateIssued = false
  if (progress >= 100) {
    const cert = await checkAndIssueCertificate(userId, courseId).catch(() => null)
    certificateIssued = !!(cert && cert.isNew)
  }

  return { progress, completed: progress >= 100, certificateIssued }
}

/* ── Progression ─────────────────────────────────────────── */
export async function getProgress(userId, courseId) {
  const enrollSnap = await getDoc(doc(db, 'enrollments', enrollId(userId, courseId)))
  if (!enrollSnap.exists()) return null

  const completedSnap = await getDocs(
    query(collection(db, 'lesson_completions'), where('userId', '==', userId), where('courseId', '==', courseId))
  )
  return {
    enrollment:       { id: enrollSnap.id, ...enrollSnap.data() },
    completedLessons: completedSnap.size,
    completedIds:     completedSnap.docs.map(d => d.data().lessonId),
  }
}

/* ── Apprenants d'un formateur ───────────────────────────── */
export async function getStudentsForInstructor(courseIds) {
  if (!courseIds.length) return []
  // Firestore limite whereIn à 10 éléments
  const chunks = []
  for (let i = 0; i < courseIds.length; i += 10) chunks.push(courseIds.slice(i, i + 10))

  const all = []
  for (const chunk of chunks) {
    const snap = await getDocs(query(collection(db, 'enrollments'), where('courseId', 'in', chunk)))
    all.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }
  return all
}
