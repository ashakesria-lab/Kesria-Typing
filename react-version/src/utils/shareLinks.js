export function buildChallengeUrl(currentHref, { wpm, accuracy, duration, assessment = false }) {
  const url = new URL(currentHref);
  url.searchParams.set('challengeWpm', String(Math.max(0, Math.round(Number(wpm) || 0))));
  url.searchParams.set('challengeAccuracy', String(Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)))));
  url.searchParams.set('challengeDuration', String(Math.max(1, Math.round(Number(duration) || 60))));
  if (assessment) url.searchParams.set('challengeType', 'evaluation');
  else url.searchParams.delete('challengeType');
  url.hash = '';
  return url.toString();
}

export function buildInviteUrl(currentHref, referralCode) {
  const url = new URL(currentHref);
  url.searchParams.delete('challengeWpm');
  url.searchParams.delete('challengeAccuracy');
  url.searchParams.delete('challengeDuration');
  url.searchParams.delete('challengeType');
  url.searchParams.set('ref', String(referralCode).slice(0, 32));
  url.hash = '';
  return url.toString();
}

export function createReferralCode(randomValue = Math.random()) {
  const suffix = Math.floor(Math.abs(randomValue) * 36 ** 6).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `KESRIA-${suffix}`;
}
