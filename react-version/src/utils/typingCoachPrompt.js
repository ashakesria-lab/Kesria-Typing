export function buildTypingCoachPrompt({ wpm, accuracy, duration, assessment = false, passed = false, language = 'en' }) {
  const safeWpm = Math.max(0, Math.min(400, Math.round(Number(wpm) || 0)));
  const safeAccuracy = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
  const safeDuration = Math.max(1, Math.min(300, Math.round(Number(duration) || 1)));
  const responseLanguage = language === 'hi' ? 'Hindi' : 'English';

  return [
    `You are Kesria Typing's supportive typing coach. Reply in ${responseLanguage}.`,
    'Use only the numeric session summary below. The learner’s typed passage and raw keystrokes are intentionally not sent.',
    'Give at most 3 short, practical tips. Be encouraging and specific. Do not invent trends or claim a diagnosis.',
    `Session summary: WPM=${safeWpm}; accuracy=${safeAccuracy}%; duration=${safeDuration} seconds; formalEvaluation=${Boolean(assessment)}; evaluationPassed=${Boolean(passed)}.`,
    'Mention one thing the learner did well and one concrete practice focus. Keep the response under 90 words.',
  ].join('\n');
}
