import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Find next screenshot number
const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const existing = fs.readdirSync(screenshotDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = path.join(screenshotDir, filename);

// Resolve puppeteer using file:// URL for Windows ESM compatibility
const puppeteerDir = path.join(__dirname, 'node_modules/puppeteer');
if (!fs.existsSync(puppeteerDir)) {
  console.log('Installing puppeteer...');
  execSync('npm install puppeteer --save-dev', { cwd: __dirname, stdio: 'inherit' });
}

const puppeteerUrl = pathToFileURL(path.join(puppeteerDir, 'lib/esm/puppeteer/puppeteer.js')).href;

let puppeteer;
try {
  const mod = await import(puppeteerUrl);
  puppeteer = mod.default || mod;
} catch (e) {
  // fallback: use cjs require via dynamic eval
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  puppeteer = require('puppeteer');
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
// Wait for fonts + two rAF cycles so fitHeroName runs correctly
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
await new Promise(r => setTimeout(r, 300));
// Scroll through page to trigger IntersectionObserver reveals
await page.evaluate(async () => {
  await new Promise(resolve => {
    const h = document.body.scrollHeight;
    let pos = 0;
    const step = () => {
      pos += 400;
      window.scrollTo(0, pos);
      if (pos < h) requestAnimationFrame(step);
      else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
    };
    step();
  });
});
await new Promise(r => setTimeout(r, 600)); // let animations settle
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${filename}`);
