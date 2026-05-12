import * as fbCourse  from '../firebase/courseService'
import * as fbEnroll  from '../firebase/enrollmentService'
import * as fbCert    from '../firebase/certificateService'
import { auth }       from '../firebase/config'
import { getUserProfile, updateUserProfile } from '../firebase/authService'
import { getDoc, doc, getDocs, collection, query, where, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const uid = () => auth.currentUser?.uid

/* ── Dashboard apprenant ────────────────────────────────── */
async function getDashboard() {
  const userId = uid()
  const enrollments = await fbEnroll.getMyCourses(userId)

  // Enrichir avec les infos cours
  const enriched = await Promise.all(
    enrollments.map(async (e) => {
      const course = await fbCourse.getCourse(e.courseId).catch(() => null)
      return { ...e, course: course ? { id: course.id, title: course.title, thumbnail: course.thumbnail } : null }
    })
  )

  // Tentatives quiz
  const quizSnap = await getDocs(query(collection(db, 'quiz_attempts'), where('userId', '==', userId)))
  const attempts = quizSnap.docs.map(d => d.data())
  const passed   = attempts.filter(a => a.passed).length
  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s,a) => s+a.score, 0) / attempts.length) : 0

  const certs = await fbCert.getCertificates(userId)

  return {
    enrolled_courses: enriched,
    certificates:     certs,
    quiz_attempts:    attempts.length,
    quiz_passed:      passed,
    avg_quiz_score:   avgScore,
  }
}

/* ── Favoris ─────────────────────────────────────────────── */
async function getFavorites() {
  const userId = uid()
  const snap = await getDocs(query(collection(db, 'favorites'), where('userId', '==', userId)))
  const favs = snap.docs.map(d => d.data().courseId)
  return Promise.all(favs.map(id => fbCourse.getCourse(id).catch(() => null))).then(r => r.filter(Boolean))
}

async function toggleFavorite(courseId) {
  const userId = uid()
  const id = `${userId}_${courseId}`
  const snap = await getDoc(doc(db, 'favorites', id))
  if (snap.exists()) {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'favorites', id))
    return { favorited: false }
  } else {
    await setDoc(doc(db, 'favorites', id), { userId, courseId, createdAt: serverTimestamp() })
    return { favorited: true }
  }
}

export const studentService = {
  getDashboard:    ()            => getDashboard(),
  getMyCourses:    ()            => fbEnroll.getMyCourses(uid()),
  getCourses:      (params)      => fbCourse.getPublishedCourses(params),
  getCourse:       (id)          => fbCourse.getCourse(id),
  getCategories:   ()            => fbCourse.getCategories(),

  enroll: async (courseId) => {
    const course = await fbCourse.getCourse(courseId)
    const isFree = !course.price || course.price <= 0
    return fbEnroll.enroll(uid(), courseId, isFree)
  },

  checkAccess:     (courseId)           => fbEnroll.checkAccess(uid(), courseId),
  getProgress:     (courseId)           => fbEnroll.getProgress(uid(), courseId),
  markLessonComplete: (lessonId, courseId, total) => fbEnroll.markLessonComplete(uid(), lessonId, courseId, total),

  initiatePayment: async (enrollmentId) => {
    const [userId, courseId] = enrollmentId.split('_')
    const course = await fbCourse.getCourse(courseId)
    return { enrollment_id: enrollmentId, course, amount: course.price, reference: `PAY-${Date.now()}` }
  },

  confirmPayment: (enrollmentId, data) => {
    const [userId, courseId] = enrollmentId.split('_')
    return fbEnroll.confirmPayment(uid(), courseId, data)
  },

  getFavorites:    ()            => getFavorites(),
  toggleFavorite:  (courseId)    => toggleFavorite(courseId),

  getCertificates: ()            => fbCert.getCertificates(uid()),

  updateProfile:   (data)        => updateUserProfile(uid(), data),
  getProfile:      ()            => getUserProfile(uid()),
}
