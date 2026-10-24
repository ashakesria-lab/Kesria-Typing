export function formatClock(seconds) {
  const wholeSeconds = Math.max(0, Math.ceil(Number(seconds) || 0));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export function getTypingMetrics(text, target, seconds) {
  const typedCharacters = Array.from(text ?? '');
  const expectedCharacters = Array.from(target ?? '');
  const correct = typedCharacters.reduce(
    (total, character, index) => total + (character === expectedCharacters[index] ? 1 : 0),
    0,
  );
  return {
    correct,
    accuracy: typedCharacters.length ? Math.round((correct / typedCharacters.length) * 100) : 100,
    wpm: Math.round((correct / 5) * 60 / Math.max(Number(seconds) || 0, 1)),
  };
}

export function gradeTypingAssessment({ wpm = 0, accuracy = 0 }, minWpm = 50, minAccuracy = 97) {
  return {
    passed: Number(wpm) >= minWpm && Number(accuracy) >= minAccuracy,
    minWpm,
    minAccuracy,
  };
}
