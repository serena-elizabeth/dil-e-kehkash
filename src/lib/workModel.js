import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, increment, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'

export const CATEGORIES = ['poems', 'quotes', 'stories', 'articles', 'songs', 'photos', 'other']
export const WORK_STATUS = { DRAFT: 'draft', PENDING: 'pending', PUBLISHED: 'published', REJECTED: 'rejected' }
export const WORK_VISIBILITY = { PRIVATE: 'private', SUBMITTED: 'submitted', PUBLIC: 'public' }

export function emptyWork(uid = '') {
  return {
    ownerUid: uid, title: '', category: 'poems', content: '',
    coverUrl: '', attachmentUrl: '', attachmentName: '', attachmentType: '',
    status: WORK_STATUS.DRAFT, visibility: WORK_VISIBILITY.PRIVATE,
    sortKey: 'newest', imageAddOn: '', icon: '', spaceName: '',
  }
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) return { uid, ...snap.data() }
  return { uid, name: '', bio: '', photoURL: '', spaceName: '', spaceTheme: 'gold', spaceIconURL: '' }
}

export async function saveUserProfile(uid, data) {
  const payload = {
    uid, name: String(data.name || '').slice(0, 80),
    bio: String(data.bio || '').slice(0, 500),
    photoURL: data.photoURL || '',
    spaceName: String(data.spaceName || '').slice(0, 80),
    spaceTheme: data.spaceTheme || 'gold',
    spaceIconURL: data.spaceIconURL || '',
    updatedAt: serverTimestamp()
  }
  await setDoc(doc(db, 'users', uid), payload, { merge: true })
  // Public directory document intentionally contains only display information.
  await setDoc(doc(db, 'publicSpaces', uid), payload, { merge: true })
  return payload
}

export async function createWork(uid, data) {
  const payload = {
    ...emptyWork(uid), ...data, ownerUid: uid,
    title: String(data.title || '').slice(0, 200),
    content: String(data.content || '').slice(0, 50000),
    status: data.status || WORK_STATUS.DRAFT,
    visibility: data.visibility || WORK_VISIBILITY.PRIVATE,
    likes: 0, likedBy: [], savedBy: [],
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }
  const snap = await addDoc(collection(db, 'works'), payload)
  return snap.id
}

export async function saveWork(id, uid, data) {
  await updateDoc(doc(db, 'works', id), {
    ...data, ownerUid: uid, updatedAt: serverTimestamp()
  })
}

export async function deleteWork(id) {
  await deleteDoc(doc(db, 'works', id))
}

export async function getWork(id) {
  const snap = await getDoc(doc(db, 'works', id))
  return snap.exists() ? { id: snap.id, ...snap.data(), _source: 'works' } : null
}

export async function getMyWorks(uid, max = 100) {
  const q = query(collection(db, 'works'), where('ownerUid', '==', uid), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'works' }))
}

export async function getPublicWorks(category = '', max = 30) {
  const q = query(
    collection(db, 'works'),
    where('status', '==', WORK_STATUS.PUBLISHED),
    where('visibility', '==', WORK_VISIBILITY.PUBLIC),
    orderBy('createdAt', 'desc'),
    limit(category ? Math.min(max * 3, 150) : max)
  )
  const snap = await getDocs(q)
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'works' }))
  return category ? rows.filter(x => x.category === category).slice(0, max) : rows
}


export async function getPublicWorksByOwner(uid, max = 100) {
  const q = query(
    collection(db, 'works'),
    where('ownerUid', '==', uid),
    where('status', '==', WORK_STATUS.PUBLISHED),
    where('visibility', '==', WORK_VISIBILITY.PUBLIC),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data(), _source: 'works' }))
}

export async function uploadSpaceImage(uid, file, kind = 'profile') {
  if (!file) return null
  const max = 2 * 1024 * 1024
  if (file.size > max) throw new Error('Image is larger than the 2MB limit.')
  const allowed = ['image/jpeg','image/png','image/webp','image/svg+xml']
  if (!allowed.includes(file.type)) throw new Error('Use JPG, PNG, WebP, or SVG.')
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageRef = ref(storage, `spaces/${uid}/${kind}_${Date.now()}_${safe}`)
  const snapshot = await uploadBytes(storageRef, file)
  return { url: await getDownloadURL(snapshot.ref), name: file.name, type: file.type }
}

export async function getPublicSpace(uid) {
  const snap = await getDoc(doc(db, 'publicSpaces', uid))
  return snap.exists() ? snap.data() : null
}

export async function uploadWorkFile(uid, file, kind = 'attachment') {
  if (!file) return null
  const max = kind === 'cover' ? 3 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > max) throw new Error(`File is larger than the ${Math.round(max / 1024 / 1024)}MB limit.`)
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageRef = ref(storage, `user-works/${uid}/${Date.now()}_${safe}`)
  const snapshot = await uploadBytes(storageRef, file)
  return { url: await getDownloadURL(snapshot.ref), name: file.name, type: file.type }
}

export async function toggleLike(work, uid) {
  const r = doc(db, 'works', work.id)
  if (work.likedBy?.includes(uid)) {
    await updateDoc(r, { likes: increment(-1), likedBy: arrayRemove(uid) })
    return false
  }
  await updateDoc(r, { likes: increment(1), likedBy: arrayUnion(uid) })
  return true
}

export async function toggleSave(work, uid) {
  const r = doc(db, 'works', work.id)
  if (work.savedBy?.includes(uid)) {
    await updateDoc(r, { savedBy: arrayRemove(uid) })
    return false
  }
  await updateDoc(r, { savedBy: arrayUnion(uid) })
  return true
}
