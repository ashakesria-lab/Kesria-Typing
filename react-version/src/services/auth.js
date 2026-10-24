import { firebaseReady, getFirebaseServices } from '../firebase.js';

async function getAuthDependencies() {
  if (!firebaseReady) {
    throw new Error('Firebase setup abhi complete nahi hai. Project config add karne ke baad sign-in chalu hoga.');
  }
  const services = await getFirebaseServices();
  return { auth: services.auth, provider: services.googleProvider, ...services.authSdk };
}

export async function signInWithGoogle() {
  const { auth, provider, signInWithPopup } = await getAuthDependencies();
  return signInWithPopup(auth, provider);
}

export async function signInWithEmail(email, password) {
  const { auth, signInWithEmailAndPassword } = await getAuthDependencies();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function createEmailAccount(email, password, displayName) {
  const { auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await getAuthDependencies();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) await updateProfile(credential.user, { displayName: displayName.trim() });
  await sendEmailVerification(credential.user);
  return credential;
}

export async function sendPasswordReset(email) {
  const { auth, sendPasswordResetEmail } = await getAuthDependencies();
  return sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser() {
  const { auth, signOut } = await getAuthDependencies();
  return signOut(auth);
}
