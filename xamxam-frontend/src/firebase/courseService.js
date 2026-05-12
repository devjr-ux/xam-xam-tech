import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, increment,
  writeBatch,
} from 'firebase/firestore'
import { db } from './config'
import { uploadImage } from '../services/cloudinaryService'

const coursesRef = () => collection(db, 'courses')

/* ── Utilitaire : snapshot → objet ──────────────────────── */
const snap2obj = (s) => s.exists() ? { id: s.id, ...s.data() } : null
const snaps2arr = (s) => s.docs.map(d => ({ id: d.id, ...d.data() }))

/* ── Catalogue public ────────────────────────────────────── */
export async function getPublishedCourses(filters = {}) {
  let q = query(coursesRef(), where('status', '==', 'published'))
  if (filters.category) q = query(q, where('categoryId', '==', filters.category))
  if (filters.level)    q = query(q, where('level', '==', filters.level))
  q = query(q, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snaps2arr(snap)
}

export async function getCourse(courseId) {
  const snap = await getDoc(doc(db, 'courses', courseId))
  if (!snap.exists()) throw new Error('Cours introuvable.')
  const course = { id: snap.id, ...snap.data() }

  // Charger sections + leçons
  const sectionsSnap = await getDocs(
    query(collection(db, 'courses', courseId, 'sections'), orderBy('order'))
  )
  course.sections = await Promise.all(
    sectionsSnap.docs.map(async (sDoc) => {
      const section = { id: sDoc.id, ...sDoc.data() }
      const lessonsSnap = await getDocs(
        query(collection(db, 'courses', courseId, 'sections', sDoc.id, 'lessons'), orderBy('order'))
      )
      section.lessons = lessonsSnap.docs.map(l => ({ id: l.id, ...l.data() }))
      return section
    })
  )
  return course
}

/* ── Mes cours (formateur) ───────────────────────────────── */
export async function getMyCourses(instructorId, filters = {}) {
  let q = query(coursesRef(), where('instructorId', '==', instructorId), orderBy('createdAt', 'desc'))
  if (filters.status) q = query(coursesRef(), where('instructorId', '==', instructorId), where('status', '==', filters.status))
  const snap = await getDocs(q)
  return snaps2arr(snap)
}

/* ── Créer un cours ──────────────────────────────────────── */
export async function createCourse(instructorId, instructorName, data) {
  const courseData = {
    ...data,
    instructorId,
    instructorName,
    status:          'draft',
    rating:          0,
    ratingsCount:    0,
    enrollmentsCount: 0,
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  }
  const docRef = await addDoc(coursesRef(), courseData)
  return { id: docRef.id, ...courseData }
}

/* ── Modifier un cours ───────────────────────────────────── */
export async function updateCourse(courseId, data) {
  await updateDoc(doc(db, 'courses', courseId), { ...data, updatedAt: serverTimestamp() })
  return getCourse(courseId)
}

/* ── Supprimer un cours ──────────────────────────────────── */
export async function deleteCourse(courseId) {
  await deleteDoc(doc(db, 'courses', courseId))
}

/* ── Soumettre pour validation ───────────────────────────── */
export async function submitCourse(courseId) {
  await updateDoc(doc(db, 'courses', courseId), { status: 'pending', updatedAt: serverTimestamp() })
}

/* ── Admin : publier / refuser ───────────────────────────── */
export async function publishCourse(courseId) {
  await updateDoc(doc(db, 'courses', courseId), { status: 'published', updatedAt: serverTimestamp() })
}
export async function rejectCourse(courseId) {
  await updateDoc(doc(db, 'courses', courseId), { status: 'rejected', updatedAt: serverTimestamp() })
}

/* ── Upload thumbnail via Cloudinary (gratuit, sans Firebase Storage) ── */
export async function uploadThumbnail(courseId, file) {
  const url = await uploadImage(file, 'xamxam/thumbnails')
  await updateDoc(doc(db, 'courses', courseId), { thumbnail: url })
  return url
}

/* ── Toutes les cours (admin) ────────────────────────────── */
export async function getAllCourses(filters = {}) {
  let q = query(coursesRef(), orderBy('createdAt', 'desc'))
  if (filters.status) q = query(coursesRef(), where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snaps2arr(snap)
}

/* ══ SECTIONS ════════════════════════════════════════════ */
export async function getSections(courseId) {
  const snap = await getDocs(
    query(collection(db, 'courses', courseId, 'sections'), orderBy('order'))
  )
  return Promise.all(snap.docs.map(async (sDoc) => {
    const section = { id: sDoc.id, ...sDoc.data() }
    const lessonsSnap = await getDocs(
      query(collection(db, 'courses', courseId, 'sections', sDoc.id, 'lessons'), orderBy('order'))
    )
    section.lessons = lessonsSnap.docs.map(l => ({ id: l.id, ...l.data() }))
    return section
  }))
}

export async function createSection(courseId, data) {
  const ref = await addDoc(collection(db, 'courses', courseId, 'sections'), {
    ...data, createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, lessons: [] }
}

export async function updateSection(courseId, sectionId, data) {
  await updateDoc(doc(db, 'courses', courseId, 'sections', sectionId), data)
}

export async function deleteSection(courseId, sectionId) {
  await deleteDoc(doc(db, 'courses', courseId, 'sections', sectionId))
}

/* ══ LEÇONS ══════════════════════════════════════════════ */
export async function createLesson(courseId, sectionId, data) {
  const ref = await addDoc(collection(db, 'courses', courseId, 'sections', sectionId, 'lessons'), {
    ...data, createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...data }
}

export async function updateLesson(courseId, sectionId, lessonId, data) {
  await updateDoc(doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId), data)
  const snap = await getDoc(doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId))
  return { id: snap.id, ...snap.data() }
}

export async function deleteLesson(courseId, sectionId, lessonId) {
  await deleteDoc(doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId))
}

export async function uploadLessonFile(courseId, sectionId, lessonId, file, type) {
  // Upload via Cloudinary (gratuit — Firebase Storage non activé)
  const folder = type === 'video' ? 'videos' : 'pdfs'
  const url = await uploadImage(file, `xamxam/lessons/${folder}`)
  const field = type === 'video' ? 'videoUrl' : 'pdfUrl'
  await updateLesson(courseId, sectionId, lessonId, { [field]: url })
  return url
}

/* ══ CATÉGORIES ══════════════════════════════════════════ */
export async function getCategories() {
  const snap = await getDocs(collection(db, 'categories'))
  if (snap.empty) {
    await initCategories()
    const newSnap = await getDocs(collection(db, 'categories'))
    return snaps2arr(newSnap)
  }
  return snaps2arr(snap)
}

export async function initCategories() {
  const cats = [
    { name: 'Développement Web', slug: 'web',     icon: '🌐' },
    { name: 'Mobile',            slug: 'mobile',  icon: '📱' },
    { name: 'Data & IA',         slug: 'data',    icon: '🤖' },
    { name: 'Design',            slug: 'design',  icon: '🎨' },
    { name: 'Backend',           slug: 'backend', icon: '⚙️' },
    { name: 'DevOps',            slug: 'devops',  icon: '☁️' },
  ]
  const batch = writeBatch(db)
  cats.forEach(c => batch.set(doc(collection(db, 'categories')), c))
  await batch.commit()
}
