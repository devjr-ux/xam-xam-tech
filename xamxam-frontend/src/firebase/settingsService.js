import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

const REF = () => doc(db, 'settings', 'main')

export async function getSettings() {
  const snap = await getDoc(REF())
  return snap.exists() ? snap.data() : {}
}

export async function saveSettings(data) {
  await setDoc(REF(), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}
