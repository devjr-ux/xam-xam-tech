import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './config'

/* ── Inscription ─────────────────────────────────────────── */
export async function register({ name, email, password, role = 'student' }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })

  const userData = {
    name,
    email:     email.toLowerCase(),
    role,
    status:    'active',
    avatar:    null,
    country:   null,
    bio:       null,
    phone:     null,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'users', cred.user.uid), userData)

  return { user: { id: cred.user.uid, ...userData }, uid: cred.user.uid }
}

/* ── Connexion ───────────────────────────────────────────── */
export async function login(email, password) {
  const cred    = await signInWithEmailAndPassword(auth, email, password)
  const profile = await getUserProfile(cred.user.uid)

  if (profile?.status === 'suspended') {
    await signOut(auth)
    throw new Error('Votre compte a été suspendu. Contactez l\'administration.')
  }

  return { user: profile, uid: cred.user.uid }
}

/* ── Déconnexion ─────────────────────────────────────────── */
export async function logout() {
  await signOut(auth)
}

/* ── Profil Firestore ────────────────────────────────────── */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/* ── Mise à jour profil ──────────────────────────────────── */
export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  return getUserProfile(uid)
}
