import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Start server using node since we are in apps/docs
  const { spawn } = await import('child_process');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/docs/components/button');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'docs_extra_wide_fixed.png' });
  await browser.close();
  console.log("Screenshot done.");
})();
