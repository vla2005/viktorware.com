// Use the installed Playwright package; no app dependency or build step.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const output = process.env.PROCESSOR_SHOTS;

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, content) => {
      if (error) { res.writeHead(404).end(); return; }
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(content);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-module="stack"]').waitFor();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.cpu-label').first().evaluate(el => getComputedStyle(el).pointerEvents), 'none');
    async function shot(name) {
      if (output) { fs.mkdirSync(output, { recursive: true }); await page.screenshot({ path: path.join(output, name + '.png'), animations: 'disabled' }); }
    }
    async function activate(id, module) {
      await page.evaluate(id => document.getElementById(id).scrollIntoView({ behavior: 'instant', block: 'start' }), id);
      await page.waitForFunction(module => document.querySelector('#stage').dataset.active === module, module);
      await page.waitForTimeout(700);
    }
    assert.equal(await page.locator('[data-module]').count(), 5);
    assert.equal(await page.locator('#stage').getAttribute('data-active'), 'idle');
    await shot('processor-hero');
    for (const [id, module] of [['u1', 'stack'], ['u2', 'projects'], ['u3', 'github'], ['u4', 'experience'], ['u5', 'contact'], ['u2', 'projects'], ['u1', 'stack']]) await activate(id, module);
    await page.locator('#nav a[href="#u2"]').click();
    await page.waitForFunction(() => document.querySelector('#stage').dataset.active === 'projects');
    await page.waitForTimeout(900);
    await shot('processor-projects');
    const stage = await page.locator('#stage').boundingBox();
    for (const module of await page.locator('[data-module]').all()) {
      const rect = await module.boundingBox();
      assert.ok(rect.x >= stage.x && rect.x + rect.width <= stage.x + stage.width + 1, 'Expanded module fits stage width');
      assert.ok(rect.y >= 70 && rect.y + rect.height < 1000, 'Expanded module fits viewport height');
    }
    // Click the live projected surface; the idle float intentionally never becomes static.
    const contactLabel = await page.locator('.cpu-label[href="#u5"]').boundingBox();
    await page.mouse.click(contactLabel.x + contactLabel.width / 2, contactLabel.y + contactLabel.height / 2);
    await page.waitForFunction(() => document.querySelector('#stage').dataset.active === 'contact');
    await activate('u2', 'projects');
    // Locale updates must not reconstruct the hardware.
    await page.evaluate(() => { window.originalProcessorNode = document.querySelector('[data-module]'); });
    await page.locator('.hdr [data-lang="en"]').click();
    assert.equal(await page.locator('.cpu-nav a').first().textContent(), '01STACK');
    assert.equal(await page.evaluate(() => originalProcessorNode === document.querySelector('[data-module]')), true);
    await page.locator('.hdr [data-lang="pt"]').click();
    // The original project experience still opens and closes.
    await page.locator('[data-open]').click();
    await page.waitForFunction(() => document.querySelector('#srv').classList.contains('in'));
    assert.equal(await page.locator('#roomGrid .card').count(), 6);
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#srv').open);
    // Interrupt targets without waiting for their transitions.
    for (const id of ['u5', 'u1', 'u4', 'u2']) await page.evaluate(id => document.getElementById(id).scrollIntoView({ behavior: 'instant' }), id);
    await page.waitForFunction(() => document.querySelector('#stage').dataset.active === 'projects');
    // Real native links remain usable with keyboard input.
    await page.locator('.cpu-nav a[href="#u4"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#stage').dataset.active === 'experience');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#stage').evaluate(el => el.style.getPropertyValue('--spread')), '0.0000');
    const closed = await page.locator('[data-module="projects"]').evaluate(el => el.style.transform);
    await activate('u2', 'projects');
    assert.equal(await page.locator('[data-module="projects"]').evaluate(el => el.style.transform), closed);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [390, 320, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('#stage').scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      assert.equal(await page.locator('#stage').isVisible(), true);
      assert.equal(await page.locator('#stage').evaluate(el => el.parentElement.classList.contains('hero')), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (width === 390) await shot('processor-mobile');
    }
    await page.setViewportSize({ width: 1024, height: 650 });
    await activate('u2', 'projects');
    assert.equal(await page.locator('#stage').evaluate(el => el.parentElement.classList.contains('layout')), true);
    const topModule = await page.locator('[data-module="stack"]').boundingBox();
    const hud = await page.locator('.cpu-hud').boundingBox();
    await shot('processor-short-desktop');
    assert.ok(topModule.y > hud.y + hud.height, 'Short desktop model stays below the HUD: ' + JSON.stringify({ topModule, hud }));
    const base = await page.locator('.cpu-base').boundingBox();
    const controls = await page.locator('.cpu-nav').boundingBox();
    assert.ok(base.y + base.height < controls.y, 'Model stays above its navigation');
    await page.goto(page.url().split('#')[0] + '#u4', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#stage').dataset.active === 'experience');
    await page.locator('.logo[href="#top"]').click();
    await page.waitForFunction(() => document.querySelector('#stage').dataset.active === 'idle');
    await page.waitForFunction(() => document.querySelector('#stage').style.getPropertyValue('--spread') === '0.0000');
    assert.deepEqual(errors, [], 'No JavaScript runtime errors');
    const legacy = await browser.newPage();
    const legacyErrors = [];
    legacy.on('pageerror', error => legacyErrors.push(error.message));
    await legacy.addInitScript(() => { MediaQueryList.prototype.addEventListener = undefined; });
    await legacy.goto(page.url().split('#')[0], { waitUntil: 'domcontentloaded' });
    assert.deepEqual(legacyErrors, [], 'Legacy media-query listeners must not interrupt portfolio boot');
    assert.equal(await legacy.locator('.hdr [data-lang="pt"]').getAttribute('aria-pressed'), 'true');
    console.log('PASS: desktop, 5 modules/6 anchors, direct hash entry, 3D click, menu, reverse/rapid scroll, locale identity, project dialog, keyboard, reduced motion, 3 mobile sizes, short desktop, legacy media queries; no runtime errors.');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
