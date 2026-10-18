/* Silver Shop — shared storefront engine: state, pricing, accounts, chrome (header/footer/drawer), and UI effects. */
import { PRODUCTS, CATEGORIES, byId, img, CITIES } from './products.js';

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const money = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
export const money2 = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** Read a page parameter from the query string, falling back to the hash (#id=…). */
export const param = (k) => {
  const s = new URLSearchParams(location.search);
  if (s.has(k)) return s.get(k);
  return new URLSearchParams(location.hash.slice(1)).get(k);
};
export const isPhone = () => matchMedia('(max-width: 760px)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('ss:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ss:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const session = {
  get(k, d) { try { const v = sessionStorage.getItem('ss:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { sessionStorage.setItem('ss:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
export { store, session };
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
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.3l8.4 4.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 4h4.5a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h10"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
  cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20.5h16M5 20.5v-7h14v7M5 16.5c2.3 0 2.3-1.5 4.7-1.5s2.3 1.5 4.6 1.5 2.4-1.5 4.7-1.5M12 13.5V10M12 7.5c-.9 0-1.5-.7-1.2-1.6L12 3.5l1.2 2.4c.3.9-.3 1.6-1.2 1.6Z"/></svg>',
};
export const checkSvg = '<svg viewBox="0 0 12 12"><path d="M2 6.2 4.8 9 10 3.2"/></svg>';

/* ------------------------------------------------------------------ */
/* Pricing & cart                                                      */
/* ------------------------------------------------------------------ */
export const FREE_SHIP = 150;
export const FREE_GIFT = 250;
export const ENGRAVE_FEE = 15;
export const POINT_VALUE = 0.05;      // 1 Silver Point = 5¢; members earn 1 point per $1 (5% back)
export const WELCOME_POINTS = 250;    // = $12.50 off the first order
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
/** Sensible default options for one-tap adds (size 7, 18" chain, medium wrist, single coin). */
export function defaultOpts(p) {
  const o = {};
  for (const [k, v] of Object.entries(p.options || {})) o[k] = k === 'size' ? (v.includes('7') ? '7' : v[1]) : k === 'length' ? '18"' : v[0];
  return o;
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
  /** Full price breakdown. shipping: method id, country: tax region, points: Silver Points to redeem. */
  totals({ shipping = null, country = 'US', giftWrap = false, promo = this.promo, points = 0 } = {}) {
    const lines = this.items.filter((i) => byId[i.id]).map((i) => {
      const p = byId[i.id];
      const base = i.addon ? p.addon : unitPrice(p, i.opts);
      const unit = base + (i.engraving ? ENGRAVE_FEE : 0);
      return { ...i, p, unit, compare: p.compareAt && !i.addon ? p.compareAt + (i.engraving ? ENGRAVE_FEE : 0) : null, total: unit * i.qty };
    });
    const merch = lines.reduce((s, l) => s + l.total, 0);
    const compareSavings = lines.reduce((s, l) => s + (l.compare ? (l.compare - l.unit) * l.qty : 0), 0);
    const jew = lines.filter((l) => JEWELRY.has(l.p.category));
    const jewelryQty = jew.reduce((s, l) => s + l.qty, 0);
    const stackPct = jewelryQty >= 3 ? 15 : jewelryQty >= 2 ? 10 : 0;
    const stack = Math.round(jew.reduce((s, l) => s + l.total, 0) * stackPct) / 100;
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
    const pointsAmt = Math.floor(Math.min(points * POINT_VALUE, afterDiscount) * 100) / 100;
    const pointsUsed = Math.ceil(pointsAmt / POINT_VALUE - 1e-9);
    const net = afterDiscount - pointsAmt;
    const freeGift = afterDiscount >= FREE_GIFT;
    const methods = shippingMethods(afterDiscount, promoShip);
    const ship = shipping ? (methods.find((m) => m.id === shipping) || methods[0]) : null;
    const shipCost = ship ? ship.price : 0;
    const wrap = giftWrap ? 6 : 0;
    const rate = TAX[country]?.rate ?? 0.08;
    const tax = Math.round((net + shipCost + wrap) * rate * 100) / 100;
    const total = net + shipCost + wrap + (shipping ? tax : 0);
    return {
      lines, merch, compareSavings, stackPct, stack, jewelryQty, promo: pr ? promo : null, promoAmt, promoShip, discount, afterDiscount,
      pointsAmt, pointsUsed, net, freeGift, methods, ship, shipCost, wrap, tax, rate, total,
      earn: Math.floor(net), toFree: Math.max(0, FREE_SHIP - afterDiscount), toGift: Math.max(0, FREE_GIFT - afterDiscount),
    };
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
export const fmtDate = (d, o = { weekday: 'short', month: 'short', day: 'numeric' }) => new Date(d).toLocaleDateString('en-US', o);
/** Next dispatch: today before 3pm on a weekday, otherwise the next business day. */
export function dispatchDate(now = new Date()) { return now.getHours() < 15 && now.getDay() % 6 ? new Date(now) : addBusinessDays(now, 1); }

export function shippingMethods(sub, freeExpress = false) {
  const d = dispatchDate();
  return [
    { id: 'standard', name: 'Standard', desc: 'Tracked & insured', price: sub >= FREE_SHIP ? 0 : 8, eta: [addBusinessDays(d, 3), addBusinessDays(d, 5)] },
    { id: 'express', name: 'Express', desc: 'Priority, signature on delivery', price: freeExpress ? 0 : 18, eta: [addBusinessDays(d, 1), addBusinessDays(d, 2)] },
    { id: 'nextday', name: 'Next Day', desc: 'Order before 3pm', price: 32, eta: [addBusinessDays(d, 1), addBusinessDays(d, 1)] },
  ];
}

/* ------------------------------------------------------------------ */
/* Accounts (demo: stored in this browser only, passwords salted+hashed) */
/* ------------------------------------------------------------------ */
const norm = (e) => String(e || '').trim().toLowerCase();
async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw);
  try {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 5381; for (const b of data) h = ((h * 33) ^ b) >>> 0;
    return 'f' + h.toString(16);
  }
}
export const TIERS = [
  { id: 'sterling', name: 'Sterling', min: 0, perk: '1 point per $1 · birthday gift' },
  { id: 'fine', name: 'Fine Silver', min: 500, perk: '1.25× points · free express shipping' },
  { id: 'britannia', name: 'Britannia', min: 1500, perk: '1.5× points · private sales · free engraving' },
];
export const account = {
  users: store.get('users', {}),
  session: store.get('session', null),
  get user() { return (this.session && this.users[this.session]) || null; },
  save() { store.set('users', this.users); store.set('session', this.session); emit('account', this.user); },
  exists(email) { return !!this.users[norm(email)]; },
  async register({ first, last, email, password, birthday = '', news = true, phone = '' }) {
    const key = norm(email);
    if (this.users[key]) return { ok: false, msg: 'An account with this email already exists. Sign in instead.' };
    const salt = crypto.getRandomValues ? [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16)).join('') : String(Math.random());
    this.users[key] = { first: first.trim(), last: last.trim(), email: key, salt, pw: await hashPw(password, salt), birthday, news, phone, created: Date.now(), points: WELCOME_POINTS, lifetime: 0, orders: [], addresses: [], history: [{ at: Date.now(), pts: WELCOME_POINTS, note: 'Welcome to the Silver Club' }] };
    this.session = key; this.save();
    return { ok: true };
  },
  async login(email, password) {
    const u = this.users[norm(email)];
    if (!u) return { ok: false, field: 'email', msg: 'We couldn’t find an account with that email.' };
    if (u.pw !== await hashPw(password, u.salt)) return { ok: false, field: 'password', msg: 'That password doesn’t match. Try again or reset it.' };
    this.session = u.email; this.save();
    return { ok: true };
  },
  async checkPassword(pw) { const u = this.user; return !!u && u.pw === await hashPw(pw, u.salt); },
  async setPassword(pw, email = this.session) { const u = this.users[norm(email)]; if (!u) return false; u.pw = await hashPw(pw, u.salt); this.save(); return true; },
  logout() { this.session = null; this.save(); },
  update(fields) {
    const u = this.user; if (!u) return { ok: false };
    if (fields.email && norm(fields.email) !== u.email) {
      const k = norm(fields.email);
      if (this.users[k]) return { ok: false, msg: 'Another account already uses that email.' };
      delete this.users[u.email]; u.email = k; this.users[k] = u; this.session = k; delete fields.email;
    }
    Object.assign(u, fields); this.save();
    return { ok: true };
  },
  remove() { delete this.users[this.session]; this.session = null; this.save(); },
  tier(u = this.user) { return [...TIERS].reverse().find((t) => (u?.lifetime || 0) >= t.min) || TIERS[0]; },
  nextTier(u = this.user) { return TIERS.find((t) => t.min > (u?.lifetime || 0)) || null; },
  addPoints(pts, note) { const u = this.user; if (!u || !pts) return; u.points = Math.max(0, u.points + pts); if (pts > 0) u.lifetime += pts; u.history.unshift({ at: Date.now(), pts, note }); this.save(); },
  initials(u = this.user) { return u ? ((u.first[0] || '') + (u.last[0] || '')).toUpperCase() : ''; },
};

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
      if (b.textContent !== v) b.innerHTML = `<span class="flip">${v}</span>`;
    }
  };
  tick(); setInterval(tick, 1000);
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */
export const pct = (p) => (p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0);
export const starsHtml = (r) => `<span class="stars" style="--pct:${(r / 5) * 100}%" aria-label="${r} out of 5 stars"></span>`;
const shortOpt = (v) => String(v).split(' ·')[0];

export function productCard(p, { lazy = true } = {}) {
  const badges = [];
  if (p.flash) badges.push(`<span class="tag tag-flash">Flash −${pct(p)}%</span>`);
  else if (p.badge) badges.push(`<span class="tag ${p.isNew ? 'tag-silver' : ''}">${esc(p.badge)}</span>`);
  if (p.isNew && p.badge !== 'New') badges.push('<span class="tag tag-silver">New</span>');
  const k = p.options?.size ? 'size' : p.options?.length ? 'length' : null;
  const actions = k
    ? `<div class="quick-sizes" role="group" aria-label="Add ${esc(p.name)} in ${k}"><span>Add ${k}</span>${p.options[k].map((v) => `<button type="button" data-qs="${p.id}" data-k="${k}" data-v="${esc(v)}">${esc(shortOpt(v))}</button>`).join('')}</div>`
    : `<button class="btn btn-ink" data-quick-add="${p.id}">${ICONS.bag} Add to bag</button>`;
  return `<article class="card" data-id="${p.id}">
    <div class="card-media" data-tilt>
      <div class="card-badges">${badges.join('')}</div>
      <button class="wish ${wishlist.has(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save ${esc(p.name)} to wishlist">${ICONS.heart}</button>
      <img class="main" src="${img(p.id, 1)}" alt="${esc(p.name)} in sterling silver" ${lazy ? 'loading="lazy"' : ''} width="1100" height="1100">
      <img class="alt" src="${img(p.id, 2)}" alt="" aria-hidden="true" loading="lazy" width="1100" height="1100">
      <div class="card-actions">${actions}<button class="btn btn-silver" data-quick-view="${p.id}" aria-label="Quick view ${esc(p.name)}">${ICONS.eye}</button></div>
      <button class="qa-mobile" data-quick-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">${ICONS.plus}</button>
    </div>
    <div class="card-body">
      <div class="card-row"><h3 class="card-title"><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
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

/** Delegated card interactions — bound once per page. */
function bindCardActions() {
  document.addEventListener('click', (e) => {
    const w = e.target.closest('[data-wish]');
    if (w) {
      e.preventDefault(); e.stopPropagation();
      const on = wishlist.toggle(w.dataset.wish);
      $$(`[data-wish="${w.dataset.wish}"]`).forEach((b) => b.classList.toggle('is-on', on));
      if (on) { const p = byId[w.dataset.wish]; toast({ img: img(p.id), html: `<strong>${esc(p.name)}</strong> saved`, sub: 'We’ll tell you if the price drops', timeout: 3200 }); }
      return;
    }
    const qs = e.target.closest('[data-qs]');
    if (qs) {
      e.preventDefault();
      const p = byId[qs.dataset.qs];
      addToCart({ id: p.id, finish: p.finishes?.[0] || 'polished', opts: { ...defaultOpts(p), [qs.dataset.k]: qs.dataset.v } }, qs.closest('.card')?.querySelector('img.main'));
      return;
    }
    const qa = e.target.closest('[data-quick-add]');
    if (qa) {
      e.preventDefault();
      const p = byId[qa.dataset.quickAdd];
      if (p.options?.size || p.options?.length) { quickView(p); return; }
      addToCart({ id: p.id, finish: p.finishes?.[0] || 'polished', opts: defaultOpts(p) }, qa.closest('.card, .upsell-card, .gap-fill')?.querySelector('img'));
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
const bagTarget = () => ['#tab-bag', '#cart-btn'].map((s) => $(s)).find((el) => el && el.offsetParent !== null && el.getBoundingClientRect().width);

export function addToCart(item, fromImg, { open = true } = {}) {
  cart.add(item);
  const target = bagTarget();
  const finish = () => {
    $$('.js-cart-count').forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    if (!open || $('#drawer.is-open')) return;
    if (isPhone()) setTimeout(() => addedSheet(item), 120);
    else setTimeout(() => openDrawer('bag'), 120);
  };
  if (fromImg && target && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const a = fromImg.getBoundingClientRect(), b = target.getBoundingClientRect();
    const size = Math.min(a.width, 200);
    const fly = document.createElement('div');
    fly.className = 'fly';
    fly.style.cssText = `left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - size / 2}px;width:${size}px;height:${size}px`;
    fly.innerHTML = `<img src="${img(item.id)}" alt="">`;
    document.body.appendChild(fly);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = fly.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 110}px) scale(.55) rotate(-10deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08) rotate(20deg)`, opacity: 0.3 },
    ], { duration: 780, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = () => { fly.remove(); finish(); };
  } else finish();
}

/* ------------------------------------------------------------------ */
/* Reward meter & gap filler (shared by drawer, sheet and checkout)    */
/* ------------------------------------------------------------------ */
export function rewardMeter(t) {
  const v = Math.min(100, (t.afterDiscount / FREE_GIFT) * 100), m1 = (FREE_SHIP / FREE_GIFT) * 100;
  const msg = t.toFree > 0 ? `You’re <b>${money(t.toFree)}</b> away from <b>free insured shipping</b>`
    : t.toGift > 0 ? `Free shipping unlocked · <b>${money(t.toGift)}</b> more for a <b>free Silver Care Kit</b>`
      : '<b>Free shipping + a free Silver Care Kit</b> — both unlocked';
  return `<div class="reward"><p>${msg}</p><div class="meter tiered ${t.toGift ? '' : 'is-full'}"><i style="--v:${v}%"></i>
    <span class="mk ${t.toFree ? '' : 'on'}" style="left:${m1}%" title="Free shipping at ${money(FREE_SHIP)}">${ICONS.truck}</span>
    <span class="mk ${t.toGift ? '' : 'on'}" style="left:100%" title="Free gift at ${money(FREE_GIFT)}">${ICONS.gift}</span></div></div>`;
}
export function gapPick(t) {
  const gap = t.toFree > 0 ? t.toFree : t.toGift > 0 ? t.toGift : 0;
  if (!gap) return null;
  const inCart = new Set(cart.items.map((i) => i.id));
  const pool = PRODUCTS.filter((p) => !inCart.has(p.id) && !p.options?.size && !p.options?.length && p.id !== 'cast-bar').sort((a, b) => a.price - b.price);
  const p = pool.find((x) => x.price >= gap) || pool[pool.length - 1];
  return p ? { p, gap, goal: t.toFree > 0 ? 'free shipping' : 'your free gift' } : null;
}
export function gapFillHtml(t) {
  const g = gapPick(t); if (!g) return '';
  return `<div class="gap-fill"><img src="${img(g.p.id)}" alt=""><div><small>Unlock ${g.goal} with</small><b>${esc(g.p.name)}</b><span>${money(g.p.price)}${g.p.compareAt ? ` <s>${money(g.p.compareAt)}</s>` : ''}</span></div><button type="button" data-quick-add="${g.p.id}" aria-label="Add ${esc(g.p.name)}">${ICONS.plus}</button></div>`;
}
export function pointsLine(t) {
  const u = account.user;
  if (!t.earn) return '';
  return u ? `<div class="points-line">${ICONS.sparkle}<span>You’ll earn <b>${t.earn} Silver Points</b> · worth ${money2(t.earn * POINT_VALUE)} next time</span></div>`
    : `<a class="points-line" href="account.html#join" data-remember-next>${ICONS.sparkle}<span>Members earn <b>${t.earn} points</b> here + <b>$12.50</b> welcome credit · <u>Join free</u></span></a>`;
}

/* ------------------------------------------------------------------ */
/* Chrome                                                              */
/* ------------------------------------------------------------------ */
function announcementHtml() {
  const msg = (lg, sm) => `<span class="lg">${lg}</span><span class="sm">${sm}</span>`;
  return `<div class="announce" role="region" aria-label="Promotions"><div class="wrap">
    <div class="spot" id="spot" title="Demo silver spot price">Silver spot <strong id="spot-v">$31.42</strong><span class="up" id="spot-d">▲ 0.64%</span></div>
    <div class="announce-rotator" aria-live="polite">
      <div class="is-active">${msg('<b>Flash Sale</b> — up to 25% off bestsellers. Ends at midnight.', '<b>Flash Sale</b> · up to 25% off · ends <span class="js-mini-timer"></span>')}</div>
      <div>${msg('Free insured shipping over <b>$150</b> · Free gift over <b>$250</b>', 'Free shipping over <b>$150</b> · gift over <b>$250</b>')}</div>
      <div>${msg('<b>Stack &amp; Save</b>: 10% off 2 pieces, 15% off 3+ — applied automatically', '<b>Stack &amp; Save</b> · 10% off 2, 15% off 3+')}</div>
      <div>${msg('Join the Silver Club: <b>$12.50 off</b> your first order + 5% back in points', 'Silver Club: <b>$12.50 off</b> + 5% back')}</div>
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
          <div class="mega-feature">${featured.map((p) => `<a class="mega-card" href="product.html?id=${p.id}"><img src="${img(p.id, 1)}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.name)}</span><em>${money(p.price)}</em></a>`).join('')}</div>
        </div></div>
      </div>
      ${NAV.slice(1, 5).map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
      <a href="shop.html?sale=1" class="is-sale">Sale</a>
    </nav>
    <button class="icon-btn burger" id="burger" aria-label="Open menu">${ICONS.menu}</button>
    <a class="logo" href="index.html" aria-label="Silver Shop — home"><i class="logo-mark" aria-hidden="true"></i><span class="logo-word">Silver <span>shop</span></span></a>
    <div class="header-actions">
      <button class="icon-btn hd-search" id="search-btn" aria-label="Search">${ICONS.search}</button>
      <a class="icon-btn acct-btn" id="acct-btn" href="account.html" aria-label="Account">${ICONS.user}</a>
      <button class="icon-btn hd-wish" id="wish-btn" aria-label="Wishlist">${ICONS.heartO}<span class="badge-count js-wish-count">0</span></button>
      <button class="icon-btn hd-bag" id="cart-btn" aria-label="Shopping bag">${ICONS.bag}<span class="badge-count js-cart-count">0</span></button>
    </div>
  </div></header>
  <nav class="mnav" id="mnav" aria-label="Mobile">
    <div class="flex between center" style="margin-bottom:10px"><span class="eyebrow">Menu</span><button class="icon-btn" data-close-mnav aria-label="Close menu">${ICONS.close}</button></div>
    <a class="mnav-member" href="account.html" id="mnav-member"></a>
    ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="shop.html?cat=home">Home &amp; table</a><a href="shop.html?sale=1">Flash sale</a>
    <div class="mnav-foot"><button data-info="shipping">Shipping</button><button data-info="returns">Returns</button><button data-info="contact">Contact</button></div>
  </nav>`;
}

function tabbarHtml() {
  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  const cur = (p) => (page === p ? ' aria-current="page"' : '');
  return `<nav class="tabbar" aria-label="Quick navigation">
    <a href="index.html"${cur('index')}>${ICONS.home}<span>Home</span></a>
    <a href="shop.html"${cur('shop')}>${ICONS.grid}<span>Shop</span></a>
    <button type="button" data-open-search>${ICONS.search}<span>Search</span></button>
    <button type="button" data-open-wish>${ICONS.heartO}<span>Saved</span><i class="badge-count js-wish-count">0</i></button>
    <button type="button" id="tab-bag" data-open-bag>${ICONS.bag}<span>Bag</span><i class="badge-count js-cart-count">0</i></button>
  </nav>`;
}

function footerHtml() {
  return `<footer class="site-footer"><div class="wrap">
    <div class="footer-top">
      <div>
        <p class="eyebrow" style="color:#8a8a92">The Silver Letter</p>
        <h3 class="display h3" style="color:#fff;max-width:16ch;margin-top:14px">First access to drops, private sales &amp; <em class="serif-i">15% off</em> your first order.</h3>
        <form class="newsletter" data-newsletter><input type="email" id="nl-email" required placeholder="Email address" aria-label="Email address"><button class="btn btn-silver" type="submit">Join</button></form>
        <p style="font-size:12px;color:#77777f;margin-top:12px">Join 48,000+ subscribers. Unsubscribe anytime.</p>
      </div>
      <div><h5>Shop</h5><ul>${CATEGORIES.map((c) => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join('')}</ul></div>
      <div><h5>Help</h5><ul><li><button data-info="shipping">Shipping &amp; delivery</button></li><li><button data-info="returns">60-day returns</button></li><li><button data-info="size">Ring size guide</button></li><li><button data-info="warranty">Lifetime warranty</button></li><li><a href="account.html#orders">Track your order</a></li><li><button data-info="contact">Contact us</button></li></ul></div>
      <div><h5>Atelier</h5><ul><li><button data-info="craft">Our craft</button></li><li><button data-info="925">925 explained</button></li><li><button data-info="recycled">Recycled silver</button></li><li><button data-info="engraving">Engraving</button></li><li><a href="account.html">Silver Club</a></li><li><button data-info="giftcards">Gift cards</button></li></ul></div>
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
    <div class="sheet-handle" data-drag="drawer" aria-hidden="true"></div>
    <div class="drawer-head">
      <div class="drawer-tabs" role="tablist"><button role="tab" data-tab="bag" class="is-active">Bag <span id="dt-bag"></span></button><button role="tab" data-tab="wish">Saved <span id="dt-wish"></span></button></div>
      <button class="icon-btn" data-close-drawer aria-label="Close">${ICONS.close}</button>
    </div>
    <div class="drawer-body" id="drawer-body"></div>
    <div class="drawer-foot" id="drawer-foot"></div>
  </aside>
  <div class="search" id="search" role="dialog" aria-label="Search" aria-hidden="true"><div class="wrap">
    <div class="search-top">${ICONS.search.replace('<svg', '<svg width="30" height="30"')}<input id="search-input" placeholder="Search silver…" autocomplete="off" enterkeyhint="search" aria-label="Search products"><button class="icon-btn" data-close-search aria-label="Close search">${ICONS.close}</button></div>
    <div class="search-chips"><span class="eyebrow">Trending</span>${['Hoops', 'Signet', 'Pendant', 'Cuff', 'Coin', 'Gift under $100'].map((t) => `<button class="chip" data-q="${t}">${t}</button>`).join('')}</div>
    <div class="grid grid-4" id="search-results" style="padding-bottom:60px"></div>
  </div></div>
  <div class="modal" id="modal" aria-hidden="true"><div class="modal-backdrop" data-close-modal></div><div class="modal-panel" role="dialog" aria-modal="true"><div class="sheet-handle" data-drag="modal" aria-hidden="true"></div><button class="icon-btn modal-close" data-close-modal aria-label="Close">${ICONS.close}</button><div id="modal-content"></div></div></div>
  <div class="toasts" id="toasts" aria-live="polite"></div>`;
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */
let drawerTab = 'bag';
let lastFocus = null;
export function openDrawer(tab = 'bag') {
  closeModal();
  drawerTab = tab; renderDrawer();
  lastFocus = document.activeElement;
  $('#drawer').classList.add('is-open'); $('#drawer').setAttribute('aria-hidden', 'false');
  $('#scrim').classList.add('is-open'); document.body.classList.add('is-locked');
  setTimeout(() => $('#drawer [data-close-drawer]')?.focus({ preventScroll: true }), 300);
}
export function closeDrawer() {
  const d = $('#drawer'); if (!d) return;
  const wasOpen = d.classList.contains('is-open');
  d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); d.style.transform = '';
  $('#scrim').classList.remove('is-open'); $('#mnav')?.classList.remove('is-open'); $('#filters')?.classList.remove('is-open');
  document.body.classList.remove('is-locked');
  if (wasOpen) lastFocus?.focus?.({ preventScroll: true });
}

const FINISH_NAME = { polished: 'Mirror Polished', brushed: 'Satin Brushed', oxidized: 'Oxidized' };
export const optsText = (i) => [FINISH_NAME[i.finish] || 'Mirror Polished', ...Object.entries(i.opts || {}).map(([k, v]) => (k === 'size' && /^\d+$/.test(v) ? 'Size ' + v : v))].join(' · ');

function renderDrawer() {
  $$('.drawer-tabs button').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === drawerTab));
  const body = $('#drawer-body'), foot = $('#drawer-foot');
  if (drawerTab === 'wish') {
    const ids = [...wishlist.ids].filter((id) => byId[id]);
    body.innerHTML = ids.length ? ids.map((id) => { const p = byId[id]; return `<div class="line-item"><a class="thumb" href="product.html?id=${id}"><img src="${img(id)}" alt=""></a><div><div class="li-title">${esc(p.name)}</div><div class="li-meta">${starsHtml(p.rating)} · ${p.stock <= 7 ? `<span class="stock-low">Only ${p.stock} left</span>` : 'In stock'}</div><div class="li-actions"><button class="btn btn-ink btn-sm" data-quick-add="${id}">Add to bag</button><button class="li-remove" data-wish="${id}">Remove</button></div></div><div class="li-price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ''}</div></div>`; }).join('')
      : `<div class="empty">${ICONS.heartO.replace('<svg', '<svg width="48" height="48"')}<h3 class="display h3">Nothing saved yet</h3><p class="muted">Tap the heart on any piece to keep it here.</p><a class="btn btn-ink" href="shop.html">Discover</a></div>`;
    foot.innerHTML = '';
    return;
  }
  const t = cart.totals();
  if (!cart.items.length) {
    body.innerHTML = `<div class="empty"><svg class="ring-icon" viewBox="0 0 96 96"><defs><linearGradient id="rg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8a8a90"/><stop offset=".35" stop-color="#fff"/><stop offset=".6" stop-color="#9a9aa0"/><stop offset="1" stop-color="#e9e9ec"/></linearGradient></defs><ellipse cx="48" cy="50" rx="30" ry="30" fill="none" stroke="url(#rg)" stroke-width="9"/></svg>
      <h3 class="display h3">Your bag is empty</h3><p class="muted">Today’s flash prices end at midnight.</p><a class="btn btn-ink" href="shop.html?sale=1">See the flash sale</a></div>`;
    foot.innerHTML = '';
    return;
  }
  const stackMsg = t.jewelryQty === 1 ? 'Add <b>1 more piece</b> of jewelry and save <b>10%</b> on both.' : t.jewelryQty === 2 ? 'Add <b>1 more piece</b> to save <b>15%</b> on all three.' : t.jewelryQty >= 3 ? '<b>15% Stack &amp; Save</b> applied to your jewelry.' : '';
  const gap = gapPick(t);
  const inCart = new Set(cart.items.map((i) => i.id));
  const ups = ['luna-hoops', 'twist-rope', 'starlight-studs', 'cable-chain', 'orbit-beads', 'pearl-drop', 'aura-band'].filter((id) => !inCart.has(id) && id !== gap?.p.id).slice(0, 4).map((id) => byId[id]);
  body.innerHTML = `${rewardMeter(t)}
    ${cart.items.map((i, idx) => { const l = t.lines[idx]; if (!l) return ''; return `<div class="line-item" data-idx="${idx}">
      <a class="thumb" href="product.html?id=${i.id}"><img src="${img(i.id)}" alt=""></a>
      <div><div class="li-title">${esc(l.p.name)}${i.addon ? ' <span class="tag tag-silver tag-xs">Add-on deal</span>' : ''}</div>
        <div class="li-meta">${esc(optsText(i))}${i.engraving ? `<br>Engraving: “${esc(i.engraving)}” (+${money(ENGRAVE_FEE)})` : ''}</div>
        <div class="li-actions"><div class="qty"><button data-dq="-1" aria-label="Decrease">−</button><input value="${i.qty}" inputmode="numeric" aria-label="Quantity" data-qin><button data-dq="1" aria-label="Increase">+</button></div><button class="li-remove" data-rm>Remove</button></div></div>
      <div class="li-price">${money(l.total)}${l.compare ? `<s>${money(l.compare * i.qty)}</s>` : ''}</div></div>`; }).join('')}
    ${t.freeGift ? `<div class="line-item gift-line"><span class="thumb"><img src="${img('care-kit')}" alt=""></span><div><div class="li-title">Silver Care Kit <span class="tag tag-ink tag-xs">Free gift</span></div><div class="li-meta">Unlocked at ${money(FREE_GIFT)} · added automatically</div></div><div class="li-price">FREE<s>${money(byId['care-kit'].price)}</s></div></div>` : ''}
    ${stackMsg ? `<div class="stack-hint"><span class="chip-silver">${t.stackPct || '%'}</span><span>${stackMsg}</span></div>` : ''}
    ${gapFillHtml(t)}
    ${ups.length ? `<div class="upsell"><h5>Pairs beautifully with</h5><div class="upsell-row">${ups.map((p) => `<div class="upsell-card"><a href="product.html?id=${p.id}"><img src="${img(p.id)}" alt="${esc(p.name)}" loading="lazy"></a><strong>${esc(p.name)}</strong><span>${money(p.price)}</span><button data-quick-add="${p.id}">+ Add</button></div>`).join('')}</div></div>` : ''}`;
  foot.innerHTML = `
    ${t.stack ? `<div class="sum-row discount"><span>Stack &amp; Save (${t.stackPct}%)</span><span>−${money2(t.stack)}</span></div>` : ''}
    ${t.promoAmt ? `<div class="sum-row discount"><span>Code ${t.promo}</span><span>−${money2(t.promoAmt)}</span></div>` : ''}
    <div class="sum-row total"><span>Subtotal</span><span>${t.compareSavings + t.discount > 0 ? `<small class="saving">You save ${money(t.compareSavings + t.discount)}</small>` : ''}${money2(t.afterDiscount)}</span></div>
    ${pointsLine(t)}
    <a class="btn btn-ink btn-lg btn-block" href="checkout.html">${ICONS.lock} Checkout · ${money2(t.afterDiscount)}</a>
    <div class="express"><button class="pay-btn dark" data-express>Express Pay</button><button class="pay-btn" data-express>4 × ${money2(t.afterDiscount / 4)}</button></div>
    <div class="secure-note">${ICONS.return} Free 60-day returns · ${ICONS.shield} Lifetime warranty</div>`;
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
    if (e.target.closest('[data-open-bag]')) { e.preventDefault(); openDrawer('bag'); }
    if (e.target.closest('[data-open-wish]')) { e.preventDefault(); openDrawer('wish'); }
    if (e.target.closest('[data-remember-next]')) session.set('next', location.pathname.split('/').pop() + location.search);
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-qin]')) { const li = e.target.closest('.line-item'); cart.setQty(+li.dataset.idx, parseInt(e.target.value, 10) || 0); }
  });
}

/** Mobile: compact "added" sheet instead of the full drawer. */
let addedItem = null;
function addedSheetHtml() {
  const item = addedItem, p = byId[item.id], t = cart.totals();
  return `<div class="added">
    <div class="added-head"><span class="ok">${ICONS.check}</span><b>Added to your bag</b></div>
    <div class="added-item"><img src="${img(p.id)}" alt=""><div><b>${esc(p.name)}</b><small>${esc(optsText(item))}</small></div><span>${money(unitPrice(p, item.opts) + (item.engraving ? ENGRAVE_FEE : 0))}</span></div>
    ${rewardMeter(t)}${gapFillHtml(t)}
    <div class="added-cta"><button class="btn btn-silver" data-open-bag>View bag (${cart.count()})</button><a class="btn btn-ink" href="checkout.html">Checkout</a></div>
  </div>`;
}
function addedSheet(item) {
  if (!byId[item.id]) return;
  addedItem = item;
  openModal(addedSheetHtml(), 'sheet added-sheet');
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */
function bindSearch() {
  const s = $('#search'), input = $('#search-input'), out = $('#search-results');
  const open = () => { closeDrawer(); s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-locked'); setTimeout(() => input.focus(), 60); run(input.value); };
  const close = () => { if (!s.classList.contains('is-open')) return; s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true'); document.body.classList.remove('is-locked'); };
  const run = (q) => {
    q = q.trim().toLowerCase();
    let list;
    if (q === 'gift under $100') list = PRODUCTS.filter((p) => p.price < 100);
    else if (q) list = PRODUCTS.filter((p) => (p.name + ' ' + p.category + ' ' + p.tagline + ' ' + p.description).toLowerCase().includes(q.replace(/s$/, '')));
    else list = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8);
    out.innerHTML = list.length ? list.slice(0, 12).map((p) => productCard(p)).join('') : `<p class="muted" style="grid-column:1/-1">No results for “${esc(q)}”. Try “ring” or “chain”.</p>`;
    bindTilt(out);
  };
  $('#search-btn').addEventListener('click', open);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-search]')) open(); });
  input.addEventListener('input', () => run(input.value));
  s.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-search]')) close();
    const chip = e.target.closest('[data-q]'); if (chip) { input.value = chip.dataset.q; run(chip.dataset.q); }
    if (e.target.closest('.card a, [data-quick-view], [data-quick-add], [data-qs]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); closeDrawer(); closeModal(); }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
  });
}

/* ------------------------------------------------------------------ */
/* Modal / bottom sheet                                                */
/* ------------------------------------------------------------------ */
export function openModal(html, cls = '') {
  const m = $('#modal');
  m.className = 'modal ' + cls;
  $('.modal-panel', m).style.transform = '';
  $('#modal-content').innerHTML = html;
  requestAnimationFrame(() => { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); });
  document.body.classList.add('is-locked');
  return m;
}
export function closeModal() {
  const m = $('#modal'); if (!m?.classList.contains('is-open')) return;
  m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
  if (!$('#drawer.is-open') && !$('#search.is-open')) document.body.classList.remove('is-locked');
}

/** Drag a bottom sheet down to dismiss it (phones). */
function bindSheetDrag() {
  let st = null;
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest('[data-drag], .drawer-head, .added-head');
    if (!h || !isPhone() || e.target.closest('button')) return;
    const panel = h.closest('.drawer, .modal-panel'); if (!panel) return;
    st = { y: e.clientY, panel, dy: 0 }; panel.style.transition = 'none';
  });
  document.addEventListener('pointermove', (e) => {
    if (!st) return;
    st.dy = Math.max(0, e.clientY - st.y);
    st.panel.style.transform = `translateY(${st.dy}px)`;
  });
  const end = () => {
    if (!st) return;
    const { panel, dy } = st; st = null; panel.style.transition = '';
    if (dy > 90) { panel.classList.contains('drawer') ? closeDrawer() : closeModal(); setTimeout(() => (panel.style.transform = ''), 400); }
    else panel.style.transform = '';
  };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
}

/* Option pickers (quick view + product page) */
export function optionPickers(p, state) {
  const parts = [];
  if (p.finishes?.length) parts.push(`<div><div class="opt-label"><span>Finish: <b data-finish-label>${FINISH_NAME[state.finish]}</b></span></div>
    <div class="finish-pick">${p.finishes.map((f) => `<button type="button" data-finish="${f}" class="${f === state.finish ? 'is-active' : ''}" aria-label="${FINISH_NAME[f]}" aria-pressed="${f === state.finish}"><span class="sw-${f}"></span></button>`).join('')}</div></div>`);
  for (const [k, vals] of Object.entries(p.options || {})) {
    const label = { size: 'Size', length: 'Length', pack: 'Pack' }[k];
    parts.push(`<div><div class="opt-label"><span>${label}: <b data-opt-label="${k}">${esc(state.opts[k] || 'Select')}</b></span>${k === 'size' && p.category === 'rings' ? '<button type="button" data-size-guide>Size guide</button>' : ''}</div>
      <div class="size-pick" data-opt="${k}">${vals.map((v, i) => `<button type="button" data-val="${esc(v)}" class="${state.opts[k] === v ? 'is-active' : ''} ${(p.id.length + i) % 5 === 1 ? 'is-low' : ''}" aria-pressed="${state.opts[k] === v}">${esc(v)}${p.optionPrices?.[k]?.[v] ? ` · ${money(p.optionPrices[k][v])}` : k === 'pack' ? ` · ${money(p.price)}` : ''}</button>`).join('')}</div>
      <p class="opt-note" data-opt-note="${k}"></p></div>`);
  }
  return parts.join('');
}
export function bindPickers(root, p, state, onChange = () => {}) {
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-finish]');
    if (f) {
      state.finish = f.dataset.finish;
      $$('[data-finish]', root).forEach((b) => { b.classList.toggle('is-active', b === f); b.setAttribute('aria-pressed', b === f); });
      const l = $('[data-finish-label]', root); if (l) l.textContent = FINISH_NAME[state.finish];
      onChange('finish');
    }
    const v = e.target.closest('[data-opt] [data-val]');
    if (v) {
      const k = v.parentElement.dataset.opt;
      state.opts[k] = v.dataset.val;
      $$('[data-val]', v.parentElement).forEach((b) => { b.classList.toggle('is-active', b === v); b.setAttribute('aria-pressed', b === v); });
      const l = $(`[data-opt-label="${k}"]`, root); if (l) l.textContent = v.dataset.val;
      const note = $(`[data-opt-note="${k}"]`, root);
      if (note && k !== 'pack') note.innerHTML = v.classList.contains('is-low') ? `<span class="stock-low">Only ${2 + (v.dataset.val.length % 2)} left in ${esc(v.dataset.val)} — likely to sell out</span>` : `<span class="in-stock">${ICONS.check} In stock in ${esc(v.dataset.val)} · ships ${dispatchDate().toDateString() === new Date().toDateString() ? 'today' : fmtDate(dispatchDate(), { weekday: 'long' })}</span>`;
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
  openModal(`<div class="info"><p class="eyebrow">Fit guide</p><h2 class="display h2">Find your ring size</h2>
    <p class="muted">Wrap a strip of paper around the base of your finger, mark where it overlaps and measure the length in mm. Between sizes? Size up — resizing is free for life.</p>
    <div class="table-wrap"><table class="size-table"><thead><tr><th>US size</th><th>Diameter (mm)</th><th>Circumference (mm)</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`, 'modal-sm sheet');
}

/* Help & atelier pages, shown as modals */
const INFO = {
  shipping: ['Delivery', 'Shipping & delivery', `<p>Every order ships fully insured in our signature silver-foil box, with tracking from the moment it leaves the atelier.</p>
    <table class="kv"><tr><td>Standard · 3–5 business days</td><td>$8 · free over $150</td></tr><tr><td>Express · 1–2 business days</td><td>$18</td></tr><tr><td>Next Day · order before 3pm</td><td>$32</td></tr></table>
    <p>Orders placed before 3pm on a weekday leave the same day. Engraved pieces need one extra business day.</p>`],
  returns: ['Returns', '60-day free returns', `<p>Changed your mind? Send any piece back within 60 days of delivery — engraved pieces included — and we’ll refund you in full. We email a prepaid label; just drop the parcel off.</p><p>Exchanges for another size ship the day your return is scanned.</p>`],
  warranty: ['Lifetime warranty', 'Ours to look after, forever', `<p>For as long as you own it, we’ll resize, re-polish, re-plate and repair any Silver Shop piece free of charge — including shipping both ways.</p><p>Members can start a warranty claim from their account in one tap.</p>`],
  contact: ['Contact', 'Talk to the atelier', `<p>Our jewelers answer every message within a few hours, Monday to Saturday.</p>
    <p class="copy-row"><span>hello@silvershop.example</span><button type="button" class="btn btn-ghost btn-sm" data-copy="hello@silvershop.example">Copy</button></p>
    <form class="grid" style="gap:10px" data-contact><div class="field"><input id="ct-email" type="email" placeholder=" " required><label for="ct-email">Your email</label></div><div class="field"><textarea id="ct-msg" placeholder=" " required></textarea><label for="ct-msg">How can we help?</label></div><button class="btn btn-ink">Send message</button></form>`],
  craft: ['Atelier', 'Our craft', '<p>Each piece starts as a billet or a lost-wax casting in recycled 925 sterling. It is filed, sanded through five grits and polished through seven stages before an invisible e-coat seals in the shine. A jeweler signs off every piece by hand.</p>'],
  925: ['Materials', '925, explained', '<p>Fine silver (99.9%) is too soft to wear every day. Sterling silver is 92.5% fine silver and 7.5% copper, which makes it strong enough for rings and clasps while keeping silver’s bright white color. Every Silver Shop jewelry piece is stamped “925”. Bullion is .999 fine.</p>'],
  recycled: ['Materials', 'Recycled silver', '<p>All our jewelry silver is refined from post-consumer and industrial scrap. Recycled silver is chemically identical to mined silver and avoids most of the mining footprint.</p>'],
  engraving: ['Personalize', 'Engraving', '<p>Most rings, pendants and cufflinks can carry up to 12 characters, hand-engraved in serif, sans or script. Engraving adds $15 and one business day. Yes, engraved pieces can still be returned.</p>'],
  giftcards: ['Gifting', 'Gift cards', '<p>Digital gift cards from $25 to $1,000 arrive by email instantly or on a date you choose, and never expire. (Demo: gift cards can’t be purchased in this store.)</p>'],
};
function infoModal(key) {
  if (key === 'size') return sizeGuide();
  const [eyebrow, title, body] = INFO[key] || [];
  if (!title) return;
  openModal(`<div class="info"><p class="eyebrow">${eyebrow}</p><h2 class="display h2">${title}</h2>${body}</div>`, 'modal-sm sheet');
}

export function quickView(p) {
  const state = { finish: p.finishes?.[0] || 'polished', opts: {} };
  if (p.options?.pack) state.opts.pack = p.options.pack[0];
  openModal(`<div class="qv">
    <div class="qv-media" data-tilt="5"><div class="card-badges">${p.flash ? `<span class="tag tag-flash">Flash −${pct(p)}%</span>` : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}</div><img src="${img(p.id, 1)}" alt="${esc(p.name)}"></div>
    <div class="qv-body">
      <span class="rating">${starsHtml(p.rating)} ${p.rating} · ${p.reviews.toLocaleString()} reviews</span>
      <h2 class="display h2">${esc(p.name)}</h2>
      <div class="price qv-price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s><span class="save">Save ${money(p.compareAt - p.price)}</span>` : ''}</div>
      <p class="muted qv-desc">${esc(p.tagline)} ${esc(p.description.split('. ')[0])}.</p>
      ${optionPickers(p, state)}
      <button class="btn btn-ink btn-lg btn-block" data-qv-add>${ICONS.bag} Add to bag — ${money(p.price)}</button>
      <p class="reassure"><span>${ICONS.return} Free 60-day returns</span><span>${ICONS.truck} Ships ${dispatchDate().toDateString() === new Date().toDateString() ? 'today' : fmtDate(dispatchDate(), { weekday: 'long' })}</span></p>
      <a class="btn-link" href="product.html?id=${p.id}">Full details ${ICONS.arrow}</a>
    </div></div>`, 'sheet qv-sheet');
  const panel = $('#modal-content');
  bindTilt(panel);
  bindPickers(panel, p, state, () => { $('[data-qv-add]', panel).innerHTML = `${ICONS.bag} Add to bag — ${money(unitPrice(p, state.opts))}`; });
  $('[data-qv-add]', panel).addEventListener('click', () => {
    if (missingOption(panel, p, state)) return;
    const src = $('.qv-media img', panel);
    const r = src.getBoundingClientRect();
    const ghost = new Image(); ghost.src = img(p.id);
    Object.assign(ghost.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', opacity: 0, pointerEvents: 'none' });
    document.body.appendChild(ghost);
    closeModal();
    addToCart({ id: p.id, finish: state.finish, opts: { ...state.opts } }, ghost);
    setTimeout(() => ghost.remove(), 1200);
  });
}

/* ------------------------------------------------------------------ */
/* Toasts, social proof, lead capture                                  */
/* ------------------------------------------------------------------ */
export function toast({ img: src, html, sub, dark = false, icon = null, timeout = 4600 }) {
  const box = $('#toasts'); if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast' + (dark ? ' toast-ink' : '');
  t.innerHTML = `${src ? `<img src="${src}" alt="">` : icon ? `<span class="toast-ico">${icon}</span>` : '<span></span>'}<div><p>${html}</p>${sub ? `<small>${sub}</small>` : ''}</div><button class="x" aria-label="Dismiss">${ICONS.close.replace('<svg', '<svg width="14" height="14"')}</button>`;
  while (box.children.length > 1) box.firstElementChild.remove();
  box.appendChild(t);
  const kill = () => { t.classList.add('is-out'); setTimeout(() => t.remove(), 450); };
  t.querySelector('.x').onclick = kill;
  setTimeout(kill, timeout);
  return t;
}

/** A few quiet "recently bought" notes — never more than three per visit. */
function socialProof() {
  if (document.body.dataset.noProof !== undefined || session.get('proof', 0) >= 3) return;
  const next = () => {
    if (document.hidden || $('.modal.is-open, .drawer.is-open, .search.is-open, .filters.is-open')) return schedule(15000);
    const pool = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 12);
    const p = pool[Math.floor(Math.random() * pool.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    toast({ img: img(p.id), html: `<strong>${esc(p.name)}</strong> just found a home in ${city}`, sub: `${2 + Math.floor(Math.random() * 16)} min ago`, timeout: 4200 });
    const n = session.get('proof', 0) + 1; session.set('proof', n);
    if (n < 3) schedule(55000 + Math.random() * 30000);
  };
  const schedule = (ms) => setTimeout(next, ms);
  schedule(28000);
}

function leadModal() {
  store.set('lead', true);
  $('#teaser')?.remove();
  openModal(`<div class="lead-art"><span class="big">15%</span><img src="${img('halo-solitaire', 1)}" alt=""></div>
    <div class="lead-body"><p class="eyebrow">The Silver Letter</p><h2 class="display h2">Take <em class="serif-i">15% off</em> your first piece</h2>
    <p class="muted" style="margin:0">Early access to drops and private sales. Your code appears instantly.</p>
    <form data-lead class="grid" style="gap:10px"><div class="field"><input type="email" id="lead-email" placeholder=" " required autocomplete="email"><label for="lead-email">Email address</label></div><button class="btn btn-ink btn-lg btn-block shine">Reveal my code</button></form>
    <div class="code-reveal" id="code-reveal"><span>WELCOME15</span><button class="btn btn-ink btn-sm" data-apply-code="WELCOME15">Apply</button></div>
    <a class="lead-alt" href="account.html#join" data-remember-next>Or join the Silver Club for $12.50 off + 5% back ${ICONS.arrow}</a>
    <button data-close-modal class="lead-skip">No thanks</button></div>`, 'lead-pop sheet');
  $('[data-lead]').addEventListener('submit', (e) => { e.preventDefault(); e.target.classList.add('hide'); $('#code-reveal').classList.add('is-on'); confetti({ count: 70 }); });
}

/** A small corner tab instead of an interrupting popup; the full offer opens only on request (or once on desktop exit-intent). */
function leadCapture() {
  if (document.body.dataset.noPopup !== undefined || store.get('lead', false) || account.user) return;
  setTimeout(() => {
    if (store.get('lead', false) || session.get('teaser-off', false) || account.user) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="teaser" id="teaser"><button class="teaser-main" data-teaser>${ICONS.sparkle}<span>15% off your first piece</span></button><button class="teaser-x" data-teaser-x aria-label="Dismiss offer">${ICONS.close}</button></div>`);
  }, 12000);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-teaser]')) leadModal();
    if (e.target.closest('[data-teaser-x]')) { session.set('teaser-off', true); $('#teaser')?.remove(); }
  });
  if (matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget && e.clientY < 6 && performance.now() > 15000 && !store.get('lead', false) && !$('.modal.is-open, .drawer.is-open')) leadModal();
    });
  }
}

/* ------------------------------------------------------------------ */
/* Effects                                                             */
/* ------------------------------------------------------------------ */
export function reveal(root = document) {
  if (!('IntersectionObserver' in window)) { $$('.reveal, .reveal-mask', root).forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  $$('.reveal:not(.is-in), .reveal-mask:not(.is-in)', root).forEach((el) => io.observe(el));
}

export function countUp(el, to, { dur = 1600, fmt = (v) => Math.round(v).toLocaleString() } = {}) {
  const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/** Silver confetti burst. */
export function confetti({ count = 160, x = 0.5, y = 0.35 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  let v = 31.42; const base = 31.22;
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
  }, 4600);
  const tick = () => {
    const r = remaining();
    $('#bar-timer').textContent = `${pad(r.h)}:${pad(r.m)}:${pad(r.s)}`;
    $$('.js-mini-timer').forEach((el) => (el.textContent = `in ${r.h}h ${pad(r.m)}m`));
  };
  tick(); setInterval(tick, 1000);
}

/* Magnetic buttons (desktop) */
function magnetic() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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
  $$('.js-cart-count').forEach((el) => { el.textContent = c; el.classList.toggle('has', c > 0); });
  $$('.js-wish-count').forEach((el) => { el.textContent = w; el.classList.toggle('has', w > 0); });
  const db = $('#dt-bag'), dw = $('#dt-wish');
  if (db) db.textContent = c ? `(${c})` : '';
  if (dw) dw.textContent = w ? `(${w})` : '';
}
function updateAccountUI() {
  const u = account.user;
  const a = $('#acct-btn');
  if (a) { a.innerHTML = u ? `<span class="avatar">${esc(account.initials(u))}</span>` : ICONS.user; a.setAttribute('aria-label', u ? `Your account (${u.first})` : 'Sign in or create an account'); }
  const m = $('#mnav-member');
  if (m) m.innerHTML = u ? `<span class="avatar">${esc(account.initials(u))}</span><span><b>${esc(u.first)}</b><small>${u.points.toLocaleString()} Silver Points · ${account.tier(u).name}</small></span>` : `<span class="avatar">${ICONS.user}</span><span><b>Sign in or join</b><small>$12.50 off your first order</small></span>`;
}

export function boot({ chrome = true } = {}) {
  if (chrome) {
    document.body.insertAdjacentHTML('afterbegin', announcementHtml() + headerHtml());
    document.body.insertAdjacentHTML('beforeend', footerHtml() + tabbarHtml());
    document.body.classList.add('has-tabbar');
  }
  document.body.insertAdjacentHTML('beforeend', overlaysHtml());
  if (chrome) {
    rotator(); spotTicker(); bindSearch();
    const h = $('#site-header');
    const onScroll = () => h.classList.toggle('is-scrolled', scrollY > 10);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    $('#cart-btn').addEventListener('click', () => openDrawer('bag'));
    $('#wish-btn').addEventListener('click', () => openDrawer('wish'));
    $('#burger').addEventListener('click', () => { $('#mnav').classList.add('is-open'); $('#scrim').classList.add('is-open'); document.body.classList.add('is-locked'); });
    document.addEventListener('click', (e) => { if (e.target.closest('[data-close-mnav]')) closeDrawer(); });
    socialProof(); leadCapture();
  }
  bindDrawer(); bindCardActions(); magnetic(); bindSheetDrag();
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) closeModal();
    const info = e.target.closest('[data-info]');
    if (info) { e.preventDefault(); closeDrawer(); infoModal(info.dataset.info); }
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const done = () => { cp.textContent = 'Copied'; setTimeout(() => (cp.textContent = 'Copy'), 1600); };
      try { navigator.clipboard.writeText(cp.dataset.copy).then(done, done); } catch { done(); }
    }
    const ap = e.target.closest('[data-apply-code]');
    if (ap) {
      const r = cart.applyPromo(ap.dataset.applyCode);
      closeModal();
      toast({ icon: ICONS.sparkle, html: r.ok ? `<strong>${ap.dataset.applyCode}</strong> is saved to your bag` : r.msg, sub: r.ok ? 'Applied automatically at checkout' : '', dark: true });
    }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.matches('[data-newsletter]')) { e.preventDefault(); e.target.reset(); cart.applyPromo('WELCOME15'); store.set('lead', true); toast({ icon: ICONS.sparkle, html: '<strong>Welcome to The Silver Letter.</strong> WELCOME15 is saved to your bag.', sub: '15% off your first order', dark: true }); }
    if (e.target.matches('[data-contact]')) { e.preventDefault(); closeModal(); toast({ icon: ICONS.mail, html: '<strong>Message received.</strong> We’ll reply within a few hours.', sub: 'Demo — nothing was sent', dark: true }); }
  });
  on('cart', () => {
    updateCounts();
    if ($('#drawer')?.classList.contains('is-open')) renderDrawer();
    if (addedItem && $('#modal.added-sheet.is-open')) $('#modal-content').innerHTML = addedSheetHtml();
  });
  on('wish', () => { updateCounts(); if ($('#drawer')?.classList.contains('is-open')) renderDrawer(); });
  on('account', updateAccountUI);
  addEventListener('storage', (e) => {
    if (e.key === 'ss:cart') { cart.items = store.get('cart', []); cart.promo = store.get('promo', null); emit('cart', cart); }
    if (e.key === 'ss:session' || e.key === 'ss:users') { account.users = store.get('users', {}); account.session = store.get('session', null); emit('account', account.user); }
  });
  updateCounts(); updateAccountUI();
  bindTilt(); reveal();
}
