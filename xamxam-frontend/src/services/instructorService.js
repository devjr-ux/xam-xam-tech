import * as fbCourse from '../firebase/courseService'
import * as fbEnroll from '../firebase/enrollmentService'
import * as fbQuiz   from '../firebase/quizService'
import { auth } from '../firebase/config'
import { getUserProfile } from '../firebase/authService'
import {
  collection, query, where, getDocs,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const uid = () => auth.currentUser?.uid

/* ── Dashboard ─────────────────────────────────────────── */
async function getDashboard() {
  const instructorId = uid()
  const courses = await fbCourse.getMyCourses(instructorId)
  const courseIds = courses.map(c => c.id)

  const enrollments = await fbEnroll.getStudentsForInstructor(courseIds)
  const totalStudents = new Set(enrollments.map(e => e.userId)).size
  const totalRevenue  = enrollments
    .filter(e => e.paymentStatus === 'paid')
    .reduce((sum, e) => {
      const c = courses.find(c => c.id === e.courseId)
      return sum + (c?.price || 0)
    }, 0)

  const avgRating = courses.reduce((s, c) => s + (c.rating || 0), 0) / (courses.length || 1)

  return {
    total_courses:    courses.length,
    total_students:   totalStudents,
    avg_rating:       Math.round(avgRating * 10) / 10,
    total_revenue:    totalRevenue,
    courses_breakdown: courses.map(c => ({ ...c, students_count: enrollments.filter(e => e.courseId === c.id).length })),
  }
}

/* ── Stats ─────────────────────────────────────────────── */
async function getStats() {
  const instructorId = uid()
  const courses = await fbCourse.getMyCourses(instructorId)
  const courseIds = courses.map(c => c.id)
  const enrollments = await fbEnroll.getStudentsForInstructor(courseIds)
  const totalStudents = new Set(enrollments.map(e => e.userId)).size
  const totalRevenue = enrollments.filter(e => e.paymentStatus === 'paid').reduce((sum, e) => {
    const c = courses.find(c => c.id === e.courseId)
    return sum + (c?.price || 0)
  }, 0)
  return {
    total_courses:     courses.length,
    total_students:    totalStudents,
    avg_rating:        courses.reduce((s,c) => s+(c.rating||0), 0) / (courses.length||1),
    total_revenue:     totalRevenue,
    courses_breakdown: courses.map(c => ({...c, students_count: enrollments.filter(e=>e.courseId===c.id).length})),
    monthly_enrollments: [],
    total_quiz_attempts: 0,
    quiz_pass_rate: 0,
  }
}

/* ── Étudiants ─────────────────────────────────────────── */
async function getStudents(params = {}) {
  const instructorId = uid()
  const courses = await fbCourse.getMyCourses(instructorId)
  const courseIds = courses.map(c => c.id)
  const enrollments = await fbEnroll.getStudentsForInstructor(courseIds)

  // Enrichir avec les infos user et cours
  const enriched = await Promise.all(enrollments.map(async (enroll) => {
    const [courseSnap, userSnap] = await Promise.all([
      fbCourse.getCourse(enroll.courseId).catch(() => null),
      getUserProfile(enroll.userId).catch(() => null),
    ])
    return { ...enroll, course: courseSnap ? { id: courseSnap.id, title: courseSnap.title } : null, user: userSnap }
  }))

  if (params.search) {
    const s = params.search.toLowerCase()
    return enriched.filter(e => e.user?.name?.toLowerCase().includes(s) || e.user?.email?.toLowerCase().includes(s))
  }
  return enriched
}

export const instructorService = {
  getDashboard:    ()            => getDashboard(),
  getStats:        ()            => getStats(),
  getMyCourses:    (p)           => fbCourse.getMyCourses(uid(), p),
  getStudents:     (p)           => getStudents(p),

  // Cours
  createCourse: async (data) => {
    const profile = await getUserProfile(uid())
    return fbCourse.createCourse(uid(), profile.name, data)
  },
  updateCourse:    (id, data)    => fbCourse.updateCourse(id, data),
  deleteCourse:    (id)          => fbCourse.deleteCourse(id),
  submitCourse:    (id)          => fbCourse.submitCourse(id),
  getCourse:       (id)          => fbCourse.getCourse(id),
  uploadThumbnail: (id, file)    => fbCourse.uploadThumbnail(id, file),

  // Sections
  getSections:    (courseId)        => fbCourse.getSections(courseId),
  createSection:  (courseId, data)  => fbCourse.createSection(courseId, data),
  updateSection:  (sectionId, data, courseId) => fbCourse.updateSection(courseId, sectionId, data),
  deleteSection:  (sectionId, courseId)       => fbCourse.deleteSection(courseId, sectionId),

  // Leçons
  createLesson: (courseId, data) => fbCourse.createLesson(courseId, data.section_id, {
    title: data.title, type: data.type, videoUrl: data.video_url || '',
    pdfUrl: data.pdf_url || '', duration: data.duration || 0, isFree: data.is_free || false, order: data.order || 0,
  }),
  updateLesson: (lessonId, data, sectionId, courseId) => fbCourse.updateLesson(courseId, sectionId, lessonId, {
    title:    data.title,
    type:     data.type,
    videoUrl: data.videoUrl ?? data.video_url ?? '',
    pdfUrl:   data.pdfUrl   ?? data.pdf_url   ?? '',
    duration: data.duration || 0,
    isFree:   data.isFree   ?? data.is_free   ?? false,
  }),
  deleteLesson: (lessonId, sectionId, courseId) => fbCourse.deleteLesson(courseId, sectionId, lessonId),

  // Quiz
  getCategories: () => fbCourse.getCategories(),

  createQuiz: async (lessonId, courseId, data) => {
    const quizData = {
      title:        data.title,
      passingScore: data.passing_score ?? data.passingScore ?? 60,
      duration:     data.duration || 15,
      questions:    (data.questions || []).map(q => ({
        question:      q.question,
        options:       q.options,
        correctOption: q.correct_option ?? q.correctOption ?? 0,
        explanation:   q.explanation || '',
      })),
    }
    return fbQuiz.createQuiz(lessonId, courseId, quizData)
  },
}
