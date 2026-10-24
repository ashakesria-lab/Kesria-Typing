import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows Kesria branding and the supplied logo', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Kesria Typing' })).toBeVisible();
  await expect(page.locator('.welcome-logo')).toHaveJSProperty('complete', true);
  await expect(page.locator('.welcome-logo')).not.toHaveJSProperty('naturalWidth', 0);
});

test('switches the interface to Hindi and back without changing English practice', async ({ page }) => {
  await page.getByRole('button', { name: 'हिन्दी' }).click();
  await expect(page.getByRole('heading', { name: /थोड़ा अभ्यास/ })).toBeVisible();
  await expect(page.locator('.language-chip')).toHaveText('English अभ्यास');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: /A little practice/ })).toBeVisible();
});

test('lists available lessons and filters them by title and level', async ({ page }) => {
  const catalog = page.locator('#lesson-listing');
  await expect(catalog.locator('.directory-lesson-card')).toHaveCount(3);
  await catalog.getByRole('searchbox', { name: 'Search lessons' }).fill('home row');
  await expect(catalog.locator('.directory-lesson-card')).toHaveCount(1);
  await catalog.getByRole('searchbox', { name: 'Search lessons' }).fill('no such lesson');
  await expect(catalog.getByText('No lessons match these filters.')).toBeVisible();
});

test('test listing starts the selected practice duration', async ({ page }) => {
  const testCard = page.locator('.test-option-card').filter({ hasText: 'Speed warm-up' });
  await testCard.getByRole('button', { name: /Start test/ }).click();
  await expect(page.getByRole('tab', { name: 'Free practice' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.typing-settings select')).toHaveValue('15');
  await expect(page.locator('.timer-box strong')).toHaveText('00:15');
});

test('evaluation shows three durations and reports the passing standard', async ({ page }) => {
  await page.getByRole('tab', { name: 'Evaluation' }).click();
  const duration = page.locator('.typing-settings select');
  await expect(duration.locator('option')).toHaveText(['1 min', '3 min', '5 min']);
  await expect(page.locator('.evaluation-banner').getByText('Pass standard: 50 WPM and 97% accuracy.')).toBeVisible();
  await duration.selectOption('300');
  await expect(page.locator('.timer-box strong')).toHaveText('05:00');
});

test('evaluation result can be shared and downloaded as a score card', async ({ page }) => {
  await page.getByRole('tab', { name: 'Evaluation' }).click();
  const prompt = (await page.locator('.passage').textContent()).replaceAll('\u00a0', ' ');
  await page.getByRole('textbox', { name: 'Typing practice. Type the passage shown above.' }).fill(prompt);
  await expect(page.locator('.assessment-result strong')).toHaveText('Evaluation passed');
  await expect(page.locator('.result-details')).toContainText('100%');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download card/ }).click();
  expect((await download).suggestedFilename()).toBe('kesria-typing-result.png');
});

test('challenge link shows a target and starts the matching evaluation', async ({ page }) => {
  await page.goto('/?challengeWpm=60&challengeAccuracy=97&challengeDuration=180&challengeType=evaluation');
  await expect(page.locator('.challenge-banner')).toContainText('60 WPM');
  await page.getByRole('button', { name: 'Accept challenge' }).click();
  await expect(page.getByRole('tab', { name: 'Evaluation' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.timer-box strong')).toHaveText('03:00');
});

test('guest sign-in explains Firebase is not configured yet', async ({ page }) => {
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('.auth-pending')).toBeVisible();
  await expect(page.locator('.login-google')).toBeDisabled();
  await expect(page.locator('.login-submit')).toBeDisabled();
});

test('AI coach keeps Firebase/Gemini disabled until secure configuration exists', async ({ page }) => {
  await page.getByRole('tab', { name: 'Evaluation' }).click();
  const passage = (await page.locator('.passage').textContent()).replaceAll('\u00a0', ' ');
  await page.getByRole('textbox', { name: 'Typing practice. Type the passage shown above.' }).fill(passage);
  await expect(page.locator('.result-modal')).toBeVisible();
  await expect(page.locator('.ai-coach-card')).toContainText('Firebase AI Logic');
  await expect(page.locator('.ai-coach-button')).toBeDisabled();
});

test('Gemini coach waits for Firebase AI Logic and App Check configuration', async ({ page }) => {
  await page.getByRole('tab', { name: 'Evaluation' }).click();
  const passage = (await page.locator('.passage').textContent()).replaceAll('\u00a0', ' ');
  await page.getByRole('textbox', { name: 'Typing practice. Type the passage shown above.' }).fill(passage);
  await expect(page.locator('.result-modal')).toBeVisible();
  await expect(page.locator('.ai-coach-button')).toBeDisabled();
  await expect(page.locator('.ai-coach-card')).toContainText('Firebase AI Logic');
});
