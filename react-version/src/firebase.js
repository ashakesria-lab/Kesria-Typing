const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;

export const firebaseReady = Object.values(config).every(Boolean);
export const firebaseAIReady = firebaseReady && Boolean(appCheckSiteKey);
let servicesPromise;

// Load Firebase only when a user signs in or requests cloud data. Local practice
// stays lightweight while the Firebase project/config is not set up.
export function getFirebaseServices() {
  if (!firebaseReady) return Promise.reject(new Error('Firebase configuration is missing.'));
  servicesPromise ||= Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]).then(async ([appSdk, authSdk, firestoreSdk]) => {
    const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(config);
    if (appCheckSiteKey) {
      const appCheckSdk = await import('firebase/app-check');
      if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG === 'true') {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      appCheckSdk.initializeAppCheck(app, {
        provider: new appCheckSdk.ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
    return {
      app,
      auth: authSdk.getAuth(app),
      googleProvider: new authSdk.GoogleAuthProvider(),
      db: firestoreSdk.getFirestore(app),
      authSdk,
      firestoreSdk,
    };
  });
  return servicesPromise;
}
