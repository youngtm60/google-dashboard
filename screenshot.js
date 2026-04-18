const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1024, height: 600 }
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000); // Wait for animations/load
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
})();
