import {
  collection, doc, getDocs, getDoc, updateDoc,
  query, where, orderBy, limit,
} from 'firebase/firestore'
import { db } from './config'

/* ── Stats globales (sans getCountFromServer — compatible Spark) ── */
export async function getAdminStats() {
  const [usersSnap, coursesSnap, enrollSnap, certsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(query(collection(db, 'courses'), where('status', '==', 'published'))),
    getDocs(collection(db, 'enrollments')),
    getDocs(collection(db, 'certificates')),
  ])

  const users       = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const students    = users.filter(u => u.role === 'student')
  const instructors = users.filter(u => u.role === 'instructor')

  const allCourses  = await getDocs(query(collection(db, 'courses'), where('status', '==', 'pending')))

  // Top 5 cours
  const topSnap = await getDocs(query(
    collection(db, 'courses'),
    where('status', '==', 'published'),
    orderBy('enrollmentsCount', 'desc'),
    limit(5),
  ))
  const topCourses  = topSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Utilisateurs récents
  const recentSnap  = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)))
  const recentUsers = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  return {
    total_users:        usersSnap.size,
    total_students:     students.length,
    total_instructors:  instructors.length,
    total_courses:      coursesSnap.size,
    pending_courses:    allCourses.size,
    total_enrollments:  enrollSnap.size,
    total_certificates: certsSnap.size,
    top_courses:        topCourses.map(c => ({ ...c, enrollments_count: c.enrollmentsCount })),
    recent_users:       recentUsers,
  }
}

/* ── Liste des utilisateurs ──────────────────────────────── */
export async function getUsers(filters = {}) {
  let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  if (filters.role) q = query(collection(db, 'users'), where('role', '==', filters.role), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/* ── Modifier statut / rôle ──────────────────────────────── */
export async function updateUser(userId, data) {
  await updateDoc(doc(db, 'users', userId), data)
  const snap = await getDoc(doc(db, 'users', userId))
  return { id: snap.id, ...snap.data() }
}
