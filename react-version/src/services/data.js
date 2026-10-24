import { firebaseReady, getFirebaseServices } from '../firebase.js';

async function databaseDependencies() {
  if (!firebaseReady) throw new Error('Firebase database config abhi add nahi hui hai.');
  const services = await getFirebaseServices();
  return { db: services.db, ...services.firestoreSdk };
}

export async function watchUserProgress(uid, onProgress, onError) {
  const { db, doc, onSnapshot } = await databaseDependencies();
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    if (!snapshot.exists()) return onProgress(null);
    const data = snapshot.data();
    onProgress({ progress: data.progress ?? null, suspended: data.suspended === true });
  }, onError);
}

export async function saveUserProgress(uid, progress, displayName = 'Learner', referredBy = '') {
  const { db, doc, serverTimestamp, setDoc } = await databaseDependencies();
  const profile = { progress, displayName: String(displayName).slice(0, 60), updatedAt: serverTimestamp() };
  if (referredBy) profile.referredBy = String(referredBy).slice(0, 32);
  return setDoc(doc(db, 'users', uid), profile, { merge: true });
}

export async function updateLeaderboardEntry(uid, { optedIn, displayName, wpm, accuracy }) {
  const { db, deleteDoc, doc, serverTimestamp, setDoc } = await databaseDependencies();
  const entry = doc(db, 'leaderboard', uid);
  if (!optedIn) return deleteDoc(entry);
  return setDoc(entry, {
    public: true,
    displayName: String(displayName || 'Learner').slice(0, 32),
    wpm: Math.max(0, Math.min(400, Math.round(Number(wpm) || 0))),
    accuracy: Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0))),
    updatedAt: serverTimestamp(),
  });
}

export async function getPublicLeaderboard() {
  const { collection, db, getDocs, limit, orderBy, query, where } = await databaseDependencies();
  const leaderboardQuery = query(collection(db, 'leaderboard'), where('public', '==', true), orderBy('wpm', 'desc'), limit(50));
  const result = await getDocs(leaderboardQuery);
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function userIsAdmin(user) {
  if (!user) return false;
  const { db, doc, getDoc } = await databaseDependencies();
  const role = await getDoc(doc(db, 'admins', user.uid));
  return role.exists() && role.data().active !== false;
}

export async function listAdminUsers() {
  const { collection, db, getDocs, limit, orderBy, query } = await databaseDependencies();
  const result = await getDocs(query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(100)));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function setUserSuspended(uid, suspended) {
  const { db, doc, serverTimestamp, updateDoc } = await databaseDependencies();
  return updateDoc(doc(db, 'users', uid), { suspended: Boolean(suspended), updatedAt: serverTimestamp() });
}

export async function listAdminLessons() {
  const { collection, db, getDocs, limit, orderBy, query } = await databaseDependencies();
  const result = await getDocs(query(collection(db, 'lessons'), orderBy('updatedAt', 'desc'), limit(100)));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function listPublishedLessons() {
  const { collection, db, getDocs, limit, orderBy, query } = await databaseDependencies();
  const result = await getDocs(query(collection(db, 'lessons'), orderBy('updatedAt', 'desc'), limit(20)));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function saveAdminLesson(lesson) {
  const { addDoc, collection, db, doc, serverTimestamp, setDoc } = await databaseDependencies();
  const payload = {
    title: String(lesson.title).slice(0, 100),
    level: String(lesson.level || 'Beginner').slice(0, 30),
    passage: String(lesson.passage).slice(0, 1000),
    durationMinutes: Math.max(1, Math.min(30, Number(lesson.durationMinutes) || 5)),
    updatedAt: serverTimestamp(),
  };
  if (lesson.id) return setDoc(doc(db, 'lessons', lesson.id), payload, { merge: true });
  return addDoc(collection(db, 'lessons'), { ...payload, createdAt: serverTimestamp() });
}

export async function deleteAdminLesson(lessonId) {
  const { db, deleteDoc, doc } = await databaseDependencies();
  return deleteDoc(doc(db, 'lessons', lessonId));
}

export async function listAdminReports() {
  const { collection, db, getDocs, limit, orderBy, query } = await databaseDependencies();
  const result = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(100)));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function submitUserReport(uid, category, message) {
  const { addDoc, collection, db, serverTimestamp } = await databaseDependencies();
  return addDoc(collection(db, 'reports'), {
    userId: uid,
    category: String(category || 'General').slice(0, 40),
    message: String(message).slice(0, 1000),
    createdAt: serverTimestamp(),
  });
}

export async function resolveUserReport(reportId) {
  const { db, doc, serverTimestamp, updateDoc } = await databaseDependencies();
  return updateDoc(doc(db, 'reports', reportId), { status: 'resolved', resolvedAt: serverTimestamp() });
}
