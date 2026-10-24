import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChallengeUrl, buildInviteUrl, createReferralCode } from './shareLinks.js';

test('challenge link includes score, accuracy, duration, and evaluation type', () => {
  const url = new URL(buildChallengeUrl('https://kesria.example/', {
    wpm: 63.4,
    accuracy: 98.6,
    duration: 180,
    assessment: true,
  }));
  assert.equal(url.searchParams.get('challengeWpm'), '63');
  assert.equal(url.searchParams.get('challengeAccuracy'), '99');
  assert.equal(url.searchParams.get('challengeDuration'), '180');
  assert.equal(url.searchParams.get('challengeType'), 'evaluation');
});

test('invite link removes old challenge data and includes the referral code', () => {
  const url = new URL(buildInviteUrl('https://kesria.example/?challengeWpm=50', 'KESRIA-ABC123'));
  assert.equal(url.searchParams.get('ref'), 'KESRIA-ABC123');
  assert.equal(url.searchParams.has('challengeWpm'), false);
});

test('referral code has a fixed branded shape', () => {
  assert.match(createReferralCode(0.5), /^KESRIA-[A-Z0-9]{6}$/);
});
