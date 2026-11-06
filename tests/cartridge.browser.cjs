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
    const url=page.url();
    const waitPhase = phase => page.waitForFunction(p => document.querySelector('#srv').dataset.phase === p, phase);
    const waitClosed = () => page.waitForFunction(() => !document.querySelector('#srv').open);
    async function screenshot(name){if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});}}
    await page.locator('#u2').scrollIntoViewIfNeeded();
    await page.locator('.cartridge-trigger.is-ready').waitFor();
    assert.equal(await page.locator('.cartridge-previews img').count(),3);
    assert.deepEqual(await page.locator('.cartridge-previews img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src'))),['previews/vagaflow.webp','previews/vikash.webp','previews/fuellog.webp']);
    assert.equal(await page.locator('.cartridge-more').textContent(),'+3');
    const links=await page.locator('#roomGrid .card').evaluateAll(cards=>cards.map(c=>c.href));
    await page.evaluate(()=>{window.cartridgeNode=document.querySelector('.cartridge-body');});
    await page.mouse.move(1430,990); await page.waitForTimeout(800); await screenshot('cartridge-idle');
    await page.locator('#vault').hover(); await page.waitForTimeout(700); await screenshot('cartridge-hover');
    await page.locator('#vault').click();
    await page.evaluate(()=>document.querySelector('#vault').click());
    await waitPhase('loading'); await screenshot('cartridge-loading');
    assert.equal(await page.evaluate(()=>cartridgeNode === document.querySelector('.cartridge-flight .cartridge-body')),true);
    await waitPhase('gallery'); await page.waitForTimeout(800); await screenshot('cartridge-gallery');
    assert.equal(new URL(page.url()).hash,'#projects-u02');
    assert.equal(await page.locator('#roomGrid .card').count(),6);
    const fuelLog = page.locator('#roomGrid .card').nth(2);
    assert.equal(await fuelLog.locator('h3').textContent(), 'FuelLog');
    assert.equal(await fuelLog.getAttribute('href'), 'https://fuellog.viktorware.com');
    const fuelLogImage = fuelLog.locator('img');
    await page.waitForFunction(() => document.querySelector('#roomGrid img[src="previews/fuellog.webp"]').naturalHeight > 0);
    assert.match(await fuelLogImage.evaluate(img => getComputedStyle(img).objectPosition), /^50% 0(?:px|%)$/);
    await fuelLog.hover();
    await page.waitForFunction(() => document.querySelector('#roomGrid img[src="previews/fuellog.webp"]').getAnimations().some(animation => animation.transitionProperty === 'object-position'));
    assert.deepEqual(await page.locator('#roomGrid .card').evaluateAll(cards=>cards.map(c=>c.href)),links);
    await page.locator('#srvRoom [data-lang="en"]').click();
    assert.equal(await page.locator('#srvClose').innerText(), 'Back to portfolio\nesc');
    await page.locator('#srvClose').click(); await waitClosed();
    assert.equal(await page.evaluate(()=>cartridgeNode === document.querySelector('#vault .cartridge-body')),true);
    assert.equal(await page.locator('#vault').evaluate(el=>document.activeElement===el),true);
    await page.goForward(); await waitPhase('gallery');
    await page.locator('#roomGrid .card').first().focus();
    await page.setViewportSize({width:1420,height:980});
    assert.equal(await page.locator('#roomGrid .card').first().evaluate(el=>document.activeElement===el),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('#roomGrid .card').first().evaluate(el=>document.activeElement===el),true);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goBack(); await waitClosed();
    await page.goForward(); await waitPhase('gallery');
    await page.goBack(); await waitPhase('closing'); await page.goForward(); await waitPhase('gallery');
    await page.keyboard.press('Escape'); await waitClosed();
    // Every transitional phase remains cancellable.
    for(const phase of ['activating','ejecting','expanding','loading']){
      await page.evaluate(()=>document.querySelector('#vault').click());
      await waitPhase(phase); await page.keyboard.press('Escape'); await waitClosed();
      assert.equal(await page.locator('#vault .cartridge-body').count(),1);
    }
    await page.goto(url.split('#')[0]+'#projects-u02',{waitUntil:'domcontentloaded'}); await waitPhase('gallery');
    await page.reload({waitUntil:'domcontentloaded'}); await waitPhase('gallery');
    await page.keyboard.press('Escape'); await waitClosed();
    assert.equal(new URL(page.url()).hash,'#u2');
    await page.waitForFunction(()=>document.querySelector('#vault').getBoundingClientRect().top<innerHeight);
    await page.locator('#vault').click(); await waitPhase('gallery');
    await page.keyboard.press('Escape'); await waitPhase('closing');
    await page.emulateMedia({reducedMotion:'reduce'});
    await waitClosed();
    const now=Date.now(); await page.locator('#vault').click(); await waitPhase('gallery');
    assert.ok(Date.now()-now<1000,'Reduced motion skips scenic waits');
    await page.keyboard.press('Escape'); await waitClosed();
    await page.emulateMedia({reducedMotion:'no-preference'});
    // An unavailable animation API must not strand the dialog.
    await page.evaluate(()=>{window.savedAnimate=Element.prototype.animate;Element.prototype.animate=function(){throw Error('simulated animation failure');};});
    await page.locator('#vault').click(); await waitPhase('gallery'); await page.keyboard.press('Escape'); await waitClosed();
    await page.evaluate(()=>{Element.prototype.animate=window.savedAnimate;});
    for(const width of [390,320]){
      await page.setViewportSize({width,height:844}); await page.locator('#vault').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      const box=await page.locator('.cartridge-body').boundingBox(); assert.ok(box.x>=0 && box.x+box.width<=width);
      if(width===390)await screenshot('cartridge-mobile');
      await page.locator('#vault').click(); await waitPhase('gallery');
      assert.equal(await page.locator('#srvRoom').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
      await page.locator('#srvClose').click(); await waitClosed();
    }
    await page.locator('#vault').focus();await page.keyboard.press('Enter');await waitPhase('gallery');
    await page.locator('#srvRoom [data-go="4"]').click();await waitClosed();
    await page.waitForFunction(()=>{const r=document.querySelector('#u5').getBoundingClientRect();return r.top>=0 && r.top<innerHeight*.4 && r.bottom>0;});
    assert.equal(await page.locator('#u5').evaluate(el=>document.activeElement===el),true);
    assert.deepEqual(errors,[]);
    console.log('PASS: cartridge previews, hover, persistent node, history/reload, repeated clicks, cancellation in every phase, PT/EN, reduced motion, animation failure, mobile and keyboard.');
  } finally { if(browser) await browser.close(); server.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
