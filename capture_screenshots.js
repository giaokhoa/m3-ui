const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.goto('http://localhost:4173/docs/components/button');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs_wide.png' });

  const contextMobile = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const pageMobile = await contextMobile.newPage();

  await pageMobile.goto('http://localhost:4173/docs/components/button');
  await pageMobile.waitForTimeout(1000);

  // Open the drawer on mobile
  try {
    await pageMobile.click('button[aria-label="Open navigation"]');
    await pageMobile.waitForTimeout(1000);
  } catch (e) {
    console.log("Could not open navigation on mobile");
  }

  await pageMobile.screenshot({ path: 'docs_narrow.png' });

  await browser.close();
})();
