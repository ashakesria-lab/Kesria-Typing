import test from 'node:test';
import assert from 'node:assert/strict';
import { formatClock, getTypingMetrics, gradeTypingAssessment } from './typingMetrics.js';

test('calculates 100% accuracy for a correct passage', () => {
  assert.deepEqual(getTypingMetrics('hello world', 'hello world', 60), {
    correct: 11,
    accuracy: 100,
    wpm: 2,
  });
});

test('counts wrong characters in accuracy and WPM', () => {
  assert.deepEqual(getTypingMetrics('hallo', 'hello', 60), {
    correct: 4,
    accuracy: 80,
    wpm: 1,
  });
});

test('does not divide by zero when a test starts', () => {
  assert.equal(getTypingMetrics('a', 'a', 0).wpm, 12);
});

test('returns a neutral live accuracy before typing', () => {
  assert.deepEqual(getTypingMetrics('', 'hello', 0), {
    correct: 0,
    accuracy: 100,
    wpm: 0,
  });
});

test('formats short and multi-minute timers', () => {
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(15), '00:15');
  assert.equal(formatClock(60), '01:00');
  assert.equal(formatClock(180), '03:00');
  assert.equal(formatClock(300), '05:00');
});

test('rounds partial seconds up and clamps negative values', () => {
  assert.equal(formatClock(1.1), '00:02');
  assert.equal(formatClock(-3), '00:00');
});

test('assessment passes only when both 50 WPM and 97% accuracy are met', () => {
  assert.equal(gradeTypingAssessment({ wpm: 50, accuracy: 97 }).passed, true);
  assert.equal(gradeTypingAssessment({ wpm: 49, accuracy: 100 }).passed, false);
  assert.equal(gradeTypingAssessment({ wpm: 90, accuracy: 96 }).passed, false);
});
