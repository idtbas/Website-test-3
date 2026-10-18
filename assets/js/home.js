import { boot, $, $$, productCard, bindTilt, mountCountdown, addToCart, countUp, esc, reveal, ICONS, starsHtml } from './app.js';
import { PRODUCTS, CATEGORIES, byId, img, reviewsFor } from './products.js';

boot();

/* ---------- Hero: live 3D interlocked rings ---------- */
async function hero() {
  const host = $('#hero-canvas');
  try {
    const THREE = await import('three');
    const { buildModel, createStudio } = await import('./models.js');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    const { scene } = createStudio(renderer, { shadow: false });
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

    const pivot = new THREE.Group();
    const a = buildModel('aura-band'); a.position.y = -1.0;
    const b = buildModel('halo-solitaire'); b.position.y = -0.95;
    const wa = new THREE.Group(); wa.add(a);
    const wb = new THREE.Group(); wb.add(b); wb.rotation.y = Math.PI / 2; wb.position.x = 0.92;
    wb.rotation.x = 0.0;
    const pair = new THREE.Group(); pair.add(wa, wb); pair.position.x = -0.46;
    pivot.add(pair);
    pivot.rotation.set(0.35, -0.6, 0.25);
    scene.add(pivot);

    const base = { x: 0, y: 0 };
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const mobile = w < 900;
      base.x = mobile ? 0 : Math.min(1.7, (w / h) * 0.85);
      base.y = mobile ? 1.55 : 0.25;
      camera.position.set(0, 0.05, mobile ? 14 : 8.2);
      camera.lookAt(0, 0.05, 0);
      camera.updateProjectionMatrix();
    };
    resize(); addEventListener('resize', resize);

    let mx = 0, my = 0, vel = 0.0035, dragging = false, lastX = 0;
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    host.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; host.setPointerCapture(e.pointerId); });
    host.addEventListener('pointermove', (e) => { if (!dragging) return; vel = (e.clientX - lastX) * 0.0012; lastX = e.clientX; });
    host.addEventListener('pointerup', () => { dragging = false; });
    host.style.touchAction = 'pan-y';

    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
    const clock = new THREE.Clock();
    let spin = 0;
    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      const t = clock.getElapsedTime();
      if (!dragging) vel += (0.0035 - vel) * 0.02;
      spin += vel;
      const sc = Math.min(1, scrollY / innerHeight);
      pivot.rotation.y = -0.6 + spin + mx * 0.5;
      pivot.rotation.x = 0.35 + my * 0.35 + sc * 0.8;
      pivot.position.set(base.x, base.y + Math.sin(t * 0.9) * 0.08 + sc * 1.2, 0);
      pair.rotation.z = Math.sin(t * 0.5) * 0.05;
      renderer.render(scene, camera);
    };
    loop();
    host.classList.add('is-live');
  } catch (err) {
    console.warn('3D hero unavailable, using still image', err);
    host.innerHTML = `<img class="fallback" src="${img('halo-solitaire', 1)}" alt="">`;
  }
}
hero();

$('[data-hero-add]').addEventListener('click', (e) => {
  addToCart({ id: 'halo-solitaire', finish: 'polished', opts: { size: '7' } }, $('.hero-product img'));
});
$$('[data-count]').forEach((el) => new IntersectionObserver(([en], o) => { if (en.isIntersecting) { countUp(el, +el.dataset.count, { fmt: (v) => Math.round(v / 1000) + 'k+' }); o.disconnect(); } }).observe(el));

/* ---------- Marquee ---------- */
const words = ['925 Sterling Silver', 'Hand-polished in seven stages', 'Free engraving on select pieces', 'Lifetime warranty', 'Recycled silver', 'Free 60-day returns', 'Insured worldwide shipping'];
$('#marquee').innerHTML = [...words, ...words].map((w) => `<span>${w}</span>`).join('');

/* ---------- Flash sale ---------- */
mountCountdown($('#flash-countdown'));
const flash = PRODUCTS.filter((p) => p.flash).slice(0, 4);
$('#flash-grid').innerHTML = flash.map((p, i) => {
  const claimed = 62 + ((p.reviews * 7) % 31);
  return productCard(p).replace('</article>', `<div class="claim"><div class="meter"><i style="--v:${claimed}%"></i></div><small><span>${claimed}% claimed</span><span>${p.stock} left at this price</span></small></div></article>`).replace('class="card"', `class="card reveal" style="--d:${i * 90}ms"`);
}).join('');

/* ---------- Categories bento ---------- */
const bentoCats = [['rings', 'halo-solitaire', 1], ['necklaces', 'infinity-pendant', 1], ['earrings', 'luna-hoops', 1], ['bracelets', 'atlas-cuff', 2], ['bullion', 'cast-bar', 1], ['home', 'nocturne-candlestick', 1], ['men', 'monogram-cufflinks', 1]];
$('#bento').innerHTML = bentoCats.map(([c, id, v], i) => {
  const cat = CATEGORIES.find((x) => x.id === c);
  const n = PRODUCTS.filter((p) => p.category === c).length;
  return `<a href="shop.html?cat=${c}" data-tilt="5" class="reveal" style="--d:${i * 70}ms"><img src="${img(id, v)}" alt="" loading="lazy"><div class="label"><div><h3>${cat.name}</h3><span>${n} pieces</span></div><span class="go">${ICONS.arrow}</span></div></a>`;
}).join('');

/* ---------- Bestsellers rail (drag + arrows) ---------- */
const rail = $('#rail');
rail.innerHTML = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 10).map((p) => productCard(p)).join('');
$$('[data-rail]').forEach((b) => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.rail * rail.clientWidth * 0.8, behavior: 'smooth' })));
const prog = $('#rail-progress');
const updateProg = () => { const max = rail.scrollWidth - rail.clientWidth; const w = (rail.clientWidth / rail.scrollWidth) * 100; prog.style.width = w + '%'; prog.style.left = (max ? (rail.scrollLeft / max) * (100 - w) : 0) + '%'; };
rail.addEventListener('scroll', updateProg, { passive: true }); updateProg();
let down = null;
rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = { x: e.clientX, s: rail.scrollLeft, moved: false }; });
addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 5) { down.moved = true; rail.classList.add('is-drag'); } rail.scrollLeft = down.s - dx; });
addEventListener('pointerup', () => { if (!down) return; setTimeout(() => rail.classList.remove('is-drag'), 0); down = null; });

/* ---------- Stack & Save in-view ---------- */
new IntersectionObserver(([e], o) => { if (e.isIntersecting) { $('#stack').classList.add('is-in'); o.disconnect(); } }, { threshold: 0.3 }).observe($('#stack'));

/* ---------- 925 story: swap media with scroll ---------- */
const media = $$('#story-media img');
const stepIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) media.forEach((m, i) => m.classList.toggle('is-on', i === +e.target.dataset.step));
}), { rootMargin: '-45% 0px -45% 0px' });
$$('.story-step').forEach((s) => stepIO.observe(s));

/* ---------- Reviews marquee ---------- */
const all = ['aura-band', 'infinity-pendant', 'luna-hoops', 'halo-solitaire', 'atlas-cuff', 'eagle-coin', 'orbit-signet', 'pearl-drop'].map((id) => ({ p: byId[id], r: reviewsFor(byId[id], 1)[0] }));
const cards = all.map(({ p, r }) => `<article class="rcard"><span class="stars" style="--pct:${r.stars * 20}%"></span><h4>“${esc(r.title)}”</h4><p>${esc(r.body)}</p><footer><img src="${img(p.id)}" alt=""><div><strong style="color:var(--ink)">${esc(r.name)}</strong> · ${esc(r.city)}<br><span class="verified">${ICONS.check} Verified · ${esc(p.name)}</span></div></footer></article>`).join('');
$('#reviews-track').innerHTML = cards + cards;

/* ---------- Bullion sparkline ---------- */
(function spark() {
  const pts = []; let v = 30.4;
  for (let i = 0; i < 60; i++) { v += (Math.sin(i * 0.35) * 0.12) + (Math.random() - 0.42) * 0.22; pts.push(v); }
  const min = Math.min(...pts), max = Math.max(...pts);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1)) * 400},${70 - ((p - min) / (max - min)) * 60}`).join(' ');
  $('#spark').innerHTML = `<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a0b" stop-opacity=".16"/><stop offset="1" stop-color="#0a0a0b" stop-opacity="0"/></linearGradient></defs><path d="${d} L400,80 L0,80Z" fill="url(#sg)"/><path d="${d}" fill="none" stroke="#0a0a0b" stroke-width="1.6" vector-effect="non-scaling-stroke" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 2.4s cubic-bezier(.16,1,.3,1)"/>`;
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { $('#spark path:last-child').style.strokeDashoffset = 0; o.disconnect(); } }).observe($('#spark'));
  setInterval(() => { const s = $('#spot-v'); if (s) $('#tk-spot').textContent = s.textContent; const d2 = $('#spot-d'); if (d2) { $('#tk-chg').textContent = d2.textContent.replace('▲ ', '+').replace('▼ ', '−'); $('#tk-chg').style.color = d2.className === 'up' ? 'var(--ok)' : 'var(--alert)'; } }, 2600);
})();

/* ---------- Promise strip ---------- */
$('#promise').innerHTML = [
  [ICONS.truck, 'Free insured shipping', 'On orders over $150'],
  [ICONS.return, '60-day returns', 'Free & no questions asked'],
  [ICONS.shield, 'Lifetime warranty', 'Repairs, resizing, polishing'],
  [ICONS.pen, 'Free engraving', 'On select pieces'],
  [ICONS.lock, 'Secure checkout', '256-bit encryption'],
].map(([i, b, s]) => `<div class="reveal">${i}<b>${b}</b><span>${s}</span></div>`).join('');

bindTilt(); reveal();
