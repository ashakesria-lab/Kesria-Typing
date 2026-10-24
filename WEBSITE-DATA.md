# Kesria Typing — Website Data & Handover

**Document date:** 25 October 2026  
**Project status:** React frontend deployed to Firebase Hosting at **https://kesria-typing-927b1.web.app**. Firebase Auth, Firestore, and AI Coach config still need to be set up before online features activate.

## 1. Project overview

Kesria Typing is a free typing-practice and professional typing-evaluation website for office professionals. The intended experience is English typing with an English/Hindi interface, optional accounts, saved progress, shareable results, and an admin area.

### Agreed product decisions

- **Audience:** Office professionals.
- **Brand:** Kesria Typing.
- **Typing passages:** English only.
- **Interface:** English and Hindi; English is the default.
- **Price/ads:** Always free; no advertisements.
- **Practice access:** Guests can practise without signing up.
- **Accounts:** Optional Google or email/password sign-in.
- **Formal evaluation:** User chooses 1, 3, or 5 minutes; pass requires **50 WPM and 97% accuracy** (both).
- **Leaderboard:** Public only after the learner opts in; never show email addresses.
- **Public deployment:** Live on Firebase Hosting at https://kesria-typing-927b1.web.app.

## 2. Features in the React frontend

### Typing and learning

- Free English practice and guided home-row/keyboard lessons.
- Timed practice: 15 seconds, 30 seconds, 60 seconds/1 minute, 3 minutes, and 5 minutes.
- Separate **Evaluation** mode: 1, 3, or 5 minutes, with the 50 WPM + 97% pass standard shown before starting.
- Live timer, WPM, accuracy, character count, correct/incorrect character highlighting, Backspace, reset, and new passages.
- Results include speed, accuracy, character count, and pass/fail guidance for evaluations.
- Lesson listing with title search and level filter; test listing with one-click start.
- Daily goal, streak, and progress are currently stored in the browser.

### Sharing and growth

- Result card can be shared or downloaded as a PNG.
- Share link carries score, accuracy, duration, and evaluation type—no personal information.
- Challenge landing banner lets a friend accept a target and compares WPM and accuracy.
- Invite link has a referral code; the link/code can be captured for signup attribution. Verified reward counting still needs a trusted backend.

### Sign-in, cloud, and administration

- Optional sign-in dialog for Google or email/password, including verification and password-reset flows.
- Firebase service modules and Firestore rules are scaffolded for account auth, cloud progress, opt-in leaderboard, lessons, reports, and admin tools.
- Admin dashboard frontend supports lesson editing, user moderation, report resolution, and public-score removal.
- Admin access is protected by a Firestore `admins/{uid}` record that only the Firebase project owner creates; the website cannot grant itself admin rights.
- **These online features are not active until Firebase is configured.** Without Firebase, practice stays local and sign-in/leaderboard controls show setup-needed states.

### Gemini AI Coach

- Result screen has an AI Coach control backed by Firebase AI Logic/Gemini Developer API.
- The prompt sends only WPM, accuracy, duration, evaluation status, and selected interface language—not the typed passage or raw keystrokes.
- Requires Firebase AI Logic and App Check configuration. No Gemini API key is placed in browser code. Free-tier limits apply; no paid billing is configured.

## 3. Logo files

- **Exact supplied logo photo:** `react-version/public/kesria-typing-logo.jpeg` (also copied to `typing-tutor/kesria-typing-logo.jpeg`).
- **Header/favicon crop from that photo:** `react-version/public/kesria-mark.png` (also copied to `typing-tutor/kesria-mark.png`).
- The full supplied logo is shown in the React home-page artwork; the cropped mark is used in the header/favicon and result card.

## 4. Project structure

| Path | Purpose |
|---|---|
| `index.html` | Simple no-install HTML/CSS/JS version; open directly in a browser. |
| `app.js` | Simple version's practice, timers, results, and local progress. |
| `styles.css` | Shared responsive styling and brand styles. |
| `react-version/src/App.jsx` | React website, practice, evaluation, listings, login UI, sharing, referral invite, AI Coach, admin UI. |
| `react-version/src/firebase.js` | Firebase setup; Firebase chunks are loaded only when configured/needed. |
| `react-version/src/services/` | Firebase auth, progress, leaderboard, lessons, reports, and admin data helpers. |
| `react-version/src/utils/` | WPM/timer calculations, assessment grading, share links, and AI prompt construction. |
| `react-version/firestore.rules` | Firestore privacy and admin security rules. |
| `react-version/public/` | Exact logo assets and `robots.txt`. |
| `RFP.md` | Vendor Request for Proposal, including scope and QA requirements. |
| `TEST-CASES.md` | Requirement-based manual/automated test matrix and pass/pending status. |
| `react-version/FIREBASE-SETUP.md` | Firebase, AI Logic, App Check, and initial admin setup instructions. |

## 5. Run locally

### Simple JavaScript version

Open `typing-tutor/index.html` directly. This does not require Node.js.

### React version

Install Node.js LTS (Node 22 or newer is recommended), then in Command Prompt:

```bash
cd "C:\Users\Admin\Documents\Default Project\typing-tutor\react-version"
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The public website is deployed at https://kesria-typing-927b1.web.app; the local Vite URL is only for development.

## 6. Test commands and current results

From `react-version`:

```bash
npm test
npm run test:e2e
npm run build
npm audit --omit=dev
```

- **13 unit tests:** pass (typing metrics, timer, assessment grading, challenge/referral links, prompt data privacy).
- **10 Playwright CLI browser tests:** pass (logo, language, lesson/test listings, practice/evaluation, challenge, score card, sign-in fallback, AI Coach setup fallback).
- **Production build:** pass. Vite prints a large optional Firebase chunk warning; output is usable.
- **Dependency audit:** 0 production vulnerabilities.
- **Lighthouse local preview:** Accessibility 100, Best Practices 100, SEO 100.
- **Manual browser checks:** timer choices and formatting, correct/incorrect input, Backspace/reset, timed evaluation pass/fail, result persistence, daily goal persistence, share/download result card, challenge flow, lesson search/filter, About Us footer, and exact logo loading.

### Still pending / cannot be marked passed yet

- Firebase web app config (`.env`) and enabling Google/Email auth plus Firestore in the new project.
- Live Google/email authentication, cross-device sync, public leaderboard, Gemini responses, and Firestore security tests against a real project/emulator.
- Real App Check production attestation and verified referral-reward backend.
- Physical mobile-device check and optional custom domain.

## 7. Deployment (Firebase Hosting)

- **Live URL:** https://kesria-typing-927b1.web.app
- **Firebase project:** `kesria-typing-927b1` (Spark/free plan, no billing enabled)
- **Hosting config:** `react-version/firebase.json` publishes the Vite `dist` folder with SPA rewrites and long-term caching for hashed assets.
- **Project link:** `react-version/.firebaserc` sets `kesria-typing-927b1` as the default project.

Redeploy after changes:

```bash
cd "C:\Users\Admin\Documents\Default Project\typing-tutor\react-version"
npm run build
npx firebase-tools deploy --only hosting --project kesria-typing-927b1
```

The deployment command requires the Google account `ashakesria@gmail.com` to be logged in through the Firebase CLI. Do not commit `.env` or any private credentials.

## 8. Firebase setup

Follow `react-version/FIREBASE-SETUP.md` after a Firebase project is available. Copy `.env.example` to `.env`; never share or commit private credentials. Enable Google and Email/Password auth, create Firestore in production mode, publish `firestore.rules`, configure Firebase AI Logic/App Check, and grant the initial admin only from the Firebase Console.

Do not enable paid Google Cloud services without explicit owner approval. Referral rewards must not be issued from unverified client-side counters.
