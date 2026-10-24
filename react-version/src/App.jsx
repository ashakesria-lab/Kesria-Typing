import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { firebaseAIReady, firebaseReady, getFirebaseServices } from './firebase.js';
import { createEmailAccount, sendPasswordReset, signInWithEmail, signInWithGoogle, signOutUser } from './services/auth.js';
import { deleteAdminLesson, getPublicLeaderboard, listAdminLessons, listAdminReports, listAdminUsers, listPublishedLessons, resolveUserReport, saveAdminLesson, saveUserProgress, setUserSuspended, submitUserReport, updateLeaderboardEntry, userIsAdmin, watchUserProgress } from './services/data.js';
import { formatClock, getTypingMetrics, gradeTypingAssessment } from './utils/typingMetrics.js';
import { buildChallengeUrl, buildInviteUrl, createReferralCode } from './utils/shareLinks.js';
import { requestTypingCoachFeedback } from './services/typingCoach.js';

const KEY = 'kesria-typing-progress-v1';
const COPY = {
  en: {
    space: 'YOUR SPACE', overview: 'Overview', practice: 'Practice', lessons: 'Lessons', tests: 'Tests', progress: 'My progress', daily: 'YOUR DAILY PRACTICE',
    hero1: 'A little practice.', hero2: 'A lot more confidence.', heroText: 'Build your speed one keystroke at a time.', best: 'BEST SPEED', avgAccuracy: 'AVG. ACCURACY', practiceTime: 'PRACTICE TIME', streak: 'DAY STREAK',
    ready: 'READY WHEN YOU ARE', flow: "Let's get in the flow", newText: 'New text', freePractice: 'Free practice', guided: 'Guided lesson', timeLeft: 'TIME LEFT', liveSpeed: 'LIVE SPEED', accuracy: 'ACCURACY', characters: 'CHARACTERS',
    hint: 'Click here or start typing to begin', correction: 'Backspace to correct', homeRow: 'HOME ROW', rest: 'Rest your fingers here', goal: 'DAILY GOAL', doingGreat: "You're doing great.", editGoal: 'Edit goal', quickTip: 'A QUICK TIP', accuracyFirst: 'Accuracy first.', speedFollow: 'Speed will follow.',
    learningPath: 'YOUR LEARNING PATH', progressTitle: 'Little lessons, big progress', viewAll: 'View all', startTyping: 'Start typing', statusReady: 'Ready when you are', statusFlow: "You're in the flow", aim: 'Aim for 95% or more',
    personalBest: 'Your personal best', everyMinute: 'Every minute adds up', showUp: 'Show up, grow stronger', min: 'min', days: 'days', roll: "You're on a roll!", keepStreak: 'Keep the streak alive', smallSteps: 'Small steps.', bigSpeed: 'Big speed.', tenMinutes: 'Just 10 minutes a day can make all the difference.',
    language: 'Language', testDuration: 'Test duration', english: 'English', englishPractice: 'English practice', hindi: 'हिन्दी', lesson1: 'Meet the home row', lesson2: 'Reach for new keys', lesson3: 'Numbers & punctuation', beginner: 'Beginner', startLearning: 'Start learning',
    signIn: 'Sign in', createAccount: 'Create account', email: 'Email address', password: 'Password', fullName: 'Your name', googleLogin: 'Continue with Google',
    leaderboard: 'Leaderboard', optIn: 'Share my score publicly', emptyBoard: 'No scores loaded yet. Check the leaderboard for public scores.',
    customLessonPractice: 'Follow this lesson passage carefully.',
    testLibrary: 'Typing tests', testLibraryText: 'Choose a quick practice or a formal evaluation.', testWarmup: 'Speed warm-up', testWarmupText: 'A quick 15-second finger warm-up.', testQuick: 'Focused practice', testQuickText: 'Build a steady rhythm in 30 seconds.', testMinute: 'One-minute sprint', testMinuteText: 'Check your pace over a full minute.', testProfessional: 'Professional evaluation', testProfessionalText: 'Three-minute assessment; pass at 50 WPM and 97% accuracy.', testEndurance: 'Endurance evaluation', testEnduranceText: 'Five-minute assessment for sustained accuracy.', startTest: 'Start test', searchLessons: 'Search lessons', allLevels: 'All levels', noLessons: 'No lessons match these filters.',
    aboutTitle: 'About Kesria Typing', aboutCopy: 'Kesria Typing is a free English typing-practice and evaluation platform for office professionals. Practise at your own pace, build accuracy, and track your progress—without ads.',
    aiCoach: 'AI typing coach', askGemini: 'Get Gemini feedback', coachSetup: 'Gemini AI Coach will activate after Firebase AI Logic and App Check are configured.', coachSignIn: 'Sign in to use the AI Coach.', coachPrivacy: 'Only WPM, accuracy, duration, and evaluation status are sent; typed text and keystrokes are not shared.',
    evaluation: 'Evaluation', benchmark: 'Pass standard: 50 WPM and 97% accuracy.', evalPassed: 'Evaluation passed', evalRetry: 'Not passed yet', evalPassedText: 'You met both the speed and accuracy targets.', evalRetryText: 'Practise a little more, then try the evaluation again.',
    challenge: 'Typing challenge', beatFriend: 'Can you beat your friend’s', challengeTarget: 'Beat {wpm} WPM with at least {accuracy}% accuracy.', acceptChallenge: 'Accept challenge', shareScore: 'Share result', challengeFriend: 'Challenge a friend', inviteFriends: 'Invite a friend', inviteHelp: 'Share your invite link. Referral rewards will activate after Firebase setup.', challengeBeaten: 'You beat the challenge!', challengeNotBeaten: 'Try again to beat the challenge.',
    firebasePending: 'Practice works now. Online sign-in and cloud sync will activate after Firebase setup.', forgotPassword: 'Forgot password?', noAccount: 'New here? Create an account', hasAccount: 'Already have an account? Sign in',
  },
  hi: {
    space: 'आपकी जगह', overview: 'मुख्य पृष्ठ', practice: 'अभ्यास', lessons: 'पाठ', tests: 'टेस्ट', progress: 'मेरी प्रगति', daily: 'आज का अभ्यास',
    hero1: 'थोड़ा अभ्यास।', hero2: 'ज़्यादा आत्मविश्वास।', heroText: 'हर दिन अभ्यास करके अपनी टाइपिंग गति बढ़ाएँ।', best: 'सबसे तेज़ गति', avgAccuracy: 'औसत सटीकता', practiceTime: 'अभ्यास का समय', streak: 'लगातार दिन',
    ready: 'जब आप तैयार हों', flow: 'अभ्यास शुरू करें', newText: 'नया पाठ', freePractice: 'खुला अभ्यास', guided: 'निर्देशित पाठ', timeLeft: 'बचा समय', liveSpeed: 'अभी की गति', accuracy: 'सटीकता', characters: 'अक्षर',
    hint: 'यहाँ क्लिक करें या टाइप करना शुरू करें', correction: 'गलती सुधारने के लिए Backspace', homeRow: 'होम रो', rest: 'उंगलियाँ यहाँ रखें', goal: 'आज का लक्ष्य', doingGreat: 'आप अच्छा कर रहे हैं।', editGoal: 'लक्ष्य बदलें', quickTip: 'छोटी सी सलाह', accuracyFirst: 'पहले सटीकता।', speedFollow: 'गति अपने आप बढ़ेगी।',
    learningPath: 'सीखने का आपका रास्ता', progressTitle: 'छोटे पाठ, बड़ी प्रगति', viewAll: 'सभी देखें', startTyping: 'टाइप शुरू करें', statusReady: 'जब आप तैयार हों', statusFlow: 'अभ्यास जारी है', aim: '95% या अधिक का लक्ष्य रखें',
    personalBest: 'आपकी अब तक की सबसे अच्छी गति', everyMinute: 'हर मिनट मायने रखता है', showUp: 'रोज़ अभ्यास, बेहतर गति', min: 'मिनट', days: 'दिन', roll: 'आप लगातार आगे बढ़ रहे हैं!', keepStreak: 'अपना अभ्यास जारी रखें', smallSteps: 'छोटे कदम।', bigSpeed: 'बेहतर गति।', tenMinutes: 'रोज़ 10 मिनट का अभ्यास बड़ा बदलाव ला सकता है।',
    language: 'भाषा', testDuration: 'टेस्ट का समय', english: 'English', englishPractice: 'English अभ्यास', hindi: 'हिन्दी', lesson1: 'होम रो से शुरुआत', lesson2: 'नई keys तक पहुँचें', lesson3: 'नंबर और विराम चिह्न', beginner: 'शुरुआती', startLearning: 'सीखना शुरू करें',
    signIn: 'लॉग इन', createAccount: 'खाता बनाएँ', email: 'ईमेल पता', password: 'पासवर्ड', fullName: 'आपका नाम', googleLogin: 'Google से जारी रखें',
    leaderboard: 'लीडरबोर्ड', optIn: 'मेरा स्कोर सार्वजनिक दिखाएँ', emptyBoard: 'अभी कोई स्कोर नहीं दिख रहा। सार्वजनिक स्कोर देखने के लिए लीडरबोर्ड खोलें।',
    customLessonPractice: 'इस पाठ को ध्यान से टाइप करें।',
    testLibrary: 'टाइपिंग टेस्ट', testLibraryText: 'छोटा अभ्यास या औपचारिक मूल्यांकन चुनें।', testWarmup: 'गति वार्म-अप', testWarmupText: 'उंगलियों के लिए 15 सेकंड का अभ्यास।', testQuick: 'ध्यान से अभ्यास', testQuickText: '30 सेकंड में अपनी टाइपिंग लय बनाएँ।', testMinute: 'एक मिनट की स्प्रिंट', testMinuteText: 'पूरे एक मिनट में अपनी गति जाँचें।', testProfessional: 'प्रोफेशनल मूल्यांकन', testProfessionalText: '3 मिनट का टेस्ट; पास के लिए 50 WPM और 97% सटीकता।', testEndurance: 'लंबा मूल्यांकन', testEnduranceText: 'लगातार सटीकता के लिए 5 मिनट का टेस्ट।', startTest: 'टेस्ट शुरू करें', searchLessons: 'पाठ खोजें', allLevels: 'सभी स्तर', noLessons: 'इन फ़िल्टर से कोई पाठ नहीं मिला।',
    aboutTitle: 'Kesria Typing के बारे में', aboutCopy: 'Kesria Typing office professionals के लिए एक निःशुल्क English typing अभ्यास और मूल्यांकन platform है। अपनी गति से अभ्यास करें, सटीकता बढ़ाएँ और बिना विज्ञापनों के अपनी प्रगति देखें।',
    aiCoach: 'AI टाइपिंग कोच', askGemini: 'Gemini से सलाह लें', coachSetup: 'Firebase AI Logic और App Check सेट होने के बाद Gemini AI Coach चालू होगा।', coachSignIn: 'AI Coach के लिए पहले लॉग इन करें।', coachPrivacy: 'सिर्फ WPM, सटीकता, समय और मूल्यांकन परिणाम भेजे जाते हैं; आपका टाइप किया हुआ पाठ नहीं।',
    evaluation: 'मूल्यांकन', benchmark: 'पास मानक: 50 WPM और 97% सटीकता।', evalPassed: 'मूल्यांकन पास', evalRetry: 'अभी पास नहीं हुए', evalPassedText: 'आपने गति और सटीकता—दोनों लक्ष्य पूरे किए।', evalRetryText: 'थोड़ा और अभ्यास करें, फिर दोबारा कोशिश करें।',
    challenge: 'टाइपिंग चुनौती', beatFriend: 'क्या आप अपने दोस्त की गति से आगे निकल सकते हैं?', challengeTarget: '{wpm} WPM से तेज़ और कम से कम {accuracy}% सटीकता हासिल करें।', acceptChallenge: 'चुनौती स्वीकार करें', shareScore: 'परिणाम साझा करें', challengeFriend: 'दोस्त को चुनौती दें', inviteFriends: 'दोस्त को आमंत्रित करें', inviteHelp: 'अपना invite link साझा करें। Referral rewards Firebase setup के बाद शुरू होंगे।', challengeBeaten: 'आपने चुनौती जीत ली!', challengeNotBeaten: 'चुनौती जीतने के लिए फिर कोशिश करें।',
    firebasePending: 'अभी अभ्यास चल रहा है। Firebase सेटअप के बाद ऑनलाइन लॉग इन और प्रगति sync होगी।', forgotPassword: 'पासवर्ड भूल गए?', noAccount: 'नए हैं? खाता बनाएँ', hasAccount: 'पहले से खाता है? लॉग इन करें',
  },
};
const TEXTS = {
  en: [
    'Small steps every day can take you to places you once only dreamed about. Keep your hands relaxed, trust your practice, and let every keystroke bring you a little closer to your goal.',
    'A calm mind and steady fingers make a wonderful team. Focus on each letter as it comes, breathe gently, and remember that getting it right matters more than getting there fast.',
    'The best way to get better at anything is to show up and try again. Progress is not always loud or quick, but every minute you spend practising is a minute well invested.',
    'Find a comfortable rhythm and let your fingers move with confidence. You do not have to be perfect today. Just keep learning, keep smiling, and enjoy how far you have come.',
  ],
  hi: [
    'रोज़ थोड़ा अभ्यास करने से बड़े बदलाव आते हैं। अपनी उंगलियों को आराम दें, हर अक्षर पर ध्यान दें और धीरे धीरे अपनी गति को बेहतर बनाएं।',
    'सफलता के लिए लगातार कोशिश करना ज़रूरी है। हर दिन कुछ नया सीखें, गलतियों से घबराएं नहीं और अपने लक्ष्य की ओर आगे बढ़ते रहें।',
    'अच्छी आदतें छोटे कदमों से शुरू होती हैं। थोड़ा समय निकालें, मन लगाकर अभ्यास करें और अपनी प्रगति पर गर्व महसूस करें।',
  ],
  lessons: [
    'asdf jkl; asdf jkl; fad sad lad ask all fall flask',
    'sad lad asks; a glad lass adds a salad; dad has a flag',
    'a fast draft; a tall glass; ask dad; add a small salad',
  ],
};
const ASSESSMENT_PARAGRAPHS = [
  'Clear communication is an important part of every professional role. Teams rely on accurate notes, concise emails, and well prepared reports to make decisions and keep projects moving. Before sending a message, take a moment to check names, dates, figures, and punctuation. Small details help colleagues understand your work and trust the information you share.',
  'A productive workday often begins with a simple plan. Identify the most important task, set aside focused time, and keep reference material close at hand. When priorities change, update the team early and record the next action. Consistent habits reduce avoidable delays and make collaboration easier, especially when people work across different schedules.',
  'Customer service depends on listening carefully and responding with useful information. Confirm what the customer needs, explain the next step in plain language, and avoid making promises you cannot keep. If a problem needs more time, share a realistic update. A thoughtful response can turn a difficult moment into a positive working relationship.',
  'Good data handling protects both an organization and its customers. Use approved tools, share documents only with people who need access, and never include passwords in ordinary messages. When a file contains private information, follow the company retention and access rules. If something looks unusual, report it through the proper support channel.',
];
const TEST_LIBRARY = [
  { id: 'warmup', duration: 15, mode: 'practice', titleKey: 'testWarmup', descriptionKey: 'testWarmupText', tag: '15 SEC' },
  { id: 'quick', duration: 30, mode: 'practice', titleKey: 'testQuick', descriptionKey: 'testQuickText', tag: '30 SEC' },
  { id: 'minute', duration: 60, mode: 'practice', titleKey: 'testMinute', descriptionKey: 'testMinuteText', tag: '1 MIN' },
  { id: 'professional', duration: 180, mode: 'evaluation', titleKey: 'testProfessional', descriptionKey: 'testProfessionalText', tag: '3 MIN' },
  { id: 'endurance', duration: 300, mode: 'evaluation', titleKey: 'testEndurance', descriptionKey: 'testEnduranceText', tag: '5 MIN' },
];

function makeAssessmentPassage() {
  let passage = '';
  while (passage.length < 3800) {
    passage += `${ASSESSMENT_PARAGRAPHS[Math.floor(Math.random() * ASSESSMENT_PARAGRAPHS.length)]} `;
  }
  return passage.trim();
}

function todayKey(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function readProgress() {
  try {
    return { sessions: [], goal: 10, streak: 0, lastPractice: '', ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { sessions: [], goal: 10, streak: 0, lastPractice: '' };
  }
}

function readChallengeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const wpm = Number(params.get('challengeWpm'));
  if (!Number.isFinite(wpm) || wpm <= 0) return null;
  return {
    wpm: Math.round(wpm),
    accuracy: Math.max(0, Math.min(100, Number(params.get('challengeAccuracy')) || 0)),
    duration: Number(params.get('challengeDuration')) || 60,
    assessment: params.get('challengeType') === 'evaluation',
  };
}

function getOrCreateReferralCode() {
  try {
    const existing = localStorage.getItem('kesria-referral-code');
    if (existing) return existing;
    const code = createReferralCode();
    localStorage.setItem('kesria-referral-code', code);
    return code;
  } catch {
    return createReferralCode();
  }
}

function getReferralSource() {
  try {
    const fromLink = new URLSearchParams(window.location.search).get('ref');
    if (fromLink && /^[A-Z0-9-]{5,32}$/i.test(fromLink)) {
      localStorage.setItem('kesria-pending-referral', fromLink);
      return fromLink;
    }
    return localStorage.getItem('kesria-pending-referral') || '';
  } catch {
    return '';
  }
}

export default function App() {
  const [progress, setProgress] = useState(readProgress);
  const [challenge, setChallenge] = useState(readChallengeFromUrl);
  const [referralCode] = useState(getOrCreateReferralCode);
  const [referralSource] = useState(getReferralSource);
  const [user, setUser] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(() => localStorage.getItem('kesria-leaderboard-opt-in') === 'true');
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [adminAccess, setAdminAccess] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLessons, setAdminLessons] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [adminScores, setAdminScores] = useState([]);
  const [lessonDraft, setLessonDraft] = useState({ title: '', level: 'Beginner', passage: '', durationMinutes: 5 });
  const [adminBusy, setAdminBusy] = useState(false);
  const [interfaceLanguage, setInterfaceLanguage] = useState('en');
  const [language, setLanguage] = useState('en');
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState('practice');
  const [lesson, setLesson] = useState(0);
  const [customLessonTitle, setCustomLessonTitle] = useState('');
  const [publishedLessons, setPublishedLessons] = useState([]);
  const [lessonQuery, setLessonQuery] = useState('');
  const [lessonLevel, setLessonLevel] = useState('all');
  const [passage, setPassage] = useState(TEXTS.en[0]);
  const [typed, setTyped] = useState('');
  const [remaining, setRemaining] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [coachFeedback, setCoachFeedback] = useState('');
  const [coachBusy, setCoachBusy] = useState(false);
  const [coachError, setCoachError] = useState('');
  const [sound, setSound] = useState(false);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  const startRef = useRef(0);
  const typedRef = useRef('');
  const passageRef = useRef(passage);
  const finishRef = useRef(null);
  const doneRef = useRef(false);
  const toastTimer = useRef(null);
  const audio = useRef(null);
  const t = (key) => COPY[interfaceLanguage][key] || key;

  passageRef.current = passage;
  typedRef.current = typed;
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* Storage is optional. */ }
  }, [progress]);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    let active = true;
    let unsubscribe;
    getFirebaseServices().then(({ auth, authSdk }) => {
      if (!active) return;
      unsubscribe = authSdk.onAuthStateChanged(auth, (signedInUser) => {
        setUser(signedInUser);
        setCloudReady(false);
        setLeaderboardOptIn(Boolean(signedInUser && localStorage.getItem(`${KEY}:leaderboard:${signedInUser.uid}`) === 'true'));
        if (signedInUser) setLoginOpen(false);
      });
    }).catch(() => notify('Firebase login could not start.'));
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user || !firebaseReady) {
      setCloudReady(false);
      setAdminAccess(false);
      return undefined;
    }
    let firstSnapshot = true;
    let active = true;
    let stopWatching;
    watchUserProgress(user.uid, (cloudProgress) => {
      if (firstSnapshot) {
        firstSnapshot = false;
        if (cloudProgress?.suspended) {
          notify('This account has been paused. Please contact support.');
          signOutUser().catch(() => {});
        } else if (cloudProgress?.progress) setProgress(cloudProgress.progress);
        else saveUserProgress(user.uid, progressRef.current, user.displayName || 'Learner', referralSource).catch(() => notify('Cloud progress could not be saved yet.'));
        setCloudReady(true);
      } else if (cloudProgress?.suspended) {
        notify('This account has been paused. Please contact support.');
        signOutUser().catch(() => {});
      } else if (cloudProgress?.progress) {
        setProgress(cloudProgress.progress);
      }
    }, () => notify('Could not load your online progress.')).then((unsubscribe) => {
      if (active) stopWatching = unsubscribe;
      else unsubscribe();
    }).catch((error) => notify(error.message));
    userIsAdmin(user).then(setAdminAccess).catch(() => setAdminAccess(false));
    return () => {
      active = false;
      stopWatching?.();
    };
  }, [user]);

  useEffect(() => {
    if (adminAccess) loadAdminDashboard();
  }, [adminAccess]);

  const reset = useCallback((nextPassage = passageRef.current, nextDuration = duration) => {
    setRunning(false);
    setResult(null);
    setTyped('');
    typedRef.current = '';
    setSeconds(0);
    setRemaining(nextDuration);
    startRef.current = 0;
    doneRef.current = false;
    passageRef.current = nextPassage;
    setPassage(nextPassage);
  }, [duration]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = startRef.current ? Math.min(duration, (Date.now() - startRef.current) / 1000) : 0;
    setSeconds(elapsed);
    setRunning(false);
    const current = getTypingMetrics(typedRef.current, passageRef.current, elapsed);
    if (!typedRef.current.length) current.accuracy = 0;
    const isAssessment = mode === 'evaluation';
    const passed = isAssessment && gradeTypingAssessment(current).passed;
    const beatChallenge = Boolean(challenge && current.wpm > challenge.wpm && current.accuracy >= challenge.accuracy);
    const session = { ...current, mode: isAssessment ? 'evaluation' : mode, passed, beatChallenge, duration: Math.max(1, Math.round(elapsed)), date: todayKey() };
    const oldProgress = progressRef.current;
    const today = todayKey();
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    const streak = oldProgress.lastPractice === today ? oldProgress.streak : oldProgress.lastPractice === yesterday ? oldProgress.streak + 1 : 1;
    const nextProgress = { ...oldProgress, sessions: [...oldProgress.sessions, session].slice(-200), streak, lastPractice: today };
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    if (user && cloudReady) saveUserProgress(user.uid, nextProgress, user.displayName || 'Learner').catch(() => notify('Your session is saved on this device; cloud sync can retry later.'));
    const best = Math.max(current.wpm, ...progress.sessions.map((item) => item.wpm));
    if (user && cloudReady && leaderboardOptIn) {
      updateLeaderboardEntry(user.uid, { optedIn: true, displayName: user.displayName || 'Learner', wpm: current.wpm, accuracy: current.accuracy })
        .catch(() => notify('Your score could not be added to the leaderboard.'));
    }
    setCoachFeedback('');
    setCoachError('');
    setResult({ ...current, assessment: isAssessment, passed, challenge, beatChallenge, duration, characters: Array.from(typedRef.current).length, best });
  }, [duration, mode, progress.sessions, user, cloudReady, leaderboardOptIn, challenge]);

  finishRef.current = finish;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      const elapsed = Math.min(duration, (Date.now() - startRef.current) / 1000);
      setSeconds(elapsed);
      setRemaining(Math.max(0, duration - Math.floor(elapsed)));
      if (elapsed >= duration) finishRef.current?.();
    }, 200);
    return () => window.clearInterval(id);
  }, [running, duration]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    let active = true;
    listPublishedLessons().then((items) => { if (active) setPublishedLessons(items); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const today = todayKey();
  const summary = useMemo(() => {
    const sessions = progress.sessions;
    const best = sessions.reduce((max, item) => Math.max(max, item.wpm), 0);
    const accuracy = sessions.length ? Math.round(sessions.reduce((sum, item) => sum + item.accuracy, 0) / sessions.length) : null;
    const minutes = Math.floor(sessions.filter((item) => item.date === today).reduce((sum, item) => sum + item.duration, 0) / 60);
    const goal = Math.max(1, Number(progress.goal) || 10);
    return { best, accuracy, minutes, goal, percent: Math.min(100, Math.round((minutes / goal) * 100)) };
  }, [progress, today]);

  const live = getTypingMetrics(typed, passage, seconds);
  const chars = Array.from(typed);
  const expected = Array.from(passage);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = todayKey(date);
    return { key, label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date)[0], done: progress.sessions.some((item) => item.date === key), today: key === today };
  });
  const lessonCatalog = [
    { id: 'builtin-home-row', title: t('lesson1'), level: 'Beginner', durationMinutes: 5, passage: TEXTS.lessons[0], lessonIndex: 0 },
    { id: 'builtin-reach-keys', title: t('lesson2'), level: 'Beginner', durationMinutes: 7, passage: TEXTS.lessons[1], lessonIndex: 1 },
    { id: 'builtin-punctuation', title: t('lesson3'), level: 'Beginner', durationMinutes: 8, passage: TEXTS.lessons[2], lessonIndex: 2 },
    ...publishedLessons.map((item) => ({ ...item, lessonIndex: null })),
  ];
  const visibleLessonCatalog = lessonCatalog.filter((item) => matchesLesson(item.title, item.level || 'Beginner'));

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  }

  async function shareOrCopy({ url, title, text }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        notify('Share sheet khul gaya.');
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = url;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    notify('Share link copy ho gaya.');
  }

  function shareResult() {
    if (!result) return;
    const url = buildChallengeUrl(window.location.href, {
      wpm: result.wpm,
      accuracy: result.accuracy,
      duration: result.duration,
      assessment: result.assessment,
    });
    return shareOrCopy({
      url,
      title: 'Kesria Typing challenge',
      text: `I scored ${result.wpm} WPM with ${result.accuracy}% accuracy. Can you beat my score?`,
    });
  }

  function shareInvite() {
    const url = buildInviteUrl(window.location.href, referralCode);
    return shareOrCopy({
      url,
      title: 'Join me on Kesria Typing',
      text: 'Practise typing with me on Kesria Typing.',
    });
  }

  async function askCoach() {
    if (!result) return;
    if (!user) return setCoachError(t('coachSignIn'));
    if (!firebaseAIReady) return setCoachError(t('coachSetup'));
    setCoachBusy(true);
    setCoachError('');
    try {
      const feedback = await requestTypingCoachFeedback({
        wpm: result.wpm,
        accuracy: result.accuracy,
        duration: result.duration,
        assessment: result.assessment,
        passed: result.passed,
        language: interfaceLanguage,
      });
      setCoachFeedback(feedback);
    } catch (error) {
      setCoachError(error.message || 'AI Coach is temporarily unavailable.');
    } finally {
      setCoachBusy(false);
    }
  }

  async function makeScoreCard(resultData) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext('2d');
    const background = context.createLinearGradient(0, 0, 1200, 630);
    background.addColorStop(0, '#f2efff');
    background.addColorStop(1, '#fff2e9');
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.roundRect(54, 54, 1092, 522, 36);
    context.fill();
    try {
      const mark = new Image();
      mark.src = `${import.meta.env.BASE_URL}kesria-mark.png`;
      await mark.decode();
      context.drawImage(mark, 92, 77, 70, 70);
    } catch { /* Keep the card usable if the logo asset is unavailable. */ }
    context.fillStyle = '#7556df';
    context.font = '700 38px Arial';
    context.fillText('Kesria Typing', 180, 132);
    context.fillStyle = '#777487';
    context.font = '600 22px Arial';
    context.fillText(resultData.assessment ? 'PROFESSIONAL TYPING EVALUATION' : 'TYPING PRACTICE RESULT', 100, 183);
    context.fillStyle = '#2c2b3b';
    context.font = '700 150px Arial';
    context.fillText(String(resultData.wpm), 95, 385);
    context.fillStyle = '#7255d9';
    context.font = '700 38px Arial';
    context.fillText('WPM', 420, 381);
    context.fillStyle = '#555365';
    context.font = '600 32px Arial';
    context.fillText(`Accuracy  ${resultData.accuracy}%`, 100, 463);
    context.fillText(`Duration  ${formatClock(resultData.duration)}`, 100, 515);
    if (resultData.assessment) {
      context.fillStyle = resultData.passed ? '#28764e' : '#9a5418';
      context.font = '700 28px Arial';
      context.fillText(resultData.passed ? 'PASSED  ·  50 WPM / 97%+' : 'KEEP PRACTISING  ·  TARGET 50 WPM / 97%', 610, 470);
    } else {
      context.fillStyle = '#777487';
      context.font = '600 25px Arial';
      context.fillText('Can you beat my score?', 610, 470);
    }
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  async function downloadScoreCard() {
    if (!result) return;
    const blob = await makeScoreCard(result);
    if (!blob) return notify('Could not create the result image.');
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'kesria-typing-result.png';
    link.click();
    URL.revokeObjectURL(objectUrl);
    notify('Result card download ho gaya.');
  }

  async function shareResultCard() {
    if (!result) return;
    const url = buildChallengeUrl(window.location.href, {
      wpm: result.wpm,
      accuracy: result.accuracy,
      duration: result.duration,
      assessment: result.assessment,
    });
    const text = `I scored ${result.wpm} WPM with ${result.accuracy}% accuracy on Kesria Typing. Can you beat me?`;
    const blob = await makeScoreCard(result);
    if (blob && navigator.share && navigator.canShare) {
      const file = new File([blob], 'kesria-typing-result.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: 'Kesria Typing challenge', text, url, files: [file] });
          return notify('Result share ho gaya.');
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
    }
    return shareOrCopy({ url, title: 'Kesria Typing challenge', text });
  }

  function shareChallengeLink() {
    if (!result) return;
    const url = buildChallengeUrl(window.location.href, {
      wpm: result.wpm,
      accuracy: result.accuracy,
      duration: result.duration,
      assessment: result.assessment,
    });
    return shareOrCopy({
      url,
      title: 'Kesria Typing challenge',
      text: `Can you beat my ${result.wpm} WPM score with ${result.accuracy}% accuracy?`,
    });
  }

  function newPassage(forMode = mode, lang = language, index = lesson) {
    if (forMode === 'lesson') {
      const next = (index + 1) % TEXTS.lessons.length;
      setLesson(next);
      setCustomLessonTitle('');
      reset(TEXTS.lessons[next]);
      return;
    }
    if (forMode === 'evaluation') {
      reset(makeAssessmentPassage());
      return;
    }
    const options = TEXTS[lang].filter((item) => item !== passageRef.current);
    reset(options[Math.floor(Math.random() * options.length)] || TEXTS[lang][0]);
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setCustomLessonTitle('');
    if (nextMode === 'lesson') reset(TEXTS.lessons[lesson]);
    else if (nextMode === 'evaluation') {
      setDuration(180);
      reset(makeAssessmentPassage(), 180);
    }
    else reset(TEXTS[language][0]);
  }

  function matchesLesson(title, level) {
    const query = lessonQuery.trim().toLocaleLowerCase();
    const matchesQuery = !query || `${title} ${level}`.toLocaleLowerCase().includes(query);
    const matchesLevel = lessonLevel === 'all' || String(level).toLowerCase() === lessonLevel;
    return matchesQuery && matchesLevel;
  }

  function startListedTest(item) {
    setMode(item.mode);
    setCustomLessonTitle('');
    setDuration(item.duration);
    reset(item.mode === 'evaluation' ? makeAssessmentPassage() : TEXTS.en[0], item.duration);
    document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startListedLesson(item) {
    setMode('lesson');
    const builtInIndex = item.lessonIndex;
    setLesson(builtInIndex ?? 0);
    setCustomLessonTitle(builtInIndex === null ? item.title : '');
    reset(item.passage, duration);
    document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function acceptChallenge() {
    if (!challenge) return;
    const modeForChallenge = challenge.assessment ? 'evaluation' : 'practice';
    const options = challenge.assessment ? [60, 180, 300] : [15, 30, 60, 180, 300];
    const targetDuration = options.includes(challenge.duration) ? challenge.duration : challenge.assessment ? 180 : 60;
    setMode(modeForChallenge);
    setCustomLessonTitle('');
    setDuration(targetDuration);
    reset(challenge.assessment ? makeAssessmentPassage() : TEXTS.en[0], targetDuration);
    document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => inputRef.current?.focus(), 450);
  }

  function typeText(event) {
    if (result) return;
    const value = Array.from(event.target.value).slice(0, expected.length).join('');
    event.target.value = value;
    typedRef.current = value;
    setTyped(value);
    if (value.length && !startRef.current) {
      startRef.current = Date.now();
      setRunning(true);
    }
    if (sound) {
      try {
        audio.current ||= new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audio.current.createOscillator();
        const gain = audio.current.createGain();
        oscillator.frequency.value = 520;
        gain.gain.setValueAtTime(0.02, audio.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.current.currentTime + 0.025);
        oscillator.connect(gain); gain.connect(audio.current.destination);
        oscillator.start(); oscillator.stop(audio.current.currentTime + 0.025);
      } catch { /* Sound is optional. */ }
    }
    if (value.length >= expected.length) finishRef.current?.();
  }

  async function handleGoogleLogin() {
    setAuthBusy(true);
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError(firebaseReady ? error.message : 'Firebase project setup complete hone ke baad Google login chalu hoga.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleEmailLogin(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      if (loginMode === 'signup') await createEmailAccount(email, password, displayName);
      else await signInWithEmail(email, password);
    } catch (error) {
      setAuthError(firebaseReady ? error.message : 'Firebase project setup complete hone ke baad email login chalu hoga.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handlePasswordReset() {
    if (!email.trim()) return setAuthError('Password reset ke liye pehle email address likhiye.');
    try {
      await sendPasswordReset(email);
      notify('Password reset link aapke email par bhej diya gaya.');
    } catch (error) {
      setAuthError(firebaseReady ? error.message : 'Firebase setup ke baad password reset chalu hoga.');
    }
  }

  async function handleSignOut() {
    try { await signOutUser(); } catch (error) { notify(error.message); }
  }

  async function handleLeaderboardOptIn(event) {
    const optedIn = event.target.checked;
    if (!user || !firebaseReady || !cloudReady) {
      notify('Leaderboard share karne ke liye pehle account se sign in kijiye.');
      return;
    }
    setLeaderboardOptIn(optedIn);
    localStorage.setItem(`${KEY}:leaderboard:${user.uid}`, String(optedIn));
    try {
      await updateLeaderboardEntry(user.uid, {
        optedIn,
        displayName: user.displayName || 'Learner',
        wpm: summary.best,
        accuracy: summary.accuracy || 0,
      });
      notify(optedIn ? 'Aapka score leaderboard par share hoga.' : 'Aap leaderboard se remove ho gaye.');
    } catch (error) {
      setLeaderboardOptIn(!optedIn);
      localStorage.setItem(`${KEY}:leaderboard:${user.uid}`, String(!optedIn));
      notify(error.message);
    }
  }

  async function loadLeaderboard() {
    if (!firebaseReady) return notify('Firebase setup complete hone ke baad leaderboard load hoga.');
    try { setLeaderboardRows(await getPublicLeaderboard()); }
    catch (error) { notify(error.message); }
  }

  async function loadAdminDashboard() {
    if (!adminAccess) return notify('Admin permission required.');
    setAdminBusy(true);
    try {
      const [users, lessons, reports, scores] = await Promise.all([listAdminUsers(), listAdminLessons(), listAdminReports(), getPublicLeaderboard()]);
      setAdminUsers(users);
      setAdminLessons(lessons);
      setPublishedLessons(lessons);
      setAdminReports(reports);
      setAdminScores(scores);
    } catch (error) {
      notify(error.message);
    } finally {
      setAdminBusy(false);
    }
  }

  async function submitAdminLesson(event) {
    event.preventDefault();
    if (!lessonDraft.title.trim() || !lessonDraft.passage.trim()) return notify('Lesson title aur passage dono likhiye.');
    setAdminBusy(true);
    try {
      await saveAdminLesson(lessonDraft);
      setLessonDraft({ title: '', level: 'Beginner', passage: '', durationMinutes: 5 });
      await loadAdminDashboard();
      notify('Lesson save ho gaya.');
    } catch (error) {
      notify(error.message);
    } finally {
      setAdminBusy(false);
    }
  }

  async function removeAdminLesson(lessonId) {
    if (!window.confirm('Is lesson ko delete karna hai?')) return;
    try {
      await deleteAdminLesson(lessonId);
      setAdminLessons((items) => items.filter((item) => item.id !== lessonId));
      notify('Lesson delete ho gaya.');
    } catch (error) { notify(error.message); }
  }

  async function toggleUserSuspension(account) {
    const suspended = !account.suspended;
    try {
      await setUserSuspended(account.id, suspended);
      setAdminUsers((items) => items.map((item) => item.id === account.id ? { ...item, suspended } : item));
      notify(suspended ? 'Account pause kar diya.' : 'Account phir se active hai.');
    } catch (error) { notify(error.message); }
  }

  async function reportIssue() {
    if (!user || !firebaseReady) return notify('Issue report bhejne ke liye sign in kijiye.');
    const message = window.prompt('Problem ka chhota sa description likhiye:');
    if (!message?.trim()) return;
    try {
      await submitUserReport(user.uid, 'Website feedback', message.trim());
      notify('Report bhej diya gaya—thank you.');
    } catch (error) { notify(error.message); }
  }

  async function resolveReport(reportId) {
    try {
      await resolveUserReport(reportId);
      setAdminReports((items) => items.map((item) => item.id === reportId ? { ...item, status: 'resolved' } : item));
      notify('Report resolved mark ho gaya.');
    } catch (error) { notify(error.message); }
  }

  async function removeLeaderboardScore(uid) {
    try {
      await updateLeaderboardEntry(uid, { optedIn: false });
      setAdminScores((items) => items.filter((item) => item.id !== uid));
      setLeaderboardRows((items) => items.filter((item) => item.id !== uid));
      notify('Public score remove kar diya.');
    } catch (error) { notify(error.message); }
  }

  function editGoal() {
    const answer = window.prompt('Set your daily practice goal in minutes (1–120):', String(progress.goal));
    if (answer === null) return;
    const goal = Number(answer);
    if (!Number.isInteger(goal) || goal < 1 || goal > 120) return notify('Choose a whole number from 1 to 120.');
    const nextProgress = { ...progressRef.current, goal };
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    if (user && cloudReady) saveUserProgress(user.uid, nextProgress, user.displayName || 'Learner').catch(() => notify('Your goal is saved on this device; cloud sync can retry later.'));
    notify(`Daily goal set to ${goal} minutes.`);
  }

  function startTyping() {
    if (result) reset();
    inputRef.current?.focus();
  }

  const passageMarkup = expected.map((character, index) => {
    const classes = ['char'];
    if (index < chars.length) classes.push(chars[index] === character ? 'correct' : 'incorrect');
    if (index === chars.length) classes.push('current');
    if (character === ' ') classes.push('space');
    return <span className={classes.join(' ')} key={`${index}-${character}`}>{character === ' ' ? '\u00a0' : character}</span>;
  });

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="Kesria Typing"><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}kesria-mark.png`} alt="" /></span><span>Kesria <span>Typing</span><i>.</i></span></a>
        <div className="nav-label">{t('space')}</div><nav className="main-nav"><a className="nav-link active" href="#home"><span className="nav-icon">⌂</span> {t('overview')} <span className="nav-active-dot" /></a><a className="nav-link" href="#practice"><span className="nav-icon">⌨</span> {t('practice')}</a><a className="nav-link" href="#tests"><span className="nav-icon">◷</span> {t('tests')}</a><a className="nav-link" href="#lesson-listing"><span className="nav-icon">▤</span> {t('lessons')} <span className="nav-count">12</span></a><a className="nav-link" href="#leaderboard"><span className="nav-icon">♧</span> {t('leaderboard')}</a>{adminAccess && <a className="nav-link" href="#admin"><span className="nav-icon">⚙</span> Admin</a>}<a className="nav-link" href="#progress"><span className="nav-icon">↗</span> {t('progress')}</a></nav>
        <div className="side-card"><span className="side-card-icon">✦</span><strong>{t('smallSteps')}<br />{t('bigSpeed')}</strong><p>{t('tenMinutes')}</p><div className="side-progress"><span style={{ width: `${summary.percent}%` }} /></div><small>{summary.minutes} / {summary.goal} {t('min')} {t('goal').toLowerCase()}</small></div>
        <div className="sidebar-bottom"><div className="avatar">KS</div><div className="profile-copy"><strong>Practice pal</strong><span>Free learner</span></div><button className="more-button" aria-label="··· More options">···</button></div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar"><div className="breadcrumb">{t('space')} <span>/</span> <strong>{t('overview')}</strong></div><div className="topbar-actions"><span className="today-date">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><button className="ui-language-toggle" onClick={() => setInterfaceLanguage((value) => value === 'en' ? 'hi' : 'en')}>{interfaceLanguage === 'en' ? 'हिन्दी' : 'English'}</button><button className={`icon-button ${sound ? '' : 'muted'}`} onClick={() => setSound((value) => !value)} aria-label={sound ? 'Mute keyboard sounds' : 'Enable keyboard sounds'}>♫<i /></button>{user ? <button className="profile-button" onClick={handleSignOut} title="Sign out" aria-label="Sign out">{(user.displayName || user.email || 'K').slice(0, 1).toUpperCase()}</button> : <button className="login-trigger" onClick={() => { setAuthError(''); setLoginOpen(true); }}>{t('signIn')}</button>}</div></header>
        <div className="page-wrap">
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-star">✳</span> {t('daily')}</div><h1>{t('hero1')}<br /><span>{t('hero2')}</span></h1><p className="welcome-copy">{t('heroText')} <span>अपनी typing skills रोज़ बेहतर बनाएं।</span></p></div><div className="welcome-art"><img className="welcome-logo" src={`${import.meta.env.BASE_URL}kesria-typing-logo.jpeg`} alt="Kesria Typing logo" /></div></section>

          {challenge && <section className="challenge-banner" role="status"><span className="challenge-mark">⚡</span><div><b>{t('challenge')}: {t('challengeTarget').replace('{wpm}', String(challenge.wpm)).replace('{accuracy}', String(challenge.accuracy))}</b><small>{formatClock(challenge.duration)} {challenge.assessment ? 'evaluation' : 'practice'}</small></div><button onClick={acceptChallenge}>{t('acceptChallenge')}</button><button className="challenge-dismiss" aria-label="Dismiss challenge" onClick={() => setChallenge(null)}>×</button></section>}
          <section className="stats-grid" aria-label="Your typing stats"><article className="stat-card stat-speed"><div className="stat-top"><span>{t('best')}</span><span className="stat-icon purple">↗</span></div><div className="stat-value"><strong>{summary.best}</strong><span>WPM</span></div><div className="stat-foot"><span className="stat-dot" /> {t('personalBest')}</div><div className="mini-chart" aria-hidden="true">{[26, 42, 32, 61, 47, 76, 58, 92].map((height, index) => <i style={{ height: `${height}%` }} key={index} />)}</div></article><article className="stat-card"><div className="stat-top"><span>{t('avgAccuracy')}</span><span className="stat-icon green">◎</span></div><div className="stat-value"><strong>{summary.accuracy ?? '—'}</strong><span>%</span></div><div className="stat-foot"><span className="soft-green">{t('aim')}</span></div><div className="accuracy-line"><span style={{ width: `${summary.accuracy || 0}%` }} /></div></article><article className="stat-card"><div className="stat-top"><span>{t('practiceTime')}</span><span className="stat-icon orange">◷</span></div><div className="stat-value"><strong>{summary.minutes}</strong><span>{t('min')}</span></div><div className="stat-foot"><span className="soft-orange">{t('everyMinute')}</span></div><div className="time-blocks" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div></article><article className="stat-card streak-card"><div className="stat-top"><span>{t('streak')}</span><span className="stat-icon coral">♨</span></div><div className="stat-value"><strong>{progress.streak}</strong><span>{t('days')}</span></div><div className="stat-foot"><span className="soft-coral">{t('showUp')}</span></div><div className="streak-week">{week.map((day) => <span className={`streak-day ${day.done ? 'done' : ''}`} key={day.key}><i>{day.done ? '✓' : day.today ? '·' : ' '}</i>{day.label}</span>)}</div></article></section>

          <section className="practice-section" id="practice"><div className="section-heading"><div><div className="eyebrow">{t('ready')}</div><h2>{t('flow')}<span>.</span></h2></div><button className="text-button" onClick={() => newPassage()}>{t('newText')} <span>↻</span></button></div>
            <div className="practice-layout"><div className="typing-card">
              <div className="typing-toolbar"><div className="mode-tabs" role="tablist" aria-label="Typing mode"><button className={`mode-tab ${mode === 'practice' ? 'selected' : ''}`} onClick={() => changeMode('practice')} role="tab" aria-selected={mode === 'practice'}>{t('freePractice')}</button><button className={`mode-tab ${mode === 'lesson' ? 'selected' : ''}`} onClick={() => changeMode('lesson')} role="tab" aria-selected={mode === 'lesson'}>{t('guided')}</button><button className={`mode-tab ${mode === 'evaluation' ? 'selected' : ''}`} onClick={() => changeMode('evaluation')} role="tab" aria-selected={mode === 'evaluation'}>{t('evaluation')}</button></div><div className="typing-settings"><span className="language-chip">{t('englishPractice')}</span><label className="select-wrap"><span className="sr-only">{t('testDuration')}</span><select value={duration} onChange={(event) => { const value = Number(event.target.value); setDuration(value); reset(passageRef.current, value); }}>{mode === 'evaluation' ? <><option value={60}>1 min</option><option value={180}>3 min</option><option value={300}>5 min</option></> : <><option value={15}>15 sec</option><option value={30}>30 sec</option><option value={60}>60 sec / 1 min</option><option value={180}>3 min</option><option value={300}>5 min</option></>}</select><span>⌄</span></label></div></div>
              {mode === 'lesson' && <div className="lesson-banner"><span>✦</span><div><b>{customLessonTitle || ['Home row: find your flow', 'Stretch for new keys', 'Numbers & punctuation'][lesson]}</b><small>{customLessonTitle ? t('customLessonPractice') : ['Keep your fingers on A S D F and J K L ;', 'Reach gently for nearby letters and return to home row.', 'Add numbers and symbols one step at a time.'][lesson]}</small></div><span className="lesson-step">LESSON {String(lesson + 1).padStart(2, '0')} OF 12</span></div>}
              {mode === 'evaluation' && <div className="lesson-banner evaluation-banner"><span>◎</span><div><b>{t('evaluation')}</b><small>{t('benchmark')}</small></div><span className="lesson-step">1 / 3 / 5 MIN</span></div>}
              <div className="test-metrics"><div className="timer-box"><span className="timer-ring">◷</span><div><small>{t('timeLeft')}</small><strong className={remaining <= 5 ? 'urgent' : ''}>{formatClock(remaining)}</strong></div></div><div className="live-metric"><small>{t('liveSpeed')}</small><strong>{live.wpm} <small>WPM</small></strong></div><div className="live-metric"><small>{t('accuracy')}</small><strong>{typed.length ? live.accuracy : 100}<small>%</small></strong></div><div className="live-metric"><small>{t('characters')}</small><strong>{chars.length}</strong></div><button className="reset-button" onClick={() => reset()} title="Reset test" aria-label="Reset test">↻</button></div>
              <div className="typing-area" onClick={startTyping}><div className="passage" aria-hidden="true">{passageMarkup}</div><textarea ref={inputRef} aria-label="Typing practice. Type the passage shown above." autoComplete="off" autoCapitalize="off" spellCheck="false" maxLength={5000} value={typed} onChange={typeText} onPaste={(event) => { event.preventDefault(); notify('Type the passage yourself to measure your speed.'); }} onKeyDown={(event) => { if (event.key === 'Escape') reset(); }} />{!typed && <div className="typing-hint"><span className="hint-key">↵</span> {t('hint')} <span className="hint-separator">·</span> <span>{t('correction')}</span></div>}</div>
              <div className="keyboard-row" aria-label="Home row keyboard guide"><span className="keyboard-label">{t('homeRow')}</span><div className="keyboard-keys"><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd className="key-highlight">F</kbd><kbd className="key-space" /><kbd className="key-highlight">J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>;</kbd></div><span className="keyboard-note">{t('rest')} <span>↗</span></span></div>
              <div className="typing-footer"><span><i className="live-dot" /> <span>{running ? t('statusFlow') : t('statusReady')}</span></span><button className="focus-button" onClick={startTyping}><span>⌨</span> {t('startTyping')} <span className="button-arrow">→</span></button><span className="keyboard-shortcut"><kbd>esc</kbd> to restart</span></div>
            </div>
            <aside className="practice-aside"><div className="goal-card"><div className="goal-top"><div><span className="eyebrow">{t('goal')}</span><h3>{t('doingGreat')}</h3></div><span className="goal-icon">✳</span></div><div className="goal-progress-wrap"><div className="goal-progress"><span style={{ width: `${summary.percent}%` }} /></div><span>{summary.percent}%</span></div><div className="goal-bottom"><b>{summary.minutes} {t('min')} / {summary.goal} {t('min')}</b><button onClick={editGoal}>{t('editGoal')}</button></div></div><div className="tip-card"><div className="tip-icon">✦</div><div className="eyebrow">{t('quickTip')}</div><h3>{t('accuracyFirst')}<br /><span>{t('speedFollow')}</span></h3><p>{interfaceLanguage === 'en' ? 'Slow down just enough to get each keystroke right. Your pace will naturally pick up.' : 'हर अक्षर सही टाइप करने पर ध्यान दें। अभ्यास से आपकी गति अपने आप बढ़ेगी।'}</p><div className="tip-decoration">〰</div></div><div className="practice-note"><span>⌘</span><p>{interfaceLanguage === 'en' ? 'Take a breath, sit comfortably, and let your fingers find their rhythm.' : 'आराम से बैठें, गहरी साँस लें और उंगलियों को अपनी लय में चलने दें।'}</p></div></aside></div>
          </section>

          <section className="lessons-section" id="lessons"><div className="section-heading lesson-heading"><div><div className="eyebrow">{t('learningPath')}</div><h2>{t('progressTitle')}<span>.</span></h2></div><button className="text-button" onClick={() => document.querySelector('#lesson-listing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t('viewAll')} <span>→</span></button></div><div className="lesson-grid"><button className="lesson-card lesson-one" onClick={() => { setMode('lesson'); setLesson(0); setCustomLessonTitle(''); reset(TEXTS.lessons[0]); document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth' }); }}><span className="lesson-illustration"><span className="lesson-emoji">⌨</span><i>✳</i></span><span className="lesson-info"><small>LESSON 01 · 5 MIN</small><b>{t('lesson1')}</b><span className="lesson-status"><i /> {t('startLearning')} <span>→</span></span></span></button><button className="lesson-card lesson-two" onClick={() => { setMode('lesson'); setLesson(1); setCustomLessonTitle(''); reset(TEXTS.lessons[1]); document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth' }); }}><span className="lesson-illustration"><span className="lesson-emoji">Aa</span><i>✳</i></span><span className="lesson-info"><small>LESSON 02 · 7 MIN</small><b>{t('lesson2')}</b><span className="lesson-status"><i /> {t('beginner')} <span>→</span></span></span></button><button className="lesson-card lesson-three" onClick={() => { setMode('lesson'); setLesson(2); setCustomLessonTitle(''); reset(TEXTS.lessons[2]); document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth' }); }}><span className="lesson-illustration"><span className="lesson-emoji">&amp;!</span><i>✳</i></span><span className="lesson-info"><small>LESSON 03 · 8 MIN</small><b>{t('lesson3')}</b><span className="lesson-status"><i /> {t('beginner')} <span>→</span></span></span></button>{publishedLessons.map((item, index) => <button className="lesson-card lesson-three" key={item.id} onClick={() => { setMode('lesson'); setLesson(index % TEXTS.lessons.length); setCustomLessonTitle(item.title); reset(item.passage); document.querySelector('#practice')?.scrollIntoView({ behavior: 'smooth' }); }}><span className="lesson-illustration"><span className="lesson-emoji">Aa</span><i>✳</i></span><span className="lesson-info"><small>LESSON {String(index + 4).padStart(2, '0')} · {item.durationMinutes} MIN</small><b>{item.title}</b><span className="lesson-status"><i /> {item.level || t('beginner')} <span>→</span></span></span></button>)}</div></section>
          <section className="leaderboard-section" id="leaderboard"><div className="section-heading"><div><div className="eyebrow">COMMUNITY</div><h2>{t('leaderboard')}<span>.</span></h2></div><button className="text-button" onClick={loadLeaderboard}>Refresh <span>↻</span></button></div><div className="leaderboard-card"><label className="leaderboard-optin"><input type="checkbox" checked={leaderboardOptIn} disabled={!user || !firebaseReady} onChange={handleLeaderboardOptIn} /><span>{t('optIn')}</span></label><p className="leaderboard-privacy">Your score is shared only after you opt in. Your email is never shown on the leaderboard.</p>{!firebaseReady && <p className="leaderboard-notice">Firebase project setup is needed to enable sign-in and public scores.</p>}{firebaseReady && !user && <p className="leaderboard-notice">Sign in to choose whether your score appears publicly.</p>}<div className="leaderboard-list">{leaderboardRows.length ? leaderboardRows.map((entry, index) => <div className="leaderboard-row" key={entry.id}><span className="leaderboard-rank">{index + 1}</span><span className="leaderboard-name">{entry.displayName}</span><span className="leaderboard-score">{entry.wpm} WPM</span><span className="leaderboard-accuracy">{entry.accuracy}%</span></div>) : <p className="leaderboard-empty">{t('emptyBoard')}</p>}</div></div></section>
          {adminAccess && <section className="admin-section" id="admin"><div className="section-heading"><div><div className="eyebrow">RESTRICTED TO ADMINS</div><h2>Admin dashboard<span>.</span></h2></div><button className="text-button" onClick={loadAdminDashboard}>{adminBusy ? 'Loading…' : 'Refresh data'} <span>↻</span></button></div><form className="admin-lesson-form" onSubmit={submitAdminLesson}><h3>{lessonDraft.id ? 'Edit lesson' : 'Add a lesson or passage'}</h3><div className="admin-form-row"><input aria-label="Lesson title" placeholder="Lesson title" value={lessonDraft.title} onChange={(event) => setLessonDraft((old) => ({ ...old, title: event.target.value }))} required /><select aria-label="Lesson level" value={lessonDraft.level} onChange={(event) => setLessonDraft((old) => ({ ...old, level: event.target.value }))}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><input aria-label="Lesson duration in minutes" type="number" min="1" max="30" value={lessonDraft.durationMinutes} onChange={(event) => setLessonDraft((old) => ({ ...old, durationMinutes: event.target.value }))} /></div><textarea aria-label="Lesson passage" placeholder="Typing passage" rows="3" value={lessonDraft.passage} onChange={(event) => setLessonDraft((old) => ({ ...old, passage: event.target.value }))} required /><button className="focus-button" type="submit" disabled={adminBusy}>{lessonDraft.id ? 'Save changes' : 'Add lesson'}</button>{lessonDraft.id && <button className="text-button" type="button" onClick={() => setLessonDraft({ title: '', level: 'Beginner', passage: '', durationMinutes: 5 })}>Cancel edit</button>}</form><div className="admin-grid"><article className="admin-list-card"><h3>Lessons &amp; passages <span>{adminLessons.length}</span></h3>{adminLessons.map((item) => <div className="admin-list-row" key={item.id}><span><b>{item.title}</b><small>{item.level} · {item.durationMinutes} min</small></span><button onClick={() => setLessonDraft(item)}>Edit</button><button className="danger-text" onClick={() => removeAdminLesson(item.id)}>Delete</button></div>)}</article><article className="admin-list-card"><h3>Users <span>{adminUsers.length}</span></h3>{adminUsers.map((account) => <div className="admin-list-row" key={account.id}><span><b>{account.displayName || 'Learner'}</b><small>{account.id.slice(0, 10)}… {account.suspended ? '· Paused' : ''}</small></span><button onClick={() => toggleUserSuspension(account)}>{account.suspended ? 'Reactivate' : 'Pause'}</button></div>)}</article><article className="admin-list-card"><h3>Reports <span>{adminReports.length}</span></h3>{adminReports.map((report) => <div className="admin-list-row" key={report.id}><span><b>{report.category || 'Report'}</b><small>{report.message}</small></span>{report.status !== 'resolved' && <button onClick={() => resolveReport(report.id)}>Resolve</button>}</div>)}</article></div></section>}
          {adminAccess && <section className="leaderboard-section"><div className="section-heading"><div><div className="eyebrow">ADMIN MODERATION</div><h2>Public scores<span>.</span></h2></div></div><div className="admin-list-card">{adminScores.map((score) => <div className="admin-list-row" key={score.id}><span><b>{score.displayName}</b><small>{score.wpm} WPM · {score.accuracy}%</small></span><button className="danger-text" onClick={() => removeLeaderboardScore(score.id)}>Remove</button></div>)}{!adminScores.length && <p className="leaderboard-empty">No public scores to review.</p>}</div></section>}
          <section className="invite-section"><div className="section-heading"><div><div className="eyebrow">GROW YOUR PRACTICE CIRCLE</div><h2>{t('inviteFriends')}<span>.</span></h2></div><button className="focus-button" onClick={shareInvite}>↗ {t('inviteFriends')}</button></div><div className="invite-card"><div><b>{referralCode}</b><p>{t('inviteHelp')}</p></div><button className="text-button" onClick={shareInvite}>{t('inviteFriends')} <span>→</span></button></div></section>
          <section className="test-library-section" id="tests"><div className="section-heading"><div><div className="eyebrow">PICK YOUR PACE</div><h2>{t('testLibrary')}<span>.</span></h2><p className="test-library-subtitle">{t('testLibraryText')}</p></div></div><div className="test-library-grid">{TEST_LIBRARY.map((item) => <article className="test-option-card" key={item.id}><span className={`test-option-tag ${item.mode === 'evaluation' ? 'evaluation-tag' : ''}`}>{item.tag}</span><h3>{t(item.titleKey)}</h3><p>{t(item.descriptionKey)}</p>{item.mode === 'evaluation' && <small>{t('benchmark')}</small>}<button onClick={() => startListedTest(item)}>{t('startTest')} <span>→</span></button></article>)}</div></section>
          <section className="about-section" id="about"><div className="about-mark"><img src={`${import.meta.env.BASE_URL}kesria-mark.png`} alt="" /></div><div><div className="eyebrow">KESRIA TYPING</div><h2>{t('aboutTitle')}</h2><p>{t('aboutCopy')}</p></div></section>
          <section className="lesson-directory" id="lesson-listing"><div className="section-heading"><div><div className="eyebrow">BROWSE THE LIBRARY</div><h2>{t('lessons')}<span>.</span></h2></div><span className="catalog-count">{visibleLessonCatalog.length} lessons</span></div><div className="lesson-catalog-controls"><label className="catalog-search"><span>⌕</span><input type="search" value={lessonQuery} onChange={(event) => setLessonQuery(event.target.value)} placeholder={t('searchLessons')} aria-label={t('searchLessons')} /></label><label className="select-wrap"><span className="sr-only">{t('allLevels')}</span><select value={lessonLevel} onChange={(event) => setLessonLevel(event.target.value)}><option value="all">{t('allLevels')}</option><option value="beginner">{t('beginner')}</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select><span>⌄</span></label></div>{visibleLessonCatalog.length ? <div className="lesson-directory-grid">{visibleLessonCatalog.map((item, index) => <article className="directory-lesson-card" key={item.id}><span className={`lesson-illustration ${index % 2 ? 'lesson-two' : 'lesson-one'}`}><span className="lesson-emoji">{index % 2 ? 'Aa' : '⌨'}</span></span><div className="directory-lesson-info"><small>{item.level || t('beginner')} · {item.durationMinutes} MIN</small><b>{item.title}</b><p>{item.passage.slice(0, 90)}{item.passage.length > 90 ? '…' : ''}</p><button onClick={() => startListedLesson(item)}>{t('startLearning')} <span>→</span></button></div></article>)}</div> : <p className="leaderboard-empty">{t('noLessons')}</p>}</section>
          <footer className="page-footer" id="progress"><span className="footer-brand">Kesria Typing<span>.</span></span><span>Made for your next keystroke.</span><a className="footer-about" href="#about">About Us</a><span className="copyright">© {new Date().getFullYear()} Kesria Typing. All rights reserved.</span><button className="footer-report" onClick={reportIssue}>Report a problem</button><a href="mailto:hello@kesriatyping.com">Say hello ↗</a></footer>
        </div>
      </main>

      {loginOpen && <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setLoginOpen(false); }}><section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Close login">×</button><a className="brand" href="#home"><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}kesria-mark.png`} alt="" /></span><span>Kesria <span>Typing</span><i>.</i></span></a><span className="section-eyebrow">OPTIONAL ACCOUNT</span><h2 id="login-title">Save your progress.</h2><p>Practice without an account, or sign in to sync progress between devices.</p>{!firebaseReady && <div className="auth-pending">{t('firebasePending')}</div>}<button className="login-google" onClick={handleGoogleLogin} disabled={!firebaseReady || authBusy}><span>G</span>{t('googleLogin')}</button><div className="login-divider"><span>OR USE EMAIL</span></div><form onSubmit={handleEmailLogin}><label className="email-input"><span>✉</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('email')} required /></label>{loginMode === 'signup' && <label className="email-input"><span>◉</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={t('fullName')} required /></label>}<label className="email-input"><span>⌑</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('password')} minLength={8} required /></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<button className="focus-button login-submit" type="submit" disabled={!firebaseReady || authBusy}>{authBusy ? 'Please wait…' : loginMode === 'signup' ? t('createAccount') : t('signIn')} <span className="button-arrow">→</span></button></form>{loginMode === 'signin' && <button className="forgot-password" onClick={handlePasswordReset}>{t('forgotPassword')}</button>}<button className="login-switch" onClick={() => { setAuthError(''); setLoginMode((value) => value === 'signin' ? 'signup' : 'signin'); }}>{loginMode === 'signin' ? t('noAccount') : t('hasAccount')}</button></section></div>}
      {result && <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setResult(null); }}><section className="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title"><button className="modal-close" onClick={() => setResult(null)} aria-label="Close results">×</button><div className="result-confetti">✳</div><div className="eyebrow">NICE WORK — SESSION COMPLETE</div><h2 id="result-title">{result.assessment ? t('evaluation') : 'Look at you go'}<span>!</span></h2><p className="result-subtitle">Every practice makes you a little better.</p>{result.assessment && <div className={`assessment-result ${result.passed ? 'passed' : 'not-passed'}`}><strong>{result.passed ? t('evalPassed') : t('evalRetry')}</strong><p>{result.passed ? t('evalPassedText') : t('evalRetryText')}</p><small>{t('benchmark')}</small></div>}{result.challenge && <div className={`assessment-result ${result.beatChallenge ? 'passed' : 'not-passed'}`}><strong>{result.beatChallenge ? t('challengeBeaten') : t('challengeNotBeaten')}</strong><p>{t('challengeTarget').replace('{wpm}', String(result.challenge.wpm)).replace('{accuracy}', String(result.challenge.accuracy))}</p></div>}<div className="result-score"><strong>{result.wpm}</strong><span>WPM</span><small>typing speed</small></div><div className="result-details"><div><span>ACCURACY</span><b>{result.accuracy}%</b></div><div><span>CHARACTERS</span><b>{result.characters}</b></div><div><span>BEST SPEED</span><b>{result.best} WPM</b></div></div><p className="result-message">{result.assessment ? (result.passed ? t('evalPassedText') : t('evalRetryText')) : result.accuracy >= 95 ? 'Lovely accuracy! Keep this rhythm going.' : result.wpm ? 'Great start. Slow down a little and accuracy will follow.' : 'A fresh start is a win. Give it another go!'}</p><section className="ai-coach-card"><div className="ai-coach-heading"><b>{t('aiCoach')}</b><p>{t('coachPrivacy')}</p></div><button className="ai-coach-button" onClick={askCoach} disabled={!firebaseAIReady || !user || coachBusy}>{coachBusy ? 'Thinking…' : t('askGemini')}</button>{!firebaseAIReady && <small>{t('coachSetup')}</small>}{!user && firebaseAIReady && <small>{t('coachSignIn')}</small>}{coachError && <p className="auth-error" role="alert">{coachError}</p>}{coachFeedback && <p className="ai-coach-feedback">{coachFeedback}</p>}</section><div className="result-share-actions"><button onClick={shareResultCard}>↗ {t('shareScore')}</button><button onClick={shareChallengeLink}>⚡ {t('challengeFriend')}</button><button onClick={downloadScoreCard}>↓ Download card</button></div><button className="focus-button result-retry" onClick={() => { if (result.assessment) reset(makeAssessmentPassage()); else newPassage(); setResult(null); }}>Practice again <span className="button-arrow">→</span></button></section></div>}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
