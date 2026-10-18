// Renders every product model to WebP photos: node tools/render-products.mjs [id ...]
// Requires a static server on http://localhost:8080 serving the repo root.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const ids = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.goto('http://localhost:8080/tools/render.html?size=1100');
await page.waitForFunction(() => window.__ready);
const all = await page.evaluate(() => import('../assets/js/models.js').then((m) => m.MODEL_IDS));
mkdirSync('assets/img/products', { recursive: true });
for (const id of ids.length ? ids : all) {
  for (let v = 0; v < 3; v++) {
    const url = await page.evaluate(([id, v]) => window.__render(id, v), [id, v]);
    writeFileSync(`assets/img/products/${id}-${v + 1}.webp`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('rendered', id);
}
await browser.close();
