// Scripture Deep Dive — Playwright UI Tests
// Run: npx playwright test
// Requires: npm install (installs playwright from package.json)
// Live site: https://craigbuckmaster.github.io/ScriptureDeepDive/

const { test, expect } = require('@playwright/test');

const BASE = 'https://craigbuckmaster.github.io/ScriptureDeepDive';

// ── Helpers ───────────────────────────────────────────────────────────────
const homePage  = () => `${BASE}/index.html`;
const chapter   = (book, n) => `${BASE}/${book.toLowerCase()}/${book}_${n}.html`;

// ═══════════════════════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Homepage', () => {

  test('loads and renders title', async ({ page }) => {
    await page.goto(homePage());
    await expect(page.locator('h1.hero-title')).toContainText('Scripture');
  });

  test('OT testament is open by default', async ({ page }) => {
    await page.goto(homePage());
    const ot = page.locator('#tg-ot');
    await expect(ot).toHaveClass(/open/);
    // Testament body should be visible
    await expect(page.locator('#tg-ot .testament-body')).toBeVisible();
  });

  test('Genesis and Exodus show as live books', async ({ page }) => {
    await page.goto(homePage());
    await expect(page.locator('#book-genesis .live-badge')).toBeVisible();
    await expect(page.locator('#book-exodus .live-badge')).toBeVisible();
  });

  test('clicking a chapter link navigates to it', async ({ page }) => {
    await page.goto(homePage());
    // Open Genesis
    await page.locator('#book-genesis .book-btn').click();
    await page.locator('a[href="genesis/Genesis_1.html"]').first().click();
    await expect(page).toHaveURL(/Genesis_1/);
    await expect(page.locator('h1')).toContainText('Genesis 1');
  });

  test.describe('Search', () => {

    test('searching a book name shows it', async ({ page }) => {
      await page.goto(homePage());
      await page.locator('#bookSearch').fill('Genesis');
      await expect(page.locator('.unified-results')).toBeVisible();
      await expect(page.locator('.book-result').first()).toContainText('Genesis');
    });

    test('searching verse text returns results', async ({ page }) => {
      await page.goto(homePage());
      await page.locator('#bookSearch').fill('in the beginning');
      await expect(page.locator('.verse-result').first()).toBeVisible();
      await expect(page.locator('.verse-ref').first()).toContainText('Gen');
    });

    test('searching a reference returns that verse', async ({ page }) => {
      await page.goto(homePage());
      await page.locator('#bookSearch').fill('Genesis 1:1');
      const firstResult = page.locator('.verse-result').first();
      await expect(firstResult).toBeVisible();
      await expect(page.locator('.verse-ref').first()).toContainText('Gen 1:1');
    });

    test('clearing search restores library', async ({ page }) => {
      await page.goto(homePage());
      await page.locator('#bookSearch').fill('creation');
      await expect(page.locator('#library-grid')).toBeHidden();
      await page.locator('#bookSearch').fill('');
      await expect(page.locator('#library-grid')).toBeVisible();
    });

    test('clicking a verse result navigates to that chapter', async ({ page }) => {
      await page.goto(homePage());
      await page.locator('#bookSearch').fill('let there be light');
      await page.locator('.verse-result').first().click();
      await expect(page).toHaveURL(/Genesis_1/);
    });

  });

  test('continue reading bar appears after visiting a chapter', async ({ page }) => {
    // Visit a chapter first to seed localStorage
    await page.goto(chapter('Genesis', 5));
    await page.goto(homePage());
    await expect(page.locator('#continue-bar')).toBeVisible();
    await expect(page.locator('.continue-chip').first()).toBeVisible();
  });

  test('continue reading chip links to correct chapter', async ({ page }) => {
    await page.goto(chapter('Genesis', 7));
    await page.goto(homePage());
    const chip = page.locator('.continue-chip').first();
    await expect(chip).toHaveAttribute('href', /genesis\/Genesis_7/);
    await chip.click();
    await expect(page).toHaveURL(/Genesis_7/);
  });

});

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTER PAGES — tested on Genesis 1 and Genesis 5 (early retrofit chapter)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Chapter page — Genesis 1', () => {
  const url = chapter('Genesis', 1);

  test('renders title and verses', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('h1')).toContainText('Genesis 1');
    await expect(page.locator('.verse-text').first()).toBeVisible();
  });

  test('authorship accordion opens and closes', async ({ page }) => {
    await page.goto(url);
    const toggle = page.locator('.authorship-toggle').first();
    const content = page.locator('.authorship-content').first();
    await expect(content).toBeHidden();
    await toggle.click();
    await expect(content).toBeVisible();
    await toggle.click();
    await expect(content).toBeHidden();
  });

  test('annotation button opens panel', async ({ page }) => {
    await page.goto(url);
    // Click the first annotation button in the first section
    const btn = page.locator('.btn-row .anno-trigger').first();
    await btn.click();
    await expect(page.locator('.anno-panel.open').first()).toBeVisible();
  });

  test('annotation panel closes when another opens', async ({ page }) => {
    await page.goto(url);
    const btns = page.locator('.btn-row .anno-trigger');
    await btns.nth(0).click();
    const firstPanel = page.locator('.anno-panel.open').first();
    await expect(firstPanel).toBeVisible();
    // Open a different button in a different section
    await btns.nth(3).click();
    // First panel should now be closed
    await expect(page.locator('.anno-panel.open')).toHaveCount(1);
  });

  test('next chapter arrow navigates to Genesis 2', async ({ page }) => {
    await page.goto(url);
    await page.locator('.nav-arrow.next').click();
    await expect(page).toHaveURL(/Genesis_2/);
  });

  test('qnav opens on button click', async ({ page }) => {
    await page.goto(url);
    await page.locator('.nav-center-btn').click();
    await expect(page.locator('.qnav-overlay')).toHaveClass(/open/);
  });

  test('qnav search returns verse results', async ({ page }) => {
    await page.goto(url);
    await page.locator('.nav-center-btn').click();
    await page.locator('#qnav-search-input').fill('light');
    await expect(page.locator('.qnav-verse-result').first()).toBeVisible();
  });

  test('qnav closes on dismiss click', async ({ page }) => {
    await page.goto(url);
    await page.locator('.nav-center-btn').click();
    await expect(page.locator('.qnav-overlay')).toHaveClass(/open/);
    await page.locator('.qnav-dismiss').click();
    await expect(page.locator('.qnav-overlay')).not.toHaveClass(/open/);
  });

  test('theological themes panel opens', async ({ page }) => {
    await page.goto(url);
    const themesBtn = page.locator('.scholarly-btn.themes-btn, button.themes-btn').first();
    await themesBtn.click();
    await expect(page.locator('.themes-panel.open').first()).toBeVisible();
  });

});

test.describe('Chapter page — Genesis 5 (retrofit chapter)', () => {
  const url = chapter('Genesis', 5);

  test('renders correctly with verses visible', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('h1')).toContainText('Genesis 5');
    const verses = page.locator('.verse-text');
    await expect(verses.first()).toBeVisible();
    const count = await verses.count();
    expect(count).toBeGreaterThan(20);
  });

  test('authorship toggle works', async ({ page }) => {
    await page.goto(url);
    const toggle = page.locator('.authorship-toggle').first();
    const content = page.locator('.authorship-content').first();
    await expect(content).toBeHidden();
    await toggle.click();
    await expect(content).toBeVisible();
    // Should contain Moses bio
    await expect(content).toContainText('Moses');
  });

  test('prev arrow navigates to Genesis 4', async ({ page }) => {
    await page.goto(url);
    await page.locator('.nav-arrow.prev').click();
    await expect(page).toHaveURL(/Genesis_4/);
  });

});

test.describe('Chapter page — Exodus 40 (last chapter)', () => {
  const url = chapter('Exodus', 40);

  test('renders and has correct verse count', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('h1')).toContainText('Exodus 40');
    const verses = page.locator('.verse-text');
    const count = await verses.count();
    expect(count).toBe(38);
  });

  test('next arrow is disabled (last chapter)', async ({ page }) => {
    await page.goto(url);
    const next = page.locator('.nav-arrow.next');
    // Should either be disabled or href="#"
    const href = await next.getAttribute('href');
    const cls  = await next.getAttribute('class');
    expect(href === '#' || (cls && cls.includes('disabled'))).toBeTruthy();
  });

});
