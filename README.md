# Kesria Typing — simple aur React versions

Project scope/RFP: `RFP.md`.

## Live website — Firebase Hosting

- Live URL: **https://kesria-typing-927b1.web.app**
- Firebase project: `kesria-typing-927b1` (Spark/free plan; no billing configured)
- Console: https://console.firebase.google.com/project/kesria-typing-927b1/overview

Update the live site after code changes:

```bash
cd "C:\Users\Admin\Documents\Default Project\typing-tutor\react-version"
npm run build
npx firebase-tools deploy --only hosting --project kesria-typing-927b1
```

Login, cloud sync, leaderboard aur AI Coach tab tak disabled rahenge jab tak `.env` mein Firebase web config, Auth/Firestore providers aur App Check set nahi hote. Uske baad dobara build + deploy karein.

## Simple JavaScript version

1. `typing-tutor` folder kholiye.
2. `index.html` par double-click kijiye.

Files: `index.html`, `styles.css`, `app.js`. Is version ko chalane ke liye Node.js ki zaroorat nahi.

## React version

React app `react-version` folder mein hai. Ise chalane ke liye Node.js LTS install karein, phir Command Prompt mein:

```bash
cd "C:\Users\Admin\Documents\Default Project\typing-tutor\react-version"
npm install
npm run dev
```

Browser mein terminal ke local link ko kholiye (aksar `http://localhost:5173`). React code `react-version/src/App.jsx` mein hai. Dono apps `styles.css` share karte hain. React version Firebase service modules aur secure starter `firestore.rules` bhi rakhta hai.

## Agle online features

React frontend mein English/Hindi interface switch, English typing, timed tests, formal evaluation (50 WPM + 97% accuracy to pass), Gemini AI Coach UI, shareable PNG result cards, friend-challenge links, referral invite links, aur lesson/test listings hain. Optional login, cloud progress, opt-in leaderboard, aur protected admin dashboard bhi included hain. Firebase AI Logic, App Check, project config aur sign-in ke bina AI Coach, referral rewards, cloud sync, aur leaderboard counting activate nahi honge. Setup ke exact steps `react-version/FIREBASE-SETUP.md` mein hain. Admin role sirf Firebase Console se owner grant kare—website khud admin access nahi de sakti.

Logo assets: `react-version/public/kesria-typing-logo.jpeg` is the exact provided photo. `kesria-mark.png` is a crop from that same logo for the small header/favicon mark.

Test cases `TEST-CASES.md` mein hain. React folder mein unit tests ke liye `npm test`; Playwright CLI browser tests ke liye `npm run test:e2e` chalaiye. E2E tests ke liye Chrome installed hona chahiye (warna `npx playwright install chromium`).
