# Kesria Typing — requirements test cases

**Scope:** React app (`react-version`). Public deployment is intentionally postponed. Run the local app with `npm run dev` before manual tests.

| ID | Requirement / scenario | Steps | Expected result | Status |
|---|---|---|---|---|
| TC-01 | App starts locally | Run `npm run dev`; open the Vite URL. | Kesria Typing dashboard loads with no browser console errors. | Pass — local preview |
| TC-02 | Default interface language | Load the app in a fresh browser session. | Navigation and dashboard begin in English. | Pass — local preview |
| TC-03 | Hindi interface switch | Click the language button once, then again. | Main navigation, dashboard, practice controls, and lesson labels switch to Hindi, then back to English. | Pass — local preview |
| TC-04 | English-only typing passages | Start free practice and inspect the prompt. | Practice prompt is English; interface language does not change the typing prompt. | Pass — code/UI check |
| TC-05 | Test duration choices | Open the duration selector. | Options include 15 sec, 30 sec, 60 sec/1 min, 3 min, and 5 min. | Pass — local preview |
| TC-06 | Timer formatting | Select 15 sec, 1 min, 3 min, and 5 min. | Timer displays `00:15`, `01:00`, `03:00`, and `05:00`. | Pass — browser duration selection + unit tests |
| TC-07 | Correct/incorrect character feedback | Type characters matching and not matching the prompt. | Correct and incorrect characters receive different styling; accuracy updates. | Pass — browser check (4 correct, 1 incorrect, 80%) |
| TC-08 | Backspace and restart | Type a few letters, press Backspace, then Escape or Reset. | Backspace corrects input; reset clears typed text and restores the selected timer. | Pass — Backspace, Escape, and reset timer verified |
| TC-09 | Test completion and results | Type the full prompt or finish a timed run. | Result shows WPM, accuracy, character count, best speed; session is saved locally. | Pass — full-passage result, 15-sec expiry, and session persistence verified |
| TC-10 | Daily goal and local history | Change the goal, complete practice, and reload. | Goal and completed sessions remain saved in this browser. | Pass — goal and session persistence verified after reload |
| TC-11 | Google/email sign-in | Configure Firebase; use Google, email sign-up, sign-in, and password reset. | Successful auth works; email sign-up sends verification; failures show a useful message. | Pending Firebase config |
| TC-11a | Missing Firebase config fallback | Open Sign in with no Firebase config. | Helpful setup message appears; auth buttons stay disabled while local practice remains available. | Pass — local preview |
| TC-12 | Cloud progress sync | Sign in on two devices and finish a session on one. | Progress appears on the other device; guest progress stays local. | Pending Firebase config |
| TC-13 | Leaderboard consent/privacy | Sign in, opt in, then opt out. | Only opted-in display name/WPM/accuracy are public; email is never shown; opt-out removes the score. | Pending Firebase config/rules |
| TC-13a | Leaderboard fallback without Firebase | Open the leaderboard before Firebase setup. | Opt-in is disabled and the page explains that Firebase is needed; no score is published. | Pass — local preview |
| TC-14 | Admin authorization | Sign in as a normal user and as a UID listed in Firestore `admins`. | Normal user cannot see/use admin tools; approved admin can. | Pending Firebase config/rules |
| TC-14a | Guest admin visibility | Open the app without signing in. | Admin dashboard/navigation is hidden. | Pass — local preview |
| TC-15 | Admin content/users/reports | As admin, add/edit/delete a lesson, pause/reactivate a user, and resolve a report. | Changes save in Firestore and appear for learners/admins as appropriate. | Pending Firebase config/rules |
| TC-16 | Firestore access control | Try unauthenticated writes, another user's profile, and self-assigning admin. | Rules reject unauthorized access and prevent client-side admin assignment. | Pending Firebase Emulator/project |
| TC-17 | Mobile layout | Open at phone width and use navigation, practice, login, and leaderboard. | No horizontal overflow; controls remain usable. | Manual device test |
| TC-18 | Production build and dependency check | Run `npm test`, `npm run build`, and `npm audit`. | Tests/build pass; no known dependency vulnerabilities. | Pass — local build/audit |
| TC-19 | Public hosting | Deploy `dist` only after approval and configure the domain. | Public URL loads securely; auth authorized domains are configured. | Intentionally postponed |
| TC-20 | Lighthouse quality audit | Run Lighthouse against local React preview. | Accessibility, Best Practices, and SEO scores are 100. | Pass — Accessibility 100, Best Practices 100, SEO 100 |
| TC-21 | Formal evaluation duration | Select Evaluation mode and inspect duration choices. | User can choose 1, 3, or 5 minutes; assessment uses a long professional passage. | Pass — UI options and timer verified |
| TC-22 | Evaluation pass/fail benchmark | Check scores at the 50 WPM / 97% boundary. | Pass only if both WPM ≥ 50 and accuracy ≥ 97%; otherwise show retry guidance. | Pass — unit boundary tests plus browser fail/pass checks |
| TC-23 | Evaluation result report | Complete an evaluation above and below the passing target. | Result shows pass/fail, WPM, accuracy, and a retry suggestion when not passed. | Pass — both result paths checked |
| TC-24 | Shareable score/challenge link | Share a completed result. Open the generated link in a fresh session. | Link contains score/accuracy/duration; visitor sees the challenge and can try to beat it. | Pass — challenge URL, accept flow, pass/fail, and PNG card download checked |
| TC-25 | Referral invite link | Generate and open an invite URL with a referral code. | Link preserves its referral code; code is recorded for signup attribution without exposing email. | Pass — URL tests and referral capture checked; reward counting pending Firebase |
| TC-26 | Brand logo | Open the React app. | The exact supplied logo appears in the dashboard; the header mark/favicon are cropped from the same image. | Pass — local preview |
| TC-27 | Listings, search, and filters | Search a lesson, filter by level, clear the search, then launch a test card. | Matching lessons filter correctly, empty state appears when needed, and selected test starts with its configured mode/time. | Pass — local browser check |
| TC-28 | Footer About Us and copyright | Open the footer and follow the About Us link. | Link opens the About section; copyright shows the current year and brand name. | Pass — local preview |
| TC-29 | Gemini AI Coach | Request feedback after a result, inspect the sanitized request, test unavailable/quota states. | Signed-in user gets concise feedback in chosen language; request contains metrics only, never raw keystrokes/text. | UI fallback pass; Gemini response pending Firebase AI Logic/App Check setup |
| TC-30 | Playwright CLI end-to-end suite | Run `npm run test:e2e` against the local Vite server. | Browser suite passes for header/logo, language switch, listings, evaluation, challenge, score card, and disabled backend fallback. | Pass — 10 Playwright tests |
| TC-31 | Public Firebase Hosting deployment | Open https://kesria-typing-927b1.web.app in a browser and verify page load, logo, listings, and footer. | Site loads over HTTPS from Firebase Hosting; branding, logo, practice UI, listings, and footer render correctly. | Pass — deployed and verified live |
| TC-32 | GitHub source and Pages deployment | Open https://github.com/ashakesria-lab/Kesria-Typing and https://ashakesria-lab.github.io/Kesria-Typing/ | Source is public on `main`; Pages site loads CSS, JS, logo, lessons, tests, and footer over HTTPS with the correct `/Kesria-Typing/` base path. | Pass — repo 38 source files, Pages 12 built files, verified live |

## Automated unit tests

`src/utils/typingMetrics.test.js` covers WPM/accuracy math and timer formatting. Run with:

```bash
npm test
```

Firebase cases stay pending until the project quota/config is available. Do not mark them passed based on the local UI alone.
