# Firebase setup for Kesria Typing

This setup is needed for Google/email login, cloud progress, public scores, the admin dashboard, and Gemini AI Coach. Local typing practice works without it.

## After Google approves the project quota request

1. Create the Firebase project `Kesria Typing` and register a **Web app** (`</>`).
2. In **Authentication → Sign-in method**, enable **Google** and **Email/Password**.
3. In **Firestore Database**, create the database. Start in production mode; do not use open/test rules.
4. Copy the web app config into a new file named `.env` in `react-version`, using `.env.example` as the template. Do not send passwords, service-account keys, or OTPs in chat.
5. Publish the rules from `firestore.rules` in **Firestore → Rules**.
6. In Firebase Console, open **AI Services → AI Logic → Get started** and choose **Gemini Developer API**. Review its current free-tier quota; do not enable paid billing without owner approval.
7. Set `VITE_FIREBASE_APP_CHECK_SITE_KEY` in `.env`. For local debugging, enable the App Check debug provider only in your local environment and register its debug token in Firebase Console. Never ship a debug token.
8. Optionally set `VITE_GEMINI_MODEL` (default is `gemini-3.8-flash`). No separate Gemini API key is placed in frontend code.
9. Run `npm install` and `npm run dev` in the `react-version` folder.

## Give the owner admin access

1. Sign in to Kesria Typing once.
2. In Firebase **Authentication → Users**, copy that account's UID.
3. In Firestore, create a document in the `admins` collection with the document ID set to that UID and field `active` set to boolean `true`.

Only the Firebase project owner can create/change `admins` documents in the console; the website itself cannot grant admin access. The admin dashboard can then manage lesson content, review user profiles/reports, pause user accounts, and moderate scores.

Firebase has free quotas, but quotas and product pricing can change. This project starts with free services and does not configure billing. Check Firebase pricing before enabling any paid product.

The AI Coach sends only WPM, accuracy, duration, evaluation status, and interface language. It does not send the learner's typed passage or raw keystrokes. Gemini feedback remains unavailable until AI Logic and App Check are configured.
