import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Wait for the server to be ready
  for (let i = 0; i < 30; i++) {
    try {
      await page.goto('http://localhost:4173/docs', { timeout: 1000 });
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  await page.goto('http://localhost:4173/docs/components/button');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'local_screenshot.png' });
  await browser.close();
})();
