# Kesria Typing — agreed requirements

## Audience and product
- Audience: office professionals.
- Site and practice are free; no ads.
- English typing passages; interface can switch between English and Hindi, default English.
- Keep practice available without an account.

## Learning and testing
- Timed tests: 15, 30, and 60 seconds; 1, 3, and 5 minutes (60 seconds and 1 minute are the same duration).
- Formal office-typing evaluation: user chooses 1, 3, or 5 minutes; pass requires at least 50 WPM and 97% accuracy.
- Live WPM, accuracy, character count, end-of-test summary, and restart/new passage.
- Browsable lessons/passages listing with search, level filter, duration, and progress status.
- Separate test/evaluation listing with one-click start for each duration.
- Guided lessons, daily goals, practice history, streaks, and progress charts.

## Accounts and community
- Optional Google and email sign-in.
- Cloud-synced progress for signed-in users.
- Public leaderboard is opt-in; users choose whether to share a display name and score.
- Shareable result card and score challenge links; referral invite links.
- Referral reward counts must be verified server-side after Firebase sign-up; local URL codes alone do not grant rewards.
- Optional Gemini AI Coach: explain WPM/accuracy and give short practice tips using score metrics only, never raw typed content.

## Administration
- Admin area to manage passages/lessons, users, reports, and leaderboard entries.
- Admin access must be protected by an explicit server-side role; hiding an admin button is not sufficient security.

## Platform
- React + Vite frontend; Firebase Authentication and Cloud Firestore are the proposed backend.
- Firebase project/config and secure Firestore rules are required before online account, leaderboard, and admin features can work.

## Delivery phases
1. **Frontend built:** Kesria branding, English/Hindi interface, English practice, test durations, login dialog, lessons, local progress, and leaderboard opt-in UI.
2. **Firebase integration scaffolded:** Google/email auth, cloud progress, opt-in leaderboard, reports, protected admin tools, and Firestore security rules are in the React app.
3. **Pending external setup:** An approved Firebase project, its web config, enabled Auth providers, and published Firestore rules are needed before online features can run.
4. **Final verification/deploy:** Install Node.js, run the Vite build, test accounts/security on the real Firebase project, then deploy and connect a domain if desired.
