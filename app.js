const PASSAGES = {
  en: [
    'Small steps every day can take you to places you once only dreamed about. Keep your hands relaxed, trust your practice, and let every keystroke bring you a little closer to your goal.',
    'A calm mind and steady fingers make a wonderful team. Focus on each letter as it comes, breathe gently, and remember that getting it right matters more than getting there fast.',
    'The best way to get better at anything is to show up and try again. Progress is not always loud or quick, but every minute you spend practising is a minute well invested.',
    'Find a comfortable rhythm and let your fingers move with confidence. You do not have to be perfect today. Just keep learning, keep smiling, and enjoy how far you have come.',
    'Good things take practice. Start at a pace that feels easy, give every letter your attention, and soon your hands will know exactly where they need to go.'
  ],
  hi: [
    'रोज़ थोड़ा अभ्यास करने से बड़े बदलाव आते हैं। अपनी उंगलियों को आराम दें, हर अक्षर पर ध्यान दें और धीरे धीरे अपनी गति को बेहतर बनाएं।',
    'सफलता के लिए लगातार कोशिश करना ज़रूरी है। हर दिन कुछ नया सीखें, गलतियों से घबराएं नहीं और अपने लक्ष्य की ओर आगे बढ़ते रहें।',
    'अच्छी आदतें छोटे कदमों से शुरू होती हैं। थोड़ा समय निकालें, मन लगाकर अभ्यास करें और अपनी प्रगति पर गर्व महसूस करें।',
    'जब आप धैर्य के साथ अभ्यास करते हैं तो मुश्किल काम भी आसान हो जाता है। अपनी रफ्तार बनाए रखें और खुद पर भरोसा करना कभी न भूलें।',
    'हर नया दिन एक नया मौका लेकर आता है। सीखते रहें, मुस्कुराते रहें और अपने सपनों को पूरा करने की दिशा में आगे बढ़ते रहें।'
  ],
  lesson: [
    'asdf jkl; asdf jkl; fad sad lad ask all fall flask',
    'sad lad asks; a glad lass adds a salad; dad has a flag',
    'a fast draft; a tall glass; ask dad; add a small salad'
  ]
};

const STORAGE_KEY = 'kesria-typing-progress-v1';
const EMPTY_PROGRESS = { sessions: [], goal: 10, lastPractice: '', streak: 0 };
const $ = (selector) => document.querySelector(selector);
let progress;
try { progress = { ...EMPTY_PROGRESS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
catch { progress = { ...EMPTY_PROGRESS }; }

let duration = 30;
let mode = 'practice';
let lessonIndex = 0;
let passage = PASSAGES.en[0];
let typed = '';
let remaining = duration;
let elapsed = 0;
let startedAt = 0;
let timerId = null;
let finished = false;
let soundEnabled = false;
let audioContext;
let toastId;

const input = $('#typing-input');
const durationSelect = $('#duration-select');

function dateKey(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatClock(seconds) {
  const value = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function showToast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  window.clearTimeout(toastId);
  toastId = window.setTimeout(() => $('#toast').classList.remove('visible'), 2400);
}

function updateProgress() {
  const sessions = progress.sessions;
  const today = dateKey();
  const best = sessions.reduce((value, session) => Math.max(value, session.wpm), 0);
  const averageAccuracy = sessions.length
    ? Math.round(sessions.reduce((total, session) => total + session.accuracy, 0) / sessions.length)
    : null;
  const todayMinutes = Math.floor(sessions.filter((session) => session.date === today).reduce((total, session) => total + session.duration, 0) / 60);
  const goal = Math.max(1, Number(progress.goal) || 10);
  const percent = Math.min(100, Math.round((todayMinutes / goal) * 100));

  $('#best-wpm').textContent = String(best);
  $('#avg-accuracy').textContent = averageAccuracy === null ? '—' : String(averageAccuracy);
  $('#practice-time').textContent = String(todayMinutes);
  $('#streak-days').textContent = String(progress.streak || 0);
  $('#accuracy-line').style.width = `${averageAccuracy || 0}%`;
  $('#goal-progress-bar').style.width = `${percent}%`;
  $('#goal-percent').textContent = `${percent}%`;
  $('#goal-minutes').textContent = String(todayMinutes);
  $('#goal-of').textContent = `of ${goal} min`;
  $('#side-goal-label').textContent = `${todayMinutes} / ${goal}`;
  $('#side-progress-bar').style.width = `${percent}%`;

  $('#streak-week').innerHTML = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = dateKey(day);
    const done = sessions.some((session) => session.date === key);
    const label = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day).slice(0, 1);
    return `<span class="streak-day ${done ? 'done' : ''}"><i>${done ? '✓' : key === today ? '·' : ' '}</i>${label}</span>`;
  }).join('');
}

function drawPassage() {
  const node = $('#passage');
  node.replaceChildren();
  const target = Array.from(passage);
  const entered = Array.from(typed);
  target.forEach((character, index) => {
    const span = document.createElement('span');
    const classes = ['char'];
    if (index < entered.length) classes.push(entered[index] === character ? 'correct' : 'incorrect');
    if (index === entered.length) classes.push('current');
    if (character === ' ') classes.push('space');
    span.className = classes.join(' ');
    span.textContent = character === ' ' ? '\u00a0' : character;
    node.append(span);
  });
}

function getTypingStats() {
  const target = Array.from(passage);
  const entered = Array.from(typed);
  const correct = entered.reduce((total, character, index) => total + (character === target[index] ? 1 : 0), 0);
  return {
    correct,
    accuracy: entered.length ? Math.round((correct / entered.length) * 100) : 100,
    wpm: Math.round((correct / 5) * 60 / Math.max(elapsed, 1))
  };
}

function updateLiveStats() {
  const stats = getTypingStats();
  $('#live-wpm').textContent = String(stats.wpm);
  $('#live-accuracy').textContent = String(stats.accuracy);
  $('#char-count').textContent = String(Array.from(typed).length);
}

function resetTest(nextPassage = passage) {
  window.clearInterval(timerId);
  timerId = null;
  finished = false;
  typed = '';
  elapsed = 0;
  startedAt = 0;
  remaining = duration;
  passage = nextPassage;
  input.value = '';
  input.disabled = false;
  $('#timer').textContent = formatClock(remaining);
  $('#timer').classList.remove('urgent');
  $('#test-status').textContent = 'Ready when you are';
  $('#typing-hint').hidden = false;
  $('#result-modal').hidden = true;
  drawPassage();
  updateLiveStats();
}

function startTimer() {
  if (startedAt || finished) return;
  startedAt = Date.now();
  $('#test-status').textContent = 'You\'re in the flow';
  $('#typing-hint').hidden = true;
  timerId = window.setInterval(() => {
    elapsed = Math.min(duration, (Date.now() - startedAt) / 1000);
    remaining = Math.max(0, duration - Math.floor(elapsed));
    $('#timer').textContent = formatClock(remaining);
    if (remaining <= 5) $('#timer').classList.add('urgent');
    updateLiveStats();
    if (elapsed >= duration) finishTest();
  }, 200);
}

function updateStreak() {
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  if (progress.lastPractice !== today) {
    progress.streak = progress.lastPractice === yesterday ? progress.streak + 1 : 1;
    progress.lastPractice = today;
  }
}

function finishTest() {
  if (finished) return;
  finished = true;
  if (startedAt) elapsed = Math.min(duration, (Date.now() - startedAt) / 1000);
  window.clearInterval(timerId);
  timerId = null;
  input.disabled = true;
  $('#test-status').textContent = 'Practice complete — lovely work!';

  const stats = getTypingStats();
  if (!typed.length) stats.accuracy = 0;
  const session = { ...stats, duration: Math.max(1, Math.round(elapsed)), date: dateKey() };
  progress.sessions.push(session);
  progress.sessions = progress.sessions.slice(-200);
  updateStreak();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Browser storage may be disabled. */ }
  updateProgress();

  $('#result-wpm').textContent = String(stats.wpm);
  $('#result-accuracy').textContent = `${stats.accuracy}%`;
  $('#result-chars').textContent = String(Array.from(typed).length);
  $('#result-best').textContent = `${Math.max(stats.wpm, ...progress.sessions.map((item) => item.wpm))} WPM`;
  $('#result-message').textContent = stats.accuracy >= 95
    ? 'Lovely accuracy! Keep this rhythm going.'
    : stats.wpm > 0 ? 'Great start. Slow down a little and accuracy will follow.' : 'A fresh start is a win. Give it another go!';
  $('#result-modal').hidden = false;
  $('#close-results').focus();
}

function pickNewPassage() {
  if (mode === 'lesson') {
    lessonIndex = (lessonIndex + 1) % PASSAGES.lesson.length;
    $('#lesson-banner b').textContent = ['Home row: find your flow', 'Stretch for new keys', 'Numbers & punctuation'][lessonIndex];
    $('#lesson-banner small').textContent = ['Keep your fingers on A S D F and J K L ;', 'Reach gently for nearby letters and return to home row.', 'Add numbers and symbols one step at a time.'][lessonIndex];
    $('#lesson-banner .lesson-step').textContent = `LESSON ${String(lessonIndex + 1).padStart(2, '0')} OF 12`;
    resetTest(PASSAGES.lesson[lessonIndex]);
    return;
  }
  const options = PASSAGES.en.filter((item) => item !== passage);
  resetTest(options[Math.floor(Math.random() * options.length)] || PASSAGES.en[0]);
}

function playKeySound() {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 520;
    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.025);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.025);
  } catch { /* Keyboard sounds are optional. */ }
}

input.addEventListener('input', () => {
  if (finished) return;
  typed = Array.from(input.value).slice(0, Array.from(passage).length).join('');
  input.value = typed;
  if (typed.length) startTimer();
  playKeySound();
  drawPassage();
  updateLiveStats();
  if (typed.length >= Array.from(passage).length) finishTest();
});

input.addEventListener('paste', (event) => {
  event.preventDefault();
  showToast('Type the passage yourself to measure your speed.');
});
input.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') resetTest();
});

$('#focus-button').addEventListener('click', () => {
  if (finished) resetTest();
  input.focus();
});
$('#typing-area').addEventListener('click', () => {
  if (finished) resetTest();
  input.focus();
});
$('#reset-test').addEventListener('click', () => resetTest());
$('#new-prompt').addEventListener('click', pickNewPassage);
durationSelect.addEventListener('change', () => {
  duration = Number(durationSelect.value);
  resetTest();
});
document.querySelectorAll('.mode-tab').forEach((button) => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('.mode-tab').forEach((tab) => {
    const selected = tab === button;
    tab.classList.toggle('selected', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  const inLesson = mode === 'lesson';
  $('#lesson-banner').hidden = !inLesson;
  resetTest(inLesson ? PASSAGES.lesson[lessonIndex] : PASSAGES.en[0]);
}));

$('#sound-toggle').addEventListener('click', (event) => {
  soundEnabled = !soundEnabled;
  event.currentTarget.classList.toggle('muted', !soundEnabled);
  event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Mute keyboard sounds' : 'Enable keyboard sounds');
  showToast(soundEnabled ? 'Keyboard sounds on' : 'Keyboard sounds off');
});

$('#edit-goal').addEventListener('click', () => {
  const answer = window.prompt('Set your daily practice goal in minutes (1–120):', String(progress.goal));
  if (answer === null) return;
  const value = Number(answer);
  if (!Number.isInteger(value) || value < 1 || value > 120) {
    showToast('Choose a whole number from 1 to 120.');
    return;
  }
  progress.goal = value;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Browser storage may be disabled. */ }
  updateProgress();
  showToast(`Daily goal set to ${value} minutes.`);
});

document.querySelectorAll('.lesson-card').forEach((card) => card.addEventListener('click', () => {
  lessonIndex = Number(card.dataset.lesson);
  mode = 'lesson';
  document.querySelector('.mode-tab[data-mode="lesson"]').click();
  $('#lesson-banner b').textContent = ['Home row: find your flow', 'Stretch for new keys', 'Numbers & punctuation'][lessonIndex];
  $('#lesson-banner small').textContent = ['Keep your fingers on A S D F and J K L ;', 'Reach gently for nearby letters and return to home row.', 'Add numbers and symbols one step at a time.'][lessonIndex];
  $('#lesson-banner .lesson-step').textContent = `LESSON ${String(lessonIndex + 1).padStart(2, '0')} OF 12`;
  resetTest(PASSAGES.lesson[lessonIndex]);
  $('#practice').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => input.focus(), 450);
}));

$('#all-lessons').addEventListener('click', () => showToast('You’re already on your learning path — more lessons coming soon!'));
$('#close-results').addEventListener('click', () => resetTest());
$('#try-again').addEventListener('click', pickNewPassage);
$('#result-modal').addEventListener('click', (event) => {
  if (event.target === $('#result-modal')) resetTest();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('#result-modal').hidden) resetTest();
});

$('#today-date').textContent = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
$('#footer-year').textContent = String(new Date().getFullYear());
updateProgress();
drawPassage();
updateLiveStats();
