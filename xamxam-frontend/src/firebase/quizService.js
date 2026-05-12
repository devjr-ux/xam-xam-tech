import {
  doc, getDoc, getDocs, addDoc,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import { checkAndIssueCertificate } from './certificateService'
import { markLessonComplete } from './enrollmentService'

/* ── Quiz par leçon ──────────────────────────────────────── */
export async function getQuizByLesson(lessonId) {
  const snap = await getDocs(query(collection(db, 'quizzes'), where('lessonId', '==', lessonId)))
  if (snap.empty) throw new Error('Aucun quiz pour cette leçon.')
  const quiz = { id: snap.docs[0].id, ...snap.docs[0].data() }

  // Charger les questions (sans les bonnes réponses pour l'apprenant)
  const qSnap = await getDocs(collection(db, 'quizzes', quiz.id, 'questions'))
  quiz.questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  return quiz
}

/* ── Quiz complet pour le formateur ─────────────────────── */
export async function getQuizForInstructor(quizId) {
  const snap = await getDoc(doc(db, 'quizzes', quizId))
  if (!snap.exists()) throw new Error('Quiz introuvable.')
  const quiz = { id: snap.id, ...snap.data() }
  const qSnap = await getDocs(collection(db, 'quizzes', quizId, 'questions'))
  quiz.questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  return quiz
}

/* ── Créer un quiz ───────────────────────────────────────── */
export async function createQuiz(lessonId, courseId, data) {
  const quizRef = await addDoc(collection(db, 'quizzes'), {
    lessonId, courseId,
    title:        data.title,
    passingScore: data.passingScore || 60,
    duration:     (data.duration || 15) * 60,
    createdAt:    serverTimestamp(),
  })

  for (const q of (data.questions || [])) {
    await addDoc(collection(db, 'quizzes', quizRef.id, 'questions'), q)
  }

  return { id: quizRef.id }
}

/* ── Soumettre un quiz ───────────────────────────────────── */
export async function submitQuiz(userId, quizId, answers) {
  // Charger quiz + questions avec bonnes réponses
  const snap  = await getDoc(doc(db, 'quizzes', quizId))
  const quiz  = { id: snap.id, ...snap.data() }
  const qSnap = await getDocs(collection(db, 'quizzes', quizId, 'questions'))
  const questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  let correct = 0
  const details = questions.map((q, i) => {
    const userAnswer    = answers[i] ?? null
    const isCorrect     = userAnswer === q.correctOption
    if (isCorrect) correct++
    return {
      questionId:    q.id,
      userAnswer,
      correctAnswer: q.correctOption,
      isCorrect,
      explanation:   q.explanation || '',
    }
  })

  const score  = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
  const passed = score >= (quiz.passingScore || 60)

  await addDoc(collection(db, 'quiz_attempts'), {
    userId, quizId,
    courseId: quiz.courseId,
    score, passed, answers, details,
    createdAt: serverTimestamp(),
  })

  // Marquer la leçon quiz comme complétée (met à jour la progression)
  if (quiz.lessonId && quiz.courseId) {
    try {
      // Compter le total de leçons du cours pour calculer la progression
      const sectionsSnap = await getDocs(collection(db, 'courses', quiz.courseId, 'sections'))
      let totalLessons = 0
      await Promise.all(sectionsSnap.docs.map(async sDoc => {
        const lSnap = await getDocs(
          collection(db, 'courses', quiz.courseId, 'sections', sDoc.id, 'lessons')
        )
        totalLessons += lSnap.size
      }))
      await markLessonComplete(userId, quiz.lessonId, quiz.courseId, totalLessons)
    } catch (_) { /* silencieux — la progression sera corrigée au prochain accès */ }
  }

  // Vérifier si le certificat peut être émis
  let certificateIssued = false
  if (quiz.courseId) {
    const cert = await checkAndIssueCertificate(userId, quiz.courseId).catch(() => null)
    certificateIssued = !!(cert && cert.isNew)
  }

  return { score, passed, correct, total: questions.length, details, certificateIssued }
}
