import {
  collection, doc, getDoc, getDocs, setDoc, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

export async function getCertificates(userId) {
  const snap = await getDocs(query(collection(db, 'certificates'), where('userId', '==', userId)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getCertificateByNumber(certificateId) {
  const snap = await getDocs(
    query(collection(db, 'certificates'), where('certificateId', '==', certificateId))
  )
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function checkAndIssueCertificate(userId, courseId) {
  const certRef  = doc(db, 'certificates', `${userId}_${courseId}`)
  const certSnap = await getDoc(certRef)
  if (certSnap.exists()) return { alreadyIssued: true, ...certSnap.data() }

  // 100% progression ?
  const enrollSnap = await getDoc(doc(db, 'enrollments', `${userId}_${courseId}`))
  if (!enrollSnap.exists() || enrollSnap.data().progress < 100) return null

  // Tous les quiz réussis ?
  const quizzesSnap = await getDocs(
    query(collection(db, 'quizzes'), where('courseId', '==', courseId))
  )
  const quizIds = quizzesSnap.docs.map(d => d.id)
  let avgScore = 100

  if (quizIds.length > 0) {
    const attemptsSnap = await getDocs(
      query(collection(db, 'quiz_attempts'), where('userId', '==', userId))
    )
    const attempts  = attemptsSnap.docs.map(d => d.data())
    const passedIds = new Set(attempts.filter(a => a.passed).map(a => a.quizId))
    if (!quizIds.every(id => passedIds.has(id))) return null

    const best = {}
    attempts.forEach(a => {
      if (quizIds.includes(a.quizId) && (!best[a.quizId] || a.score > best[a.quizId]))
        best[a.quizId] = a.score
    })
    const scores = Object.values(best)
    avgScore = scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 100
  }

  // Infos apprenant
  const userSnap = await getDoc(doc(db, 'users', userId))
  const user     = userSnap.exists() ? userSnap.data() : {}

  // Infos cours
  const courseSnap = await getDoc(doc(db, 'courses', courseId))
  const course     = courseSnap.exists() ? courseSnap.data() : {}

  // Compter leçons + durée totale
  let totalLessons  = 0
  let totalSeconds  = 0
  const sectionsSnap = await getDocs(collection(db, 'courses', courseId, 'sections'))
  await Promise.all(sectionsSnap.docs.map(async sDoc => {
    const lSnap = await getDocs(
      collection(db, 'courses', courseId, 'sections', sDoc.id, 'lessons')
    )
    totalLessons += lSnap.size
    lSnap.docs.forEach(l => { totalSeconds += l.data().duration || 0 })
  }))

  const totalHours = totalSeconds > 0
    ? Math.max(1, Math.round(totalSeconds / 3600))
    : Math.max(1, Math.ceil(totalLessons * 1.5))

  const certData = {
    userId,
    courseId,
    certificateId:  `XXT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    score:          avgScore,
    studentName:    user.name    || '',
    courseName:     course.title || '',
    courseLevel:    course.level || 'Intermédiaire',
    instructorName: course.instructorName || 'XamXam Tech',
    totalLessons,
    totalHours,
    totalQuizzes:   quizIds.length,
    issuedAt:       serverTimestamp(),
  }

  await setDoc(certRef, certData)
  return { ...certData, isNew: true }
}
