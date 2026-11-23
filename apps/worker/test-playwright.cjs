const { chromium } = require('playwright');

async function test() {
  console.log('Testing Playwright launch from apps/worker...');
  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    console.log('MSEdge launched successfully!');
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com');
    console.log('YouTube page title:', await page.title());
    await browser.close();
    console.log('Playwright test passed!');
  } catch (err) {
    console.log('Channel msedge failed:', err.message);
    try {
      const browser = await chromium.launch({ channel: 'chrome', headless: true });
      console.log('Chrome launched successfully!');
      const page = await browser.newPage();
      await page.goto('https://www.youtube.com');
      console.log('YouTube page title:', await page.title());
      await browser.close();
    } catch (err2) {
      console.log('Channel chrome failed:', err2.message);
    }
  }
}

test();
