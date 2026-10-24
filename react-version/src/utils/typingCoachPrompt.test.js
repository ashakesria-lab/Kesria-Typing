import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTypingCoachPrompt } from './typingCoachPrompt.js';

test('coach prompt contains bounded score metrics and evaluation context', () => {
  const prompt = buildTypingCoachPrompt({ wpm: 51.7, accuracy: 98, duration: 180, assessment: true, passed: true });
  assert.match(prompt, /WPM=52/);
  assert.match(prompt, /accuracy=98%/);
  assert.match(prompt, /formalEvaluation=true/);
  assert.match(prompt, /evaluationPassed=true/);
});

test('coach prompt uses Hindi when selected', () => {
  assert.match(buildTypingCoachPrompt({ wpm: 20, accuracy: 90, duration: 30, language: 'hi' }), /Reply in Hindi/);
});

test('coach prompt excludes raw text and clamps unsafe metric values', () => {
  const prompt = buildTypingCoachPrompt({ wpm: 900, accuracy: -5, duration: 9999, typedText: 'private sample text' });
  assert.match(prompt, /WPM=400/);
  assert.match(prompt, /accuracy=0%/);
  assert.match(prompt, /duration=300 seconds/);
  assert.doesNotMatch(prompt, /private sample text/);
});
