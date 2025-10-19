const { test, expect } = require('@playwright/test');

test('homepage has expected elements', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('http://127.0.0.1:8001', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#repo-grid')).toBeVisible();
  const projects = await page.locator('#repo-grid article').count();
  expect(projects).toBeGreaterThan(0);
  await page.screenshot({ path: 'tests/screenshot.png' });
});
