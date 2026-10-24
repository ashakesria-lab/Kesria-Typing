# Request for Proposal (RFP)
## Kesria Typing — Typing Practice and Professional Evaluation Platform

**Document status:** Draft — review and complete the placeholders before issuing to vendors  
**RFP owner:** Kesria Typing  
**Issue date:** To be added  
**Questions deadline:** To be added  
**Proposal deadline:** To be added  
**Contact:** To be added  
**Budget:** Vendors to provide a detailed quotation

---

## 1. Purpose

Kesria Typing invites proposals from qualified website development vendors to complete, test, secure, and prepare for launch a typing-practice and typing-evaluation website for office professionals.

The site should help people improve typing speed and accuracy through regular practice, structured lessons, formal evaluations, and measurable progress. The website will be free to users and will not display advertisements.

This RFP describes the intended production scope. A React/Vite prototype and initial requirements/test cases exist and can be shared with the selected vendor.

## 2. Project goals

- Help office professionals improve English typing speed and accuracy.
- Make practice quick to start, including for guests without an account.
- Offer a professional evaluation mode with a clear pass/fail report.
- Let signed-in users securely save and sync progress across devices.
- Encourage participation through optional, privacy-conscious challenges and leaderboards.
- Give authorized administrators tools to manage content, users, reports, and public scores.
- Provide an accessible, responsive experience for desktop, tablet, and mobile.

## 3. Target users and product decisions

| Area | Requirement |
|---|---|
| Primary audience | Office professionals |
| Typing language | English only |
| Interface languages | English and Hindi; English is the default |
| Pricing | Free to users |
| Advertisements | None |
| Guest access | Typing practice must work without registration |
| Account access | Optional Google and email/password sign-in |
| Backend preference | Firebase Authentication and Cloud Firestore, subject to project availability and review |
| Leaderboard privacy | Public participation must be opt-in; never expose a user's email |
| Public launch | Not authorized by this RFP until the owner approves deployment |

## 4. Functional requirements

### 4.0 Website header and navigation

- Show the supplied Kesria Typing logo in the website header and browser icon. Use the supplied image asset, not an unrelated placeholder; preserve its aspect ratio.
- Clicking the logo returns to the home/overview page.
- The header/navigation provides Overview, Practice, Lessons, Leaderboard, and My Progress links, plus an English/Hindi interface switch.
- Show **Sign in** to guests. For signed-in users, show the account/profile control and a secure sign-out action.
- Indicate the current page/section and keep navigation usable on small screens (collapse to a mobile menu where needed).
- The header must not expose admin navigation to users without an authorized admin role.

### 4.1 Practice and typing tests

- Provide English passages for free practice and guided lessons.
- Provide timed practice options of 15 seconds, 30 seconds, 60 seconds, 1 minute, 3 minutes, and 5 minutes. The 60-second and 1-minute choices may be presented as the same duration.
- Show remaining time, WPM, accuracy, and typed-character count while practising.
- Visually distinguish correct and incorrect characters; support Backspace, restart, and a new passage.
- Block paste during a measured typing test so pasted text cannot inflate scores.
- At completion, show WPM, accuracy, character count, personal best, and useful feedback.
- Save guest progress locally in the browser. When a signed-in user has cloud sync enabled, sync their progress securely.

### 4.2 Lesson, passage, and test listings

- Provide beginner-to-advanced lesson paths for office typing, including home row, reach keys, numbers, and punctuation.
- Provide a browsable listing/catalog of all available lessons and passages, with title, skill level, estimated duration, and completion status.
- Let users search lessons/passages by title and filter by level; show a helpful empty state when no items match.
- Provide a separate typing-test listing with the available practice/evaluation durations, a short description, and one-click start.
- Make the evaluation listings visibly distinct from casual practice and show the 50 WPM / 97% passing criteria before starting.
- Allow administrators to create, edit, publish, and remove lessons/passages.
- Published content must be available to learners without exposing administrator controls.

### 4.3 Formal typing evaluation

- Add a separate **Evaluation** mode with user-selectable 1-, 3-, and 5-minute tests.
- Use professional, workplace-relevant English passages.
- Passing standard: **at least 50 WPM and at least 97% accuracy**. Both conditions are required.
- Show an evaluation report with duration, WPM, accuracy, pass/fail result, and next-step guidance.
- Provide a shareable result card and an optional challenge link. Challenge links should contain only the score, accuracy, duration, and evaluation type—not personal information.

### 4.4 Accounts and progress

- Allow optional Google sign-in and email/password **sign-up and sign-in**; guest practice remains available.
- Email sign-up includes name/email/password validation, duplicate-account and invalid-input errors, and an email-verification message.
- Email sign-in includes clear errors for invalid credentials; provide password reset by email and secure sign-out.
- Keep the sign-up/sign-in dialog keyboard accessible, clearly labelled, and usable on mobile.
- Guests must still be able to practise.
- For signed-in users, provide personal history, best speed, average accuracy, practice time, daily goal, and streak.
- Keep private progress accessible only to its owner and authorized administrators.

### 4.5 Leaderboard, challenges, and referrals

- Users must explicitly opt in before a score appears publicly.
- Public entries may include display name, WPM, accuracy, and update date only. Do not publish email addresses or private profile details.
- Users must be able to opt out; opting out removes their public entry.
- A challenge link should let a recipient compare their result against the shared target.
- Provide referral invite links. Referral attribution and any future rewards must be verified by a trusted backend; do not grant rewards based only on client-side data.
- Provide administrator moderation tools for public scores and reported content.

### 4.6 Administrator dashboard

- Restrict access to a server-verified administrator role. Hiding an admin link in the UI alone is not sufficient security.
- Manage lessons and practice passages (create, edit, publish, unpublish, delete).
- Review user profiles and allow authorized account moderation, including pausing/reactivating accounts.
- Review and resolve user reports.
- Review and remove public leaderboard entries.
- Record administrator actions where practical for accountability.
- Provide owner-controlled instructions for assigning/revoking administrator access.

### 4.7 Gemini AI typing coach

- Provide optional, concise coaching feedback on a completed practice/evaluation result.
- Use Firebase AI Logic with the Gemini Developer API and Firebase App Check; never put a standalone Gemini API key in client code.
- Send only necessary metrics (WPM, accuracy, duration, evaluation/pass status). Do not send the user's raw typed passage or keystrokes.
- Give specific, supportive next-step tips in the selected interface language; show loading, quota, network, and setup states.
- Respect provider free-tier limits and add rate/abuse protection. Do not enable a paid billing plan without written owner approval.

## 5. Non-functional requirements

- Responsive, usable layout for desktop, tablet, and mobile.
- Accessibility target: WCAG 2.1 AA, including keyboard navigation, visible focus, accessible labels, sufficient contrast, and screen-reader-friendly status/results.
- Fast initial load; load cloud services only when needed where practical.
- Clear loading, offline, permission, and error states.
- Protect user data with least-privilege Firestore rules and verified authentication.
- Use HTTPS for public deployment and configure authorized authentication domains.
- Do not commit Firebase credentials, private keys, passwords, or service-account files.
- Follow applicable privacy/data protection requirements; provide a privacy notice and account/data deletion process before launch.

## 6. Source code and engineering requirements

- Deliver all editable source code, not only a compiled `dist` folder.
- Use React components for interface sections and keep typing metrics, Firebase access, and UI components separated into maintainable modules.
- Include a documented Node.js version, dependency lockfile, `.env.example`, `npm test`, `npm run build`, and local run instructions.
- Never commit real `.env`, Firebase private keys, service-account credentials, passwords, or OTPs. Validate all client data on the server/database rules as well.
- Keep reusable brand assets (supplied logo and favicon) in the project's public-assets folder and preserve the supplied image rather than replacing it with generated art.
- Follow readable naming, formatting, error handling, and code review practices. Remove unused prototype code before production handover.

## 7. QA plan and required test cases

The vendor must execute, record, and provide evidence for each applicable test. “Pending” external dependencies must not be reported as passed.

| Test ID | Area | Test case | Expected result |
|---|---|---|---|
| QA-01 | Header/brand | Load home, click logo, switch interface language, inspect at desktop/mobile widths. | Supplied logo is visible and undistorted; navigation works; active language changes; no overflow. |
| QA-02 | Guest access | Open the site without an account and start a practice. | Guest can practise and sees a clear optional sign-in path. |
| QA-03 | Sign-up | Create an email account with valid/invalid details. | Validation and helpful errors work; verification email is sent; no password is stored in app data. |
| QA-04 | Sign-in | Sign in with Google and email/password; test wrong password and sign-out. | Correct account is authenticated; invalid login shows an error; sign-out clears the session. |
| QA-05 | Password reset | Request a reset for a registered email. | Firebase sends the reset email and the UI reports success/failure without exposing account secrets. |
| QA-06 | Practice | Type correct and incorrect characters, use Backspace, paste, reset, and change passage. | Live WPM/accuracy/errors update; backspace/reset work; paste cannot inflate a measured score. |
| QA-07 | Timers/results | Exercise all supported durations and allow a timer to expire. | Timer displays correctly; result includes WPM, accuracy, characters, personal best, and feedback. |
| QA-08 | Formal evaluation | Select 1/3/5 minutes; test exact 50 WPM + 97% boundary and scores below each threshold. | Pass only when both thresholds are met; report clearly displays pass/fail and next step. |
| QA-09 | Local/cloud progress | Finish as guest; then sign in and test two devices and offline/reconnect. | Guest history stays local; signed-in data is private and syncs without loss/duplication. |
| QA-10 | Share/challenge | Download/share result card; open a challenge link and submit a result above/below target. | Card is readable; link contains only score settings; challenge comparison is correct. |
| QA-11 | Referral | Open an invite link and sign up through it; attempt self-referral/duplicate referral. | Attribution is recorded once; rewards cannot be fabricated from the browser/client. |
| QA-12 | Leaderboard | Opt in, inspect public data, opt out, and try as a guest. | Only consented display name/score are public; email/private data are absent; opt-out removes entry. |
| QA-13 | Admin | Test normal account, approved admin, lesson CRUD, user moderation, reports, and score moderation. | Only authorized admin can manage records; every change follows the published database rules. |
| QA-14 | Security rules | Attempt unauthenticated and cross-user reads/writes, client admin escalation, and malformed score writes. | Unauthorized operations are denied; rules protect all private records and admin-only actions. |
| QA-15 | Accessibility/compatibility | Keyboard-only navigation, screen reader labels, contrast, Chrome/Edge/mobile browsers. | No critical accessibility failures; controls remain understandable and usable. |
| QA-16 | Listing/search/filter | Search a lesson by title; filter by level; clear filters; select each test card. | Matching items appear, empty state is useful, and choosing a test starts its correct mode/duration. |
| QA-17 | Gemini AI Coach | Request feedback for practice/evaluation; test signed-out, App Check, quota, and network-error states. | Signed-in user gets concise localized advice; only aggregate metrics are sent; errors fail safely. |

The detailed implementation checklist and current pass/pending status are maintained in `TEST-CASES.md`.

## 8. Proposed technical approach

- Frontend: React and Vite.
- Authentication: Firebase Authentication (Google and Email/Password).
- Database: Cloud Firestore with production security rules.
- Hosting: Vendor to propose a suitable static hosting option and explain any cost or billing requirements. Do not enable paid services without written owner approval.
- Testing: automated unit tests, **Playwright CLI** end-to-end browser tests, Firebase security-rule tests (preferably with the Firebase Emulator), and mobile/responsive checks.
- The existing Firebase starter code and rules are a starting point, not a substitute for a vendor security review.

## 9. Deliverables

The selected vendor should provide:

1. Complete React source code and reproducible setup instructions.
2. Firebase Authentication and Firestore integration for the agreed account flows.
3. Reviewed and tested Firestore rules; no open/test-mode database rules.
4. Working cloud progress sync, opt-in leaderboard, challenge links, referral attribution, and protected admin dashboard.
5. Test plan and results, including pass/fail evidence for every acceptance test.
6. Responsive/accessibility review and identified limitations.
7. Production build and deployment runbook. Do not publish publicly until the owner approves.
8. Handover documentation, maintenance recommendations, and itemized ongoing costs.

## 10. Acceptance criteria

The project will be accepted when:

- `npm test` passes and the production build completes successfully.
- Local practice, all test durations, evaluation scoring, result cards, challenge links, and guest progress work as specified.
- Google and email sign-in work on the approved Firebase project; email verification and password reset are verified.
- Cloud progress is private to the user and syncs across two test devices.
- Only opted-in scores are public; opt-out removes the entry; email is never exposed.
- The admin role cannot be self-assigned from the client; admin actions are blocked for ordinary users.
- Admin lesson, user moderation, report resolution, and leaderboard moderation workflows pass tests.
- Security rules reject unauthenticated and cross-user data access.
- Mobile and accessibility checks are completed and documented.
- The owner reviews and approves the final site before public deployment.

Existing functional test cases are in `TEST-CASES.md`; vendors should add cases for any proposed implementation changes.

## 11. Vendor proposal format

Please include:

- Company/team profile and relevant React/Firebase projects.
- Proposed architecture and any recommended changes to the Firebase approach.
- Scope assumptions, exclusions, and dependencies (including the Firebase project quota/configuration).
- Milestones, estimated duration, and acceptance checkpoints.
- Itemized development, hosting, maintenance, and third-party costs.
- Security, privacy, backup, and data-deletion approach.
- Test strategy and post-launch support/warranty terms.
- Examples of deliverables and handover documentation.

## 12. Known dependencies and exclusions

- A Firebase project and its web configuration are not yet available; project quota/approval may be required first.
- The Firebase project owner must enable sign-in providers, publish rules, and assign the first administrator.
- Domain purchase, paid Google Cloud services, and public launch require separate owner approval.
- Referral rewards must not be activated until server-side verification and anti-abuse handling are implemented.
- No vendor should treat the current prototype or local browser preview as a completed production launch.

## 13. Submission details to complete before issuing

- Proposal submission email/portal: **[Add contact]**
- Questions deadline: **[Add date and time zone]**
- Proposal deadline: **[Add date and time zone]**
- Anticipated start date: **[Add date]**
- Budget range: **[Add range or state “vendor to quote”]**
- Issuing contact/organization: **[Add legal name/contact details]**
