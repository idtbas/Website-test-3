/* Silver Shop — shared storefront engine: state, pricing, chrome (header/footer/drawer), and UI effects. */
import { PRODUCTS, CATEGORIES, byId, img, CITIES } from './products.js';

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const money = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
export const money2 = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('ss:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ss:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
export { store };
const bus = new EventTarget();
export const on = (e, f) => bus.addEventListener(e, f);
const emit = (e, detail) => bus.dispatchEvent(new CustomEvent(e, { detail }));

export const ICONS = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.4-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.9-7.5 10.3-7.5 10.3Z"/></svg>',
  heartO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.5s-7.5-4.4-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.9-7.5 10.3-7.5 10.3Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  return: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="m8 5-4 4 4 4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8.5h14V12M12 8v12.5M12 8S10.5 3.5 8 4.2 8.6 8 12 8Zm0 0s1.5-4.5 4-3.8S15.4 8 12 8Z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.8 20 7.3v9.4l-8 4.5-8-4.5V7.3l8-4.5Z"/><path d="M4 7.3 12 12l8-4.7M12 12v9.2"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 16 13-13 5 5L8 21l-5-5Z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/></svg>',
};
const checkSvg = '<svg viewBox="0 0 12 12"><path d="M2 6.2 4.8 9 10 3.2"/></svg>';
export { checkSvg };

/* ------------------------------------------------------------------ */
/* Pricing & cart                                                      */
/* ------------------------------------------------------------------ */
export const FREE_SHIP = 150;
export const ENGRAVE_FEE = 15;
export const PROMOS = {
  SILVER10: { label: '10% off sitewide', type: 'pct', value: 10 },
  WELCOME15: { label: '15% off your first order', type: 'pct', value: 15 },
  FREESHIP: { label: 'Free express shipping', type: 'ship' },
  VIP20: { label: '20% off orders over $250', type: 'pct', value: 20, min: 250 },
};
const JEWELRY = new Set(['rings', 'necklaces', 'earrings', 'bracelets', 'men']);

export function unitPrice(p, opts = {}) {
  let price = p.price;
  for (const [k, v] of Object.entries(opts)) if (p.optionPrices?.[k]?.[v]) price = p.optionPrices[k][v];
  return price;
}

export const cart = {
  items: store.get('cart', []),
  promo: store.get('promo', null),
  save() { store.set('cart', this.items); store.set('promo', this.promo); emit('cart', this); },
  key: (i) => [i.id, i.finish, JSON.stringify(i.opts || {}), i.engraving || '', i.addon ? 'a' : ''].join('|'),
  add(item) {
    const k = this.key(item);
    const ex = this.items.find((i) => this.key(i) === k);
    if (ex) ex.qty = Math.min(99, ex.qty + (item.qty || 1));
    else this.items.push({ qty: 1, ...item });
    this.save();
  },
  setQty(idx, q) { if (q <= 0) this.items.splice(idx, 1); else this.items[idx].qty = Math.min(99, q); this.save(); },
  remove(idx) { this.items.splice(idx, 1); this.save(); },
  clear() { this.items = []; this.promo = null; this.save(); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  applyPromo(code) {
    code = String(code || '').trim().toUpperCase();
    const p = PROMOS[code];
    if (!p) return { ok: false, msg: 'That code isn’t valid. Try SILVER10.' };
    const t = this.totals({ promo: code });
    if (p.min && t.merch < p.min) return { ok: false, msg: `${code} needs ${money(p.min)} in your bag — you’re ${money(p.min - t.merch)} away.` };
    this.promo = code; this.save();
    return { ok: true, msg: `${code} applied — ${p.label}.` };
  },
  removePromo() { this.promo = null; this.save(); },
  /** Full price breakdown. shipping: {method}, country: tax region. */
  totals({ shipping = null, country = 'US', giftWrap = false, promo = this.promo } = {}) {
    const lines = this.items.map((i) => {
      const p = byId[i.id];
      const base = i.addon ? p.addon : unitPrice(p, i.opts);
      const unit = base + (i.engraving ? ENGRAVE_FEE : 0);
      return { ...i, p, unit, compare: p.compareAt && !i.addon ? p.compareAt + (i.engraving ? ENGRAVE_FEE : 0) : null, total: unit * i.qty };
    });
    const merch = lines.reduce((s, l) => s + l.total, 0);
    const compareSavings = lines.reduce((s, l) => s + (l.compare ? (l.compare - l.unit) * l.qty : 0), 0);
    const jewelryQty = lines.filter((l) => JEWELRY.has(l.p.category)).reduce((s, l) => s + l.qty, 0);
    const jewelrySub = lines.filter((l) => JEWELRY.has(l.p.category)).reduce((s, l) => s + l.total, 0);
    const stackPct = jewelryQty >= 3 ? 15 : jewelryQty >= 2 ? 10 : 0;
    const stack = Math.round(jewelrySub * stackPct) / 100;
    let promoAmt = 0, promoShip = false;
    const pr = promo && PROMOS[promo];
    if (pr && !(pr.min && merch < pr.min)) {
      if (pr.type === 'pct') {
        const eligible = lines.filter((l) => l.p.category !== 'bullion').reduce((s, l) => s + l.total, 0) - stack;
        promoAmt = Math.round(Math.max(0, eligible) * pr.value) / 100;
      } else promoShip = true;
    }
    const discount = stack + promoAmt;
    const afterDiscount = Math.max(0, merch - discount);
    const methods = shippingMethods(afterDiscount, promoShip);
    const ship = shipping ? (methods.find((m) => m.id === shipping) || methods[0]) : null;
    const shipCost = ship ? ship.price : 0;
    const wrap = giftWrap ? 6 : 0;
    const rate = TAX[country]?.rate ?? 0.08;
    const tax = Math.round((afterDiscount + shipCost + wrap) * rate * 100) / 100;
    const total = afterDiscount + shipCost + wrap + (shipping ? tax : 0);
    return { lines, merch, compareSavings, stackPct, stack, jewelryQty, promo: pr ? promo : null, promoAmt, promoShip, discount, afterDiscount, methods, ship, shipCost, wrap, tax, rate, total, toFree: Math.max(0, FREE_SHIP - afterDiscount) };
  },
};

export const TAX = {
  US: { rate: 0.0725, label: 'Sales tax', name: 'United States' },
  CA: { rate: 0.13, label: 'HST', name: 'Canada' },
  GB: { rate: 0.2, label: 'VAT', name: 'United Kingdom' },
  DE: { rate: 0.19, label: 'MwSt.', name: 'Germany' },
  FR: { rate: 0.2, label: 'TVA', name: 'France' },
  AT: { rate: 0.2, label: 'USt.', name: 'Austria' },
  CH: { rate: 0.081, label: 'MWST', name: 'Switzerland' },
  NL: { rate: 0.21, label: 'BTW', name: 'Netherlands' },
  PT: { rate: 0.23, label: 'IVA', name: 'Portugal' },
  AU: { rate: 0.1, label: 'GST', name: 'Australia' },
  JP: { rate: 0.1, label: 'Consumption tax', name: 'Japan' },
};

export function addBusinessDays(d, n) {
  const r = new Date(d);
  while (n > 0) { r.setDate(r.getDate() + 1); if (r.getDay() !== 0 && r.getDay() !== 6) n--; }
  return r;
}
export const fmtDate = (d, o = { weekday: 'short', month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);

export function shippingMethods(sub, freeExpress = false) {
  const now = new Date();
  return [
    { id: 'standard', name: 'Standard', desc: 'Tracked & insured', price: sub >= FREE_SHIP ? 0 : 8, eta: [addBusinessDays(now, 3), addBusinessDays(now, 5)] },
    { id: 'express', name: 'Express', desc: 'Priority, signature on delivery', price: freeExpress ? 0 : 18, eta: [addBusinessDays(now, 1), addBusinessDays(now, 2)] },
    { id: 'nextday', name: 'Next Day', desc: 'Order before 3pm', price: 32, eta: [addBusinessDays(now, 1), addBusinessDays(now, 1)] },
  ];
}

/* Wishlist & recently viewed */
export const wishlist = {
  ids: new Set(store.get('wish', [])),
  toggle(id) { this.ids.has(id) ? this.ids.delete(id) : this.ids.add(id); store.set('wish', [...this.ids]); emit('wish', this); return this.ids.has(id); },
  has(id) { return this.ids.has(id); },
};
export function markViewed(id) {
  const r = store.get('recent', []).filter((x) => x !== id);
  r.unshift(id); store.set('recent', r.slice(0, 12));
}

/* ------------------------------------------------------------------ */
/* Flash sale clock — ends at local midnight, every day (demo)         */
/* ------------------------------------------------------------------ */
export function saleEnds() { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }
export function remaining(to = saleEnds()) {
  const ms = Math.max(0, to - Date.now());
  return { h: Math.floor(ms / 36e5), m: Math.floor((ms % 36e5) / 6e4), s: Math.floor((ms % 6e4) / 1e3), ms };
}
const pad = (n) => String(n).padStart(2, '0');
export function mountCountdown(el, to = saleEnds()) {
  el.innerHTML = ['h', 'm', 's'].map((u, i) => `${i ? '<span class="sep">:</span>' : ''}<span class="unit"><b data-u="${u}">00</b><small>${{ h: 'Hours', m: 'Minutes', s: 'Seconds' }[u]}</small></span>`).join('');
  const tick = () => {
    const r = remaining(to);
    for (const u of ['h', 'm', 's']) {
      const b = el.querySelector(`[data-u="${u}"]`);
      const v = pad(r[u]);
      if (b.textContent !== v) { b.innerHTML = `<span class="flip">${v}</span>`; }
    }
  };
  tick(); setInterval(tick, 1000);
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */
export const pct = (p) => (p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0);
export const starsHtml = (r) => `<span class="stars" style="--pct:${(r / 5) * 100}%" aria-label="${r} out of 5 stars"></span>`;

export function productCard(p, { lazy = true } = {}) {
  const badges = [];
  if (p.flash) badges.push(`<span class="tag tag-flash">Flash −${pct(p)}%</span>`);
  else if (p.badge) badges.push(`<span class="tag ${p.isNew ? 'tag-silver' : ''}">${esc(p.badge)}</span>`);
  if (p.isNew && p.badge !== 'New') badges.push('<span class="tag tag-silver">New</span>');
  return `<article class="card" data-id="${p.id}">
    <div class="card-media" data-tilt>
      <div class="card-badges">${badges.join('')}</div>
      <button class="wish ${wishlist.has(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save ${esc(p.name)} to wishlist">${ICONS.heart}</button>
      <img class="main" src="${img(p.id, 1)}" alt="${esc(p.name)} in sterling silver" ${lazy ? 'loading="lazy"' : ''} width="1100" height="1100">
      <img class="alt" src="${img(p.id, 2)}" alt="" aria-hidden="true" loading="lazy" width="1100" height="1100">
      <div class="card-actions">
        <button class="btn btn-ink" data-quick-add="${p.id}">${ICONS.bag} Quick add</button>
        <button class="btn btn-silver" data-quick-view="${p.id}" aria-label="Quick view ${esc(p.name)}">${ICONS.eye}</button>
      </div>
    </div>
    <div class="card-body">
      <div class="card-row"><h3 class="card-title" style="margin:0"><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
        <span class="price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ''}</span></div>
      <div class="card-row"><span class="rating">${starsHtml(p.rating)} ${p.rating} <span>(${p.reviews.toLocaleString()})</span></span>
        <span class="swatches">${(p.finishes || []).map((f) => `<i class="swatch-dot sw-${f}" title="${f}"></i>`).join('')}</span></div>
      ${p.stock <= 7 ? `<span class="stock-low">Only ${p.stock} left</span>` : `<span class="card-sub">${esc(p.tagline)}</span>`}
    </div>
  </article>`;
}

/** 3D tilt + specular glare for any [data-tilt] element. */
export function bindTilt(root = document) {
  if (matchMedia('(hover: none)').matches) return;
  $$('[data-tilt]', root).forEach((el) => {
    if (el._tilt) return; el._tilt = true;
    const max = +(el.dataset.tilt || 7);
    const zone = el.closest('.card') || el;
    zone.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg');
      el.style.setProperty('--gx', x * 100 + '%');
      el.style.setProperty('--gy', y * 100 + '%');
    });
    zone.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/** Delegated card interactions — call once per page. */
function bindCardActions() {
  document.addEventListener('click', (e) => {
    const w = e.target.closest('[data-wish]');
    if (w) {
      e.preventDefault(); e.stopPropagation();
      const on = wishlist.toggle(w.dataset.wish);
      $$(`[data-wish="${w.dataset.wish}"]`).forEach((b) => b.classList.toggle('is-on', on));
      if (on) { const p = byId[w.dataset.wish]; toast({ img: img(p.id), html: `<strong>${esc(p.name)}</strong> saved to your wishlist`, sub: 'We’ll let you know if the price drops' }); }
      return;
    }
    const qa = e.target.closest('[data-quick-add]');
    if (qa) {
      e.preventDefault();
      const p = byId[qa.dataset.quickAdd];
      if (p.options && Object.keys(p.options).some((k) => k !== 'pack')) { quickView(p); return; }
      addToCart({ id: p.id, finish: p.finishes?.[0] || 'polished', opts: p.options ? { pack: p.options.pack[0] } : {} }, qa.closest('.card')?.querySelector('img.main'));
      return;
    }
    const qv = e.target.closest('[data-quick-view]');
    if (qv) { e.preventDefault(); quickView(byId[qv.dataset.quickView]); return; }
    const media = e.target.closest('.card .card-media');
    if (media && !e.target.closest('button, a')) location.href = `product.html?id=${media.closest('.card').dataset.id}`;
  });
}

/* ------------------------------------------------------------------ */
/* Add to cart + fly animation                                         */
/* ------------------------------------------------------------------ */
export function addToCart(item, fromImg, { open = true } = {}) {
  cart.add(item);
  const target = $('#cart-btn');
  const finish = () => {
    const b = $('#cart-count'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    if (open) setTimeout(() => openDrawer('bag'), 120);
  };
  if (fromImg && target && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const a = fromImg.getBoundingClientRect(), b = target.getBoundingClientRect();
    const size = Math.min(a.width, 220);
    const fly = document.createElement('div');
    fly.className = 'fly';
    fly.style.cssText = `left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - size / 2}px;width:${size}px;height:${size}px`;
    fly.innerHTML = `<img src="${fromImg.currentSrc || fromImg.src}" alt="">`;
    document.body.appendChild(fly);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    fly.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 120}px) scale(.6) rotate(-10deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08) rotate(20deg)`, opacity: 0.4 },
    ], { duration: 850, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { fly.remove(); finish(); };
  } else finish();
}

/* ------------------------------------------------------------------ */
/* Chrome                                                              */
/* ------------------------------------------------------------------ */
function announcementHtml() {
  return `<div class="announce" role="region" aria-label="Promotions"><div class="wrap">
    <div class="spot" id="spot" title="Demo silver spot price">Silver spot <strong id="spot-v">$31.42</strong><span class="up" id="spot-d">▲ 0.64%</span></div>
    <div class="announce-rotator" aria-live="polite">
      <div class="is-active"><b>Flash Sale</b> — up to 25% off bestsellers. Ends at midnight.</div>
      <div>Free insured shipping over <b>$150</b> · Free returns for 60 days</div>
      <div><b>Stack &amp; Save</b>: 10% off 2 pieces, 15% off 3+ — applied automatically</div>
      <div>Extra 10% off with code <span class="code">SILVER10</span></div>
    </div>
    <div class="announce-timer">Sale ends in <strong id="bar-timer">--:--:--</strong></div>
  </div></div>`;
}

const NAV = [
  ['shop.html', 'Shop all'], ['shop.html?cat=rings', 'Rings'], ['shop.html?cat=necklaces', 'Necklaces'], ['shop.html?cat=earrings', 'Earrings'],
  ['shop.html?cat=bracelets', 'Bracelets'], ['shop.html?cat=bullion', 'Bullion'],
];

function headerHtml() {
  const featured = ['halo-solitaire', 'infinity-pendant', 'atlas-cuff'].map((id) => byId[id]);
  return `<header class="site-header" id="site-header"><div class="wrap">
    <nav class="nav" aria-label="Primary">
      <div class="nav-item"><a href="shop.html">Shop <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"><path d="m2 3.5 3 3 3-3"/></svg></a>
        <div class="mega"><div class="wrap">
          <div><h4 class="eyebrow">Jewelry</h4><ul>${CATEGORIES.slice(0, 5).map((c) => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join('')}<li><a href="shop.html?sort=new">New arrivals</a></li></ul></div>
          <div><h4 class="eyebrow">More</h4><ul>${CATEGORIES.slice(5).map((c) => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join('')}<li><a href="shop.html?sale=1">Flash sale</a></li><li><a href="shop.html?sort=best">Bestsellers</a></li></ul></div>
          <div class="mega-feature">${featured.map((p) => `<a class="mega-card" href="product.html?id=${p.id}"><img src="${img(p.id, 1)}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.name)}</span></a>`).join('')}</div>
        </div></div>
      </div>
      ${NAV.slice(1, 5).map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
      <a href="shop.html?sale=1" class="is-sale">Sale</a>
    </nav>
    <button class="icon-btn burger" id="burger" aria-label="Open menu">${ICONS.menu}</button>
    <a class="logo" href="index.html" aria-label="Silver Shop — home"><i class="logo-mark" aria-hidden="true"></i><span class="logo-word">Silver <span>shop</span></span></a>
    <div class="header-actions">
      <button class="icon-btn" id="search-btn" aria-label="Search">${ICONS.search}</button>
      <a class="icon-btn hide-sm" href="#" aria-label="Account (demo)">${ICONS.user}</a>
      <button class="icon-btn hide-sm" id="wish-btn" aria-label="Wishlist">${ICONS.heartO}<span class="badge-count" id="wish-count">0</span></button>
      <button class="icon-btn" id="cart-btn" aria-label="Shopping bag">${ICONS.bag}<span class="badge-count" id="cart-count">0</span></button>
    </div>
  </div></header>
  <nav class="mnav" id="mnav" aria-label="Mobile">
    <div class="flex between center" style="margin-bottom:18px"><span class="eyebrow">Menu</span><button class="icon-btn" data-close-mnav aria-label="Close menu">${ICONS.close}</button></div>
    ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="shop.html?cat=home">Home</a><a href="shop.html?sale=1">Flash Sale ⚡</a>
  </nav>`;
}

function footerHtml() {
  return `<footer class="site-footer"><div class="wrap">
    <div class="footer-top">
      <div>
        <p class="eyebrow" style="color:#8a8a92">The Silver Letter</p>
        <h3 class="display h3" style="color:#fff;max-width:16ch;margin-top:14px">First access to drops, private sales &amp; <em class="serif-i">15% off</em> your first order.</h3>
        <form class="newsletter" data-newsletter><input type="email" required placeholder="Email address" aria-label="Email address"><button class="btn btn-silver" type="submit">Join</button></form>
        <p style="font-size:12px;color:#77777f;margin-top:12px">Join 48,000+ subscribers. Unsubscribe anytime.</p>
      </div>
      <div><h5>Shop</h5><ul>${CATEGORIES.map((c) => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join('')}</ul></div>
      <div><h5>Help</h5><ul><li><a href="#">Shipping &amp; delivery</a></li><li><a href="#">60-day returns</a></li><li><a href="#">Ring size guide</a></li><li><a href="#">Lifetime warranty</a></li><li><a href="#">Track your order</a></li><li><a href="#">Contact us</a></li></ul></div>
      <div><h5>Atelier</h5><ul><li><a href="#">Our craft</a></li><li><a href="#">925 explained</a></li><li><a href="#">Recycled silver</a></li><li><a href="#">Engraving</a></li><li><a href="#">Gift cards</a></li><li><a href="#">Journal</a></li></ul></div>
    </div>
    <div class="footer-word" aria-hidden="true">Silver</div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Silver Shop. All rights reserved.</span>
      <span class="demo-note">Demo storefront — no real orders or payments are processed.</span>
      <div class="pay-icons" aria-label="Accepted payment methods (demo)"><span>VISA</span><span>MC</span><span>AMEX</span><span>PAY</span><span>BANK</span></div>
    </div>
  </div></footer>`;
}

function overlaysHtml() {
  return `<div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Shopping bag" aria-hidden="true">
    <div class="drawer-head">
      <div class="drawer-tabs" role="tablist"><button role="tab" data-tab="bag" class="is-active">Bag <span id="dt-bag"></span></button><button role="tab" data-tab="wish">Wishlist <span id="dt-wish"></span></button></div>
      <button class="icon-btn" data-close-drawer aria-label="Close">${ICONS.close}</button>
    </div>
    <div class="drawer-body" id="drawer-body"></div>
    <div class="drawer-foot" id="drawer-foot"></div>
  </aside>
  <div class="search" id="search" role="dialog" aria-label="Search" aria-hidden="true"><div class="wrap">
    <div class="search-top">${ICONS.search.replace('<svg', '<svg width="34" height="34"')}<input id="search-input" placeholder="Search silver…" autocomplete="off" aria-label="Search products"><button class="icon-btn" data-close-search aria-label="Close search">${ICONS.close}</button></div>
    <div class="search-chips"><span class="eyebrow" style="align-self:center;margin-right:8px">Trending</span>${['Hoops', 'Signet', 'Pendant', 'Cuff', 'Coin', 'Gift under $100'].map((t) => `<button class="chip" data-q="${t}">${t}</button>`).join('')}</div>
    <div class="grid grid-4" id="search-results" style="padding-bottom:60px"></div>
  </div></div>
  <div class="modal" id="modal" aria-hidden="true"><div class="modal-backdrop" data-close-modal></div><div class="modal-panel" role="dialog" aria-modal="true"><button class="icon-btn modal-close" data-close-modal aria-label="Close">${ICONS.close}</button><div id="modal-content"></div></div></div>
  <div class="toasts" id="toasts" aria-live="polite"></div>`;
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */
let drawerTab = 'bag';
export function openDrawer(tab = 'bag') {
  drawerTab = tab; renderDrawer();
  $('#drawer').classList.add('is-open'); $('#drawer').setAttribute('aria-hidden', 'false');
  $('#scrim').classList.add('is-open'); document.body.style.overflow = 'hidden';
}
export function closeDrawer() {
  $('#drawer').classList.remove('is-open'); $('#drawer').setAttribute('aria-hidden', 'true');
  $('#scrim').classList.remove('is-open'); $('#mnav')?.classList.remove('is-open'); document.body.style.overflow = '';
}

const optsText = (i) => [i.finish && i.finish !== 'polished' ? i.finish[0].toUpperCase() + i.finish.slice(1) : 'Polished', ...Object.entries(i.opts || {}).map(([k, v]) => (k === 'size' ? 'Size ' + v : v))].join(' · ');

function renderDrawer() {
  $$('.drawer-tabs button').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === drawerTab));
  const body = $('#drawer-body'), foot = $('#drawer-foot');
  if (drawerTab === 'wish') {
    const ids = [...wishlist.ids];
    body.innerHTML = ids.length ? ids.map((id) => { const p = byId[id]; return `<div class="line-item"><a class="thumb" href="product.html?id=${id}"><img src="${img(id)}" alt=""></a><div><div class="li-title">${esc(p.name)}</div><div class="li-meta">${starsHtml(p.rating)} · ${p.stock <= 7 ? `<span class="stock-low">Only ${p.stock} left</span>` : 'In stock'}</div><div class="li-actions"><button class="btn btn-ink btn-sm" data-quick-add="${id}">Add to bag</button><button class="li-remove" data-wish="${id}">Remove</button></div></div><div class="li-price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ''}</div></div>`; }).join('')
      : `<div class="empty">${ICONS.heartO.replace('<svg', '<svg width="56" height="56"')}<h3 class="display h3">Nothing saved yet</h3><p class="muted">Tap the heart on any piece to keep it here.</p><a class="btn btn-ink" href="shop.html">Discover</a></div>`;
    foot.innerHTML = '';
    return;
  }
  const t = cart.totals();
  if (!cart.items.length) {
    body.innerHTML = `<div class="empty"><svg class="ring-icon" viewBox="0 0 96 96"><defs><linearGradient id="rg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8a8a90"/><stop offset=".35" stop-color="#fff"/><stop offset=".6" stop-color="#9a9aa0"/><stop offset="1" stop-color="#e9e9ec"/></linearGradient></defs><ellipse cx="48" cy="50" rx="30" ry="30" fill="none" stroke="url(#rg)" stroke-width="9"/></svg>
      <h3 class="display h3">Your bag is empty</h3><p class="muted">Today’s flash sale ends at midnight — don’t miss it.</p><a class="btn btn-ink" href="shop.html?sale=1">Shop the sale</a></div>`;
    foot.innerHTML = '';
    return;
  }
  const pctFree = Math.min(100, (t.afterDiscount / FREE_SHIP) * 100);
  const stackMsg = t.jewelryQty === 1 ? 'Add <b>1 more piece</b> of jewelry to save <b>10%</b> with Stack &amp; Save.' : t.jewelryQty === 2 ? 'Add <b>1 more piece</b> to unlock <b>15% off</b> everything you stack.' : t.jewelryQty >= 3 ? 'Maximum Stack &amp; Save unlocked: <b>15% off</b> your jewelry.' : '';
  const inCart = new Set(cart.items.map((i) => i.id));
  const ups = ['luna-hoops', 'twist-rope', 'cable-chain', 'starlight-studs', 'care-kit', 'orbit-beads', 'aura-band'].filter((id) => !inCart.has(id)).slice(0, 4).map((id) => byId[id]);
  body.innerHTML = `<div class="freeship"><p>${t.toFree > 0 ? `You’re <strong>${money(t.toFree)}</strong> away from <strong>free insured shipping</strong>` : '<strong>✓ You’ve unlocked free insured shipping</strong>'}</p><div class="meter ${t.toFree ? '' : 'is-full'}"><i style="--v:${pctFree}%"></i></div></div>
    ${cart.items.map((i, idx) => { const l = t.lines[idx]; return `<div class="line-item" data-idx="${idx}">
      <a class="thumb" href="product.html?id=${i.id}"><img src="${img(i.id)}" alt=""></a>
      <div><div class="li-title">${esc(l.p.name)}${i.addon ? ' <span class="tag tag-silver" style="height:18px;font-size:8px">Add-on deal</span>' : ''}</div>
        <div class="li-meta">${esc(optsText(i))}${i.engraving ? `<br>Engraving: “${esc(i.engraving)}” (+${money(ENGRAVE_FEE)})` : ''}</div>
        <div class="li-actions"><div class="qty"><button data-dq="-1" aria-label="Decrease">−</button><input value="${i.qty}" inputmode="numeric" aria-label="Quantity" data-qin><button data-dq="1" aria-label="Increase">+</button></div><button class="li-remove" data-rm>Remove</button></div></div>
      <div class="li-price">${money(l.total)}${l.compare ? `<s>${money(l.compare * i.qty)}</s>` : ''}</div></div>`; }).join('')}
    ${stackMsg ? `<div class="stack-hint"><span class="chip-silver">${t.stackPct || '%'}</span><span>${stackMsg}</span></div>` : ''}
    ${ups.length ? `<div class="upsell"><h5>Complete the look</h5><div class="upsell-row">${ups.map((p) => `<div class="upsell-card"><img src="${img(p.id)}" alt="${esc(p.name)}" loading="lazy"><strong>${esc(p.name)}</strong><span>${money(p.price)}</span><button data-quick-add="${p.id}">+ Add</button></div>`).join('')}</div></div>` : ''}`;
  foot.innerHTML = `
    ${t.stack ? `<div class="sum-row discount"><span>Stack &amp; Save (${t.stackPct}%)</span><span>−${money2(t.stack)}</span></div>` : ''}
    ${t.promoAmt ? `<div class="sum-row discount"><span>Code ${t.promo}</span><span>−${money2(t.promoAmt)}</span></div>` : ''}
    ${t.compareSavings + t.discount > 0 ? `<div class="sum-row" style="font-size:12.5px;color:var(--ok)"><span>You’re saving</span><span>${money2(t.compareSavings + t.discount)}</span></div>` : ''}
    <div class="sum-row total"><span>Subtotal</span><span>${money2(t.afterDiscount)}</span></div>
    <p style="margin:-4px 0 0;font-size:12px;color:var(--muted)">Shipping &amp; taxes calculated at checkout · or 4 interest-free payments of ${money2(t.afterDiscount / 4)}</p>
    <a class="btn btn-ink btn-lg btn-block" href="checkout.html">${ICONS.lock} Secure checkout · ${money2(t.afterDiscount)}</a>
    <div class="express"><button class="pay-btn dark" data-express>Express Pay</button><button class="pay-btn" data-express>Pay in 4</button></div>
    <div class="secure-note">${ICONS.shield} 60-day free returns · Lifetime warranty</div>`;
}

function bindDrawer() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-drawer]') || e.target.id === 'scrim') closeDrawer();
    const tab = e.target.closest('.drawer-tabs [data-tab]');
    if (tab) { drawerTab = tab.dataset.tab; renderDrawer(); }
    const li = e.target.closest('.line-item[data-idx]');
    if (li) {
      const idx = +li.dataset.idx;
      const dq = e.target.closest('[data-dq]');
      if (dq) cart.setQty(idx, cart.items[idx].qty + +dq.dataset.dq);
      if (e.target.closest('[data-rm]')) { li.classList.add('is-removing'); setTimeout(() => cart.remove(idx), 400); }
    }
    if (e.target.closest('[data-express]')) location.href = 'checkout.html?express=1';
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-qin]')) { const li = e.target.closest('.line-item'); cart.setQty(+li.dataset.idx, parseInt(e.target.value, 10) || 0); }
  });
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */
function bindSearch() {
  const s = $('#search'), input = $('#search-input'), out = $('#search-results');
  const open = () => { s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; setTimeout(() => input.focus(), 50); run(''); };
  const close = () => { s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  const run = (q) => {
    q = q.trim().toLowerCase();
    let list = PRODUCTS;
    if (q === 'gift under $100') list = PRODUCTS.filter((p) => p.price < 100);
    else if (q) list = PRODUCTS.filter((p) => (p.name + ' ' + p.category + ' ' + p.tagline + ' ' + p.description).toLowerCase().includes(q.replace(/s$/, '')));
    else list = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8);
    out.innerHTML = list.length ? list.slice(0, 12).map((p) => productCard(p)).join('') : `<p class="muted" style="grid-column:1/-1">No results for “${esc(q)}”. Try “ring” or “chain”.</p>`;
    bindTilt(out);
  };
  $('#search-btn').addEventListener('click', open);
  input.addEventListener('input', () => run(input.value));
  s.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-search]')) close();
    const chip = e.target.closest('[data-q]'); if (chip) { input.value = chip.dataset.q; run(chip.dataset.q); }
    if (e.target.closest('.card a, [data-quick-view]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); closeDrawer(); closeModal(); }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
  });
}

/* ------------------------------------------------------------------ */
/* Modal + quick view                                                  */
/* ------------------------------------------------------------------ */
export function openModal(html, cls = '') {
  const m = $('#modal');
  m.className = 'modal ' + cls;
  $('#modal-content').innerHTML = html;
  requestAnimationFrame(() => { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); });
  document.body.style.overflow = 'hidden';
  return m;
}
export function closeModal() {
  const m = $('#modal'); if (!m?.classList.contains('is-open')) return;
  m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
}

export function optionPickers(p, state) {
  const parts = [];
  if (p.finishes?.length) parts.push(`<div><div class="opt-label"><span>Finish: <b data-finish-label>${({ polished: 'Mirror Polished', brushed: 'Satin Brushed', oxidized: 'Oxidized' })[state.finish]}</b></span></div>
    <div class="finish-pick">${p.finishes.map((f) => `<button type="button" data-finish="${f}" class="${f === state.finish ? 'is-active' : ''}" aria-label="${f}"><span class="sw-${f}"></span></button>`).join('')}</div></div>`);
  for (const [k, vals] of Object.entries(p.options || {})) {
    const label = { size: 'Size', length: 'Length', pack: 'Pack' }[k];
    parts.push(`<div><div class="opt-label"><span>${label}: <b data-opt-label="${k}">${state.opts[k] || 'Select'}</b></span>${k === 'size' ? '<button type="button" data-size-guide>Size guide</button>' : ''}</div>
      <div class="size-pick" data-opt="${k}">${vals.map((v, i) => `<button type="button" data-val="${esc(v)}" class="${state.opts[k] === v ? 'is-active' : ''} ${(p.id.length + i) % 5 === 1 ? 'is-low' : ''}">${esc(v)}${p.optionPrices?.[k]?.[v] ? ` · ${money(p.optionPrices[k][v])}` : k === 'pack' ? ` · ${money(p.price)}` : ''}</button>`).join('')}</div></div>`);
  }
  return parts.join('');
}
export function bindPickers(root, p, state, onChange = () => {}) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-finish]');
    if (f) {
      state.finish = f.dataset.finish;
      $$('[data-finish]', root).forEach((b) => b.classList.toggle('is-active', b === f));
      const l = $('[data-finish-label]', root); if (l) l.textContent = ({ polished: 'Mirror Polished', brushed: 'Satin Brushed', oxidized: 'Oxidized' })[state.finish];
      onChange('finish');
    }
    const v = e.target.closest('[data-opt] [data-val]');
    if (v) {
      const k = v.parentElement.dataset.opt;
      state.opts[k] = v.dataset.val;
      $$('[data-val]', v.parentElement).forEach((b) => b.classList.toggle('is-active', b === v));
      const l = $(`[data-opt-label="${k}"]`, root); if (l) l.textContent = v.dataset.val;
      onChange(k);
    }
    if (e.target.closest('[data-size-guide]')) sizeGuide();
  });
}
export function missingOption(root, p, state) {
  for (const k of Object.keys(p.options || {})) if (!state.opts[k]) {
    const el = $(`[data-opt="${k}"]`, root); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    return k;
  }
  return null;
}

export function sizeGuide() {
  const rows = [['5', '15.7', '49.3'], ['6', '16.5', '51.9'], ['7', '17.3', '54.4'], ['8', '18.1', '57.0'], ['9', '18.9', '59.5'], ['10', '19.8', '62.1'], ['11', '20.6', '64.6'], ['12', '21.4', '67.2']];
  openModal(`<div style="padding:40px"><p class="eyebrow">Fit guide</p><h2 class="display h2" style="margin:10px 0 18px">Find your size</h2>
    <p class="muted">Wrap a strip of paper around the base of your finger, mark where it overlaps and measure the length in mm. Between sizes? Size up — and remember, resizing is free for life.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:18px;font-variant-numeric:tabular-nums">${'<tr style="text-align:left"><th style="padding:10px 0;border-bottom:1px solid var(--ink)">US</th><th style="border-bottom:1px solid var(--ink)">Diameter (mm)</th><th style="border-bottom:1px solid var(--ink)">Circumference (mm)</th></tr>' + rows.map((r) => `<tr>${r.map((c) => `<td style="padding:10px 0;border-bottom:1px solid var(--line)">${c}</td>`).join('')}</tr>`).join('')}</table></div>`, 'modal-sm');
}

export function quickView(p) {
  const state = { finish: p.finishes?.[0] || 'polished', opts: {} };
  if (p.options?.pack) state.opts.pack = p.options.pack[0];
  const m = openModal(`<div class="qv">
    <div class="qv-media" data-tilt="5"><div class="card-badges">${p.flash ? `<span class="tag tag-flash">Flash −${pct(p)}%</span>` : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}</div><img src="${img(p.id, 1)}" alt="${esc(p.name)}"></div>
    <div class="qv-body">
      <span class="rating">${starsHtml(p.rating)} ${p.rating} · ${p.reviews.toLocaleString()} reviews</span>
      <h2 class="display h2">${esc(p.name)}</h2>
      <div class="price" style="font-size:22px">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s><span class="save">Save ${money(p.compareAt - p.price)}</span>` : ''}</div>
      <p class="muted" style="margin:0">${esc(p.description)}</p>
      ${optionPickers(p, state)}
      ${p.stock <= 7 ? `<span class="stock-low">Hurry — only ${p.stock} left in stock</span>` : ''}
      <button class="btn btn-ink btn-lg btn-block" data-qv-add>${ICONS.bag} Add to bag — ${money(p.price)}</button>
      <a class="btn-link" href="product.html?id=${p.id}">View full details ${ICONS.arrow}</a>
    </div></div>`);
  const panel = $('#modal-content');
  bindTilt(panel);
  bindPickers(panel, p, state);
  $('[data-qv-add]', panel).addEventListener('click', () => {
    if (missingOption(panel, p, state)) return;
    const from = $('.qv-media img', panel).getBoundingClientRect();
    closeModal();
    const ghost = new Image(); ghost.src = img(p.id);
    Object.assign(ghost.style, { position: 'fixed', left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', opacity: 0 });
    document.body.appendChild(ghost);
    addToCart({ id: p.id, finish: state.finish, opts: { ...state.opts } }, ghost);
    setTimeout(() => ghost.remove(), 1200);
  });
  return m;
}

/* ------------------------------------------------------------------ */
/* Toasts, social proof, lead capture                                  */
/* ------------------------------------------------------------------ */
export function toast({ img: src, html, sub, dark = false, icon = null, timeout = 5200 }) {
  const t = document.createElement('div');
  t.className = 'toast' + (dark ? ' toast-ink' : '');
  t.innerHTML = `${src ? `<img src="${src}" alt="">` : icon ? `<span style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--silver-soft);color:var(--ink)">${icon}</span>` : '<span></span>'}<div><p>${html}</p>${sub ? `<small>${sub}</small>` : ''}</div><button class="x" aria-label="Dismiss">${ICONS.close.replace('<svg', '<svg width="14" height="14"')}</button>`;
  $('#toasts').appendChild(t);
  const kill = () => { t.classList.add('is-out'); setTimeout(() => t.remove(), 500); };
  t.querySelector('.x').onclick = kill;
  setTimeout(kill, timeout);
  return t;
}

function socialProof() {
  if (document.body.dataset.noProof !== undefined) return;
  let n = 0;
  const next = () => {
    if (document.hidden || $('#modal.is-open') || $('#drawer.is-open')) return schedule(8000);
    const pool = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 14);
    const p = pool[Math.floor(Math.random() * pool.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const mins = 1 + Math.floor(Math.random() * 18);
    toast({ img: img(p.id), html: `Someone in <strong>${city}</strong> just bought <strong>${esc(p.name)}</strong>`, sub: `${mins} min ago · Verified purchase` });
    if (++n < 6) schedule(26000 + Math.random() * 18000);
  };
  const schedule = (ms) => setTimeout(next, ms);
  schedule(14000);
}

function leadCapture() {
  if (document.body.dataset.noPopup !== undefined || store.get('lead', false)) return;
  let shown = false;
  const show = () => {
    if (shown || $('#modal.is-open') || $('#drawer.is-open')) return;
    shown = true; store.set('lead', true);
    openModal(`<div class="lead-art"><span class="big silver-text">15%</span><img src="${img('halo-solitaire', 1)}" alt=""></div>
      <div class="lead-body"><p class="eyebrow">Before you go</p><h2 class="display h2">Unlock <em class="serif-i">15% off</em> your first piece</h2>
      <p class="muted" style="margin:0">Join The Silver Letter for early access to drops and private sales. Your code arrives instantly.</p>
      <form data-lead class="grid" style="gap:10px"><div class="field"><input type="email" id="lead-email" placeholder=" " required><label for="lead-email">Email address</label></div><button class="btn btn-ink btn-lg btn-block shine">Reveal my code</button></form>
      <div class="code-reveal" id="code-reveal"><span>WELCOME15</span><button class="btn btn-ink btn-sm" data-apply-code="WELCOME15">Apply</button></div>
      <button data-close-modal class="muted" style="font-size:12px;text-decoration:underline;text-underline-offset:3px;justify-self:start">No thanks, I’ll pay full price</button></div>`, 'lead-pop');
    $('[data-lead]').addEventListener('submit', (e) => { e.preventDefault(); e.target.classList.add('hide'); $('#code-reveal').classList.add('is-on'); confetti({ count: 80 }); });
  };
  setTimeout(show, 38000);
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8 && performance.now() > 8000) show(); });
}

/* ------------------------------------------------------------------ */
/* Effects                                                             */
/* ------------------------------------------------------------------ */
export function reveal(root = document) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal, .reveal-mask, [data-reveal]', root).forEach((el) => io.observe(el));
}

export function countUp(el, to, { dur = 1600, fmt = (v) => Math.round(v).toLocaleString() } = {}) {
  const from = 0, t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/** Silver confetti burst. */
export function confetti({ count = 160, x = 0.5, y = 0.35 } = {}) {
  const c = document.createElement('canvas'); c.className = 'confetti';
  const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; document.body.appendChild(c);
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth * x, y: innerHeight * y, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4,
    w: 6 + Math.random() * 8, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    shade: Math.random(), dark: Math.random() < 0.18,
  }));
  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.38; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      const s = Math.abs(Math.cos(p.r * 2));
      const g = p.dark ? 20 : 150 + Math.floor(105 * (0.5 + 0.5 * Math.sin(p.r * 3 + p.shade * 6)));
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = `rgb(${g},${g},${g + 4})`;
      ctx.fillRect(-p.w / 2, (-p.h / 2) * s, p.w, p.h * s); ctx.restore();
    }
    if (++frame < 220) requestAnimationFrame(tick); else c.remove();
  };
  tick();
}

function spotTicker() {
  let v = 31.42, base = 31.22;
  setInterval(() => {
    v = Math.max(29, v + (Math.random() - 0.48) * 0.03);
    const d = ((v - base) / base) * 100;
    const el = $('#spot-v'); if (!el) return;
    el.textContent = '$' + v.toFixed(2);
    const dd = $('#spot-d'); dd.className = d >= 0 ? 'up' : 'down'; dd.textContent = `${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(2)}%`;
  }, 2600);
}

function rotator() {
  const items = $$('.announce-rotator > div'); let i = 0;
  setInterval(() => {
    const cur = items[i]; cur.classList.remove('is-active'); cur.classList.add('is-out');
    setTimeout(() => cur.classList.remove('is-out'), 700);
    i = (i + 1) % items.length; items[i].classList.add('is-active');
  }, 4200);
  const t = $('#bar-timer');
  const tick = () => { const r = remaining(); t.textContent = `${pad(r.h)}:${pad(r.m)}:${pad(r.s)}`; };
  tick(); setInterval(tick, 1000);
}

/* Magnetic buttons */
function magnetic() {
  if (matchMedia('(hover: none)').matches) return;
  document.addEventListener('pointermove', (e) => {
    const b = e.target.closest('[data-magnetic]');
    $$('[data-magnetic].is-mag').forEach((x) => { if (x !== b) { x.style.transform = ''; x.classList.remove('is-mag'); } });
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.classList.add('is-mag');
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
function updateCounts() {
  const c = cart.count(), w = wishlist.ids.size;
  const cc = $('#cart-count'), wc = $('#wish-count');
  if (cc) { cc.textContent = c; cc.classList.toggle('has', c > 0); }
  if (wc) { wc.textContent = w; wc.classList.toggle('has', w > 0); }
  const db = $('#dt-bag'), dw = $('#dt-wish');
  if (db) db.textContent = c ? `(${c})` : '';
  if (dw) dw.textContent = w ? `(${w})` : '';
}

export function boot({ chrome = true } = {}) {
  if (chrome) {
    document.body.insertAdjacentHTML('afterbegin', announcementHtml() + headerHtml());
    document.body.insertAdjacentHTML('beforeend', footerHtml());
  }
  document.body.insertAdjacentHTML('beforeend', overlaysHtml());
  if (chrome) {
    rotator(); spotTicker(); bindSearch();
    const h = $('#site-header');
    const onScroll = () => h.classList.toggle('is-scrolled', scrollY > 10);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    $('#cart-btn').addEventListener('click', () => openDrawer('bag'));
    $('#wish-btn').addEventListener('click', () => openDrawer('wish'));
    $('#burger').addEventListener('click', () => { $('#mnav').classList.add('is-open'); $('#scrim').classList.add('is-open'); });
    document.addEventListener('click', (e) => { if (e.target.closest('[data-close-mnav]')) closeDrawer(); });
    socialProof(); leadCapture();
  }
  bindDrawer(); bindCardActions(); magnetic();
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) closeModal();
    const ap = e.target.closest('[data-apply-code]');
    if (ap) {
      const r = cart.applyPromo(ap.dataset.applyCode);
      closeModal();
      toast({ icon: ICONS.sparkle, html: r.ok ? `<strong>${ap.dataset.applyCode}</strong> will be applied at checkout` : r.msg, sub: r.ok ? 'Saved to your bag' : '' , dark: true });
    }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.matches('[data-newsletter]')) { e.preventDefault(); e.target.reset(); toast({ icon: ICONS.sparkle, html: '<strong>Welcome to The Silver Letter.</strong> Your 15% code: <strong>WELCOME15</strong>', sub: 'Also saved to your bag', dark: true }); cart.applyPromo('WELCOME15'); }
  });
  on('cart', () => { updateCounts(); if ($('#drawer')?.classList.contains('is-open')) renderDrawer(); });
  on('wish', () => { updateCounts(); if ($('#drawer')?.classList.contains('is-open')) renderDrawer(); });
  addEventListener('storage', (e) => { if (e.key === 'ss:cart') { cart.items = store.get('cart', []); cart.promo = store.get('promo', null); emit('cart', cart); } });
  updateCounts();
  bindTilt(); reveal();
}
