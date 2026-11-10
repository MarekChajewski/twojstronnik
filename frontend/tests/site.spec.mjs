import { test, expect } from '@playwright/test';

const legalPages = [
  '/polityka-prywatnosci/',
  '/polityka-cookies/',
  '/regulamin/',
  '/odstapienie-od-umowy/',
  '/powierzenie-danych/',
];

test('strona główna: logo, dwa kafle i poprawne linki', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('.brand')).toBeVisible();
  await expect(page.locator('.audience-card')).toHaveCount(2);
  await expect(page.locator('.audience-artist')).toHaveAttribute('href', '/dla-artystow/');
  await expect(page.locator('.audience-guide')).toHaveAttribute('href', '/dla-przewodnikow/');

  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(page.viewportSize().width + 1);

  if (isMobile) {
    const card = await page.locator('.audience-artist').boundingBox();
    const viewport = page.viewportSize();
    expect(card.x).toBeGreaterThanOrEqual(viewport.width * 0.04);
    expect(card.x + card.width).toBeLessThanOrEqual(viewport.width * 0.96);
  }

  const images = page.locator('.audience-visual img');
  for (const image of await images.all()) {
    await expect(image).toBeVisible();
    expect(await image.evaluate((el) => getComputedStyle(el).objectFit)).toBe('contain');
  }
});

test('wybór oferty przenosi na właściwą podstronę', async ({ page }) => {
  await page.goto('/');
  await page.locator('.audience-artist').click();
  await expect(page).toHaveURL(/\/dla-artystow\/$/);
  await expect(page.locator('main h1')).toBeVisible();
});

test('kroki mają numery obok nagłówków, a formularz jest dostępny', async ({ page }) => {
  await page.goto('/dla-artystow/');
  const headings = page.locator('.three-steps-item .step-heading');
  await expect(headings).toHaveCount(3);
  for (const heading of await headings.all()) {
    const number = await heading.locator('.step-number').boundingBox();
    const title = await heading.locator('h3').boundingBox();
    expect(number).not.toBeNull();
    expect(title).not.toBeNull();
    expect(number.x).toBeLessThan(title.x);
  }
  await expect(page.locator('[data-contact-form]')).toBeVisible();
});

test('formularz obsługuje wysyłkę i nie ujawnia błędu jako sukcesu', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true }),
  }));
  await page.goto('/dla-przewodnikow/');
  await page.locator('input[name="name"]').fill('Anna Kowalska');
  await page.locator('input[name="email"]').fill('anna@example.com');
  await page.locator('textarea[name="message"]').fill('Dzień dobry, mam pytanie o stronę dla przewodnika.');
  await page.locator('input[name="consent"]').check();
  await page.locator('[data-contact-form] button[type="submit"]').click();
  await expect(page.locator('[data-form-status]')).toContainText('Wiadomość została wysłana');
});

test('dokumenty prawne są dostępne', async ({ page }) => {
  for (const url of legalPages) {
    await page.goto(url);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://twojstronnik.pl${url}`);
  }
});

test('na telefonie nawigacja otwiera się i zamyka', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Test dotyczy widoku mobilnego');
  await page.goto('/dla-artystow/');
  const toggle = page.locator('[data-nav-toggle]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});


test('formularz nie potwierdza wysyłki po błędnej odpowiedzi serwera', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<html><body>Niepoprawne proxy</body></html>',
  }));
  await page.goto('/dla-artystow/');
  await page.locator('input[name="name"]').fill('Anna Kowalska');
  await page.locator('input[name="email"]').fill('anna@example.com');
  await page.locator('textarea[name="message"]').fill('Wiadomość testowa do formularza kontaktowego.');
  await page.locator('input[name="consent"]').check();
  await page.locator('[data-contact-form] button[type="submit"]').click();
  await expect(page.locator('[data-form-status]')).toContainText('Nie udało się wysłać');
  await expect(page.locator('textarea[name="message"]')).not.toBeEmpty();
});
