import { boot, $, $$, money, money2, esc, productCard, bindTilt, addToCart, cart, wishlist, markViewed, store, ICONS, starsHtml, optionPickers, bindPickers, missingOption, pct, remaining, addBusinessDays, fmtDate, unitPrice, ENGRAVE_FEE, openModal, closeModal, toast, reveal, param, account, POINT_VALUE, dispatchDate, isPhone, defaultOpts, session } from './app.js';
import { PRODUCTS, CATEGORIES, byId, img, reviewsFor, ratingDistribution, seeded } from './products.js';

boot();

const id = param('id');
const p = byId[id] || PRODUCTS[0];
const cat = CATEGORIES.find((c) => c.id === p.category);
markViewed(p.id);
document.title = `${p.name} — Sterling Silver ${cat.name} — Silver Shop`;
document.querySelector('meta[name="description"]').content = `${p.name}: ${p.tagline} ${p.description.slice(0, 120)}…`;

const state = { finish: p.finishes?.[0] || 'polished', opts: {}, qty: 1, engraving: '', engraveFont: 'serif', engraveOn: false };
if (p.options?.pack) state.opts.pack = p.options.pack[0];
const rand = seeded(p.id + new Date().toDateString());
const sold24 = 8 + Math.floor(rand() * 40);
const rank = [...PRODUCTS].filter((x) => x.category === p.category).sort((a, b) => b.sold - a.sold).findIndex((x) => x.id === p.id) + 1;
const FILTERS = { polished: 'none', brushed: 'contrast(.9) brightness(1.03)', oxidized: 'brightness(.58) contrast(1.4)' };

/* ---------- Breadcrumbs ---------- */
$('#crumbs').innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="shop.html?cat=${cat.id}">${cat.name}</a><span aria-hidden="true">/</span><span>${esc(p.name)}</span>`;

/* ---------- Buy box ---------- */
const cutoff = () => { const d = new Date(); d.setHours(15, 0, 0, 0); if (Date.now() > d) d.setDate(d.getDate() + 1); return d; };
const arrive = () => { const ship = dispatchDate(); return [addBusinessDays(ship, 1), addBusinessDays(ship, 3)]; };
const shipsToday = dispatchDate().toDateString() === new Date().toDateString();
const [a1, a2] = arrive();

$('#pdp').innerHTML = `
  <div class="gallery">
    <div class="thumbs" role="tablist" aria-label="Images">
      ${[1, 2, 3].map((n) => `<button class="${n === 1 ? 'is-active' : ''}" data-img="${n}" aria-label="View image ${n}"><img src="${img(p.id, n)}" alt=""></button>`).join('')}
      <button class="t3d" data-3d aria-label="View in 3D">${ICONS.cube}3D</button>
    </div>
    <div class="stage" id="stage">
      <div class="stage-badges">${p.flash ? `<span class="tag tag-flash">Flash −${pct(p)}%</span>` : ''}${p.badge && !p.flash ? `<span class="tag">${esc(p.badge)}</span>` : ''}${p.isNew ? '<span class="tag tag-silver">New</span>' : ''}</div>
      <button class="btn btn-silver btn-sm btn-3d" data-3d>${ICONS.cube} View in 3D</button>
      <div class="slides" id="slides">${[1, 2, 3].map((n) => `<div class="slide ${n === 1 ? 'is-cur' : ''}"><img ${n === 1 ? 'id="main-img"' : 'loading="lazy"'} src="${img(p.id, n)}" alt="${esc(p.name)}, view ${n}" width="1100" height="1100"></div>`).join('')}</div>
      <div class="dots" id="dots">${[1, 2, 3].map((n) => `<button type="button" data-dot="${n}" class="${n === 1 ? 'is-active' : ''}" aria-label="Show image ${n}"></button>`).join('')}</div>
      <div class="viewer" id="viewer"></div>
      <div class="stage-hint hide" id="stage-hint">${ICONS.cube} Drag to rotate · ${matchMedia('(pointer: coarse)').matches ? 'Pinch' : 'Scroll'} to zoom</div>
      <div class="viewers-pill" id="viewers"><span id="viewers-n">${14 + Math.floor(rand() * 20)}</span>&nbsp;people are viewing this</div>
    </div>
  </div>

  <div class="buy">
    <div class="buy-top">
      <a href="#reviews" class="rating" style="font-size:13px">${starsHtml(p.rating)} <b style="color:var(--ink)">${p.rating}</b> · ${p.reviews.toLocaleString()} reviews</a>
      ${rank <= 2 ? `<span class="tag tag-silver">#${rank} Bestseller in ${cat.name}</span>` : ''}
    </div>
    <div><h1 class="display">${esc(p.name)}</h1><p class="lead" style="margin:10px 0 0">${esc(p.tagline)}</p></div>
    <div class="buy-price"><span class="now" id="price-now">${money(p.price)}</span>${p.compareAt ? `<s>${money(p.compareAt)}</s><span class="save">Save ${money(p.compareAt - p.price)} (${pct(p)}%)</span>` : ''}</div>
    <p class="pay4">or 4 interest-free payments of <b id="pay4">${money2(p.price / 4)}</b> · 0% APR</p>
    <a class="pts-inline" id="pts-inline" href="account.html${account.user ? '' : '#join'}" data-remember-next></a>
    ${p.flash ? `<div class="flash-strip"><span>⚡ Flash price ends in</span><strong id="flash-t">--:--:--</strong></div>` : ''}
    <div class="grid" style="gap:22px" id="pickers">${optionPickers(p, state)}</div>
    ${p.engravable ? `<div class="engrave" id="engrave">
      <div class="engrave-head" data-engrave-toggle>${ICONS.pen}<div><b style="font-size:14px">Add engraving</b><div class="muted" style="font-size:12px">Up to 12 characters, hand-engraved</div></div><span class="muted">+${money(ENGRAVE_FEE)}</span><span class="toggle"><input type="checkbox" id="engrave-on" aria-label="Add engraving"><i></i></span></div>
      <div class="engrave-body">
        <div class="engrave-preview" id="engrave-preview">Your words</div>
        <div class="field"><input id="engrave-text" maxlength="12" placeholder=" " autocomplete="off"><label for="engrave-text">Engraving text (<span id="engrave-left">12</span> left)</label></div>
        <div class="engrave-fonts">${[['serif', 'Aa', 'Cormorant, serif', 'italic'], ['sans', 'AA', 'Inter, sans-serif', 'normal'], ['script', 'Aa', '"Brush Script MT", "Segoe Script", cursive', 'normal']].map(([k, l, f, s], i) => `<button type="button" data-font="${k}" data-ff='${f}' data-fs="${s}" class="${i ? '' : 'is-active'}" style="font-family:${f.replace(/"/g, '&quot;')};font-style:${s}">${l}</button>`).join('')}</div>
      </div></div>` : ''}
    <div class="stockbar">
      <small><span>${p.stock <= 7 ? `<span class="stock-low">Only ${p.stock} left in stock</span>` : '<span style="color:var(--ok);font-weight:600">● In stock, ready to ship</span>'}</span><span class="muted">${sold24} sold in last 24h</span></small>
      <div class="meter"><i style="--v:${Math.max(8, Math.min(100, (p.stock / 40) * 100))}%"></i></div>
    </div>
    <div class="buy-row">
      <div class="qty qty-lg"><button data-q="-1" aria-label="Decrease quantity">−</button><input id="qty" value="1" inputmode="numeric" aria-label="Quantity"><button data-q="1" aria-label="Increase quantity">+</button></div>
      <button class="btn btn-ink btn-lg" id="add">${ICONS.bag} <span id="add-label">Add to bag · ${money(p.price)}</span></button>
      <button class="icon-btn ${wishlist.has(p.id) ? 'is-on' : ''}" id="wish" aria-label="Save to wishlist">${ICONS.heart}</button>
    </div>
    <p class="reassure"><span>${ICONS.return} Free 60-day returns</span><span>${ICONS.truck} ${shipsToday ? 'Ships today' : 'Ships ' + fmtDate(dispatchDate(), { weekday: 'long' })}</span><span>${ICONS.shield} Lifetime warranty</span></p>
    <button class="btn btn-silver btn-lg btn-block" id="buy-now">Buy it now — express checkout</button>
    <div class="delivery">
      <div>${ICONS.truck}<span>${shipsToday ? `Order within <b class="timer-inline" id="cutoff">--h --m</b> for <b>dispatch today</b>.` : `Order now for dispatch <b>${fmtDate(dispatchDate(), { weekday: 'long' })}</b>.`} Arrives <b>${fmtDate(a1)} – ${fmtDate(a2)}</b>.</span></div>
      <div>${ICONS.return}<span><b>Free 60-day returns</b> & exchanges — even on engraved pieces.</span></div>
      <div>${ICONS.shield}<span><b>Lifetime warranty</b>: free resizing, polishing and repairs.</span></div>
      <div>${ICONS.gift}<span>Arrives in our signature <b>silver-foil gift box</b>, free.</span></div>
    </div>
    <div class="acc">
      <details open><summary>Description <span class="pm"></span></summary><div class="acc-body"><p style="margin-top:0">${esc(p.description)}</p></div></details>
      <details><summary>Details &amp; dimensions <span class="pm"></span></summary><div class="acc-body"><table>${Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}<tr><td>SKU</td><td>SS-${p.id.toUpperCase().replace(/-/g, '').slice(0, 8)}-925</td></tr></table></div></details>
      <details><summary>Shipping &amp; returns <span class="pm"></span></summary><div class="acc-body">Free insured standard shipping on orders over $150 (3–5 business days). Express (1–2 days) and Next Day available at checkout. Returns are free within 60 days — we’ll send a prepaid label.</div></details>
      <details><summary>Care <span class="pm"></span></summary><div class="acc-body">Remove before swimming. Store in the anti-tarnish pouch provided. Polish gently with the Silver Care Kit — or send it to us for a free professional polish, forever.</div></details>
    </div>
  </div>`;

/* ---------- Price / labels ---------- */
function currentUnit() { return unitPrice(p, state.opts) + (state.engraveOn && state.engraving ? ENGRAVE_FEE : 0); }
function updatePrice() {
  const u = currentUnit();
  $('#price-now').textContent = money(u);
  $('#pay4').textContent = money2((u * state.qty) / 4);
  $('#add-label').textContent = `Add to bag · ${money(u * state.qty)}`;
  $('#sb-price').textContent = money(u * state.qty);
  $('#sb-opts').textContent = [({ polished: 'Mirror Polished', brushed: 'Satin Brushed', oxidized: 'Oxidized' })[state.finish], ...Object.values(state.opts)].join(' · ');
  const pts = Math.floor(u * state.qty), usr = account.user;
  $('#pts-inline').innerHTML = usr ? `${ICONS.sparkle}<span>Earn <b>${pts} Silver Points</b> · you have ${money2(usr.points * POINT_VALUE)} to spend</span>`
    : `${ICONS.sparkle}<span>Members earn <b>${pts} points</b> + <b>$12.50 off</b> their first order · <u>Join free</u></span>`;
}
bindPickers($('#pickers'), p, state, (k) => {
  updatePrice();
  if (k === 'finish') {
    $$('.slide img').forEach((im) => (im.style.filter = FILTERS[state.finish]));
    if (state.finish !== 'polished') show3d(); else if (viewer) viewer.setFinish(state.finish);
  }
});


/* ---------- Gallery, zoom & 3D ---------- */
const stage = $('#stage');
let viewer = null;
async function show3d() {
  stage.classList.add('is-3d');
  $$('.thumbs button').forEach((b) => b.classList.toggle('is-active', b.matches('[data-3d]')));
  $('.btn-3d').classList.add('hide');
  $('#stage-hint').classList.remove('hide');
  if (!viewer) {
    try {
      const { createViewer } = await import('./viewer.js');
      viewer = createViewer($('#viewer'), p.id, state.finish);
      $('#viewer').addEventListener('interact', () => $('#stage-hint').style.opacity = 0, { once: true });
    } catch (e) {
      console.warn(e); stage.classList.remove('is-3d'); toast({ html: '3D preview isn’t supported on this device.', dark: true });
    }
  } else viewer.setFinish(state.finish);
}
const slides = $('#slides');
const curImg = () => $('.slide.is-cur img') || $('#main-img');
function markSlide(n) {
  $$('.slide').forEach((s, i) => s.classList.toggle('is-cur', i === n - 1));
  $$('.thumbs [data-img]').forEach((b) => b.classList.toggle('is-active', !stage.classList.contains('is-3d') && +b.dataset.img === n));
  $$('#dots [data-dot]').forEach((b) => b.classList.toggle('is-active', +b.dataset.dot === n));
}
function show2d(n) {
  stage.classList.remove('is-3d');
  $('.btn-3d').classList.remove('hide'); $('#stage-hint').classList.add('hide');
  $('.thumbs [data-3d]').classList.remove('is-active');
  slides.scrollTo({ left: (n - 1) * slides.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  markSlide(n);
}
let slideRaf = 0;
slides.addEventListener('scroll', () => { cancelAnimationFrame(slideRaf); slideRaf = requestAnimationFrame(() => markSlide(Math.round(slides.scrollLeft / slides.clientWidth) + 1)); }, { passive: true });
$('#dots').addEventListener('click', (e) => { const d = e.target.closest('[data-dot]'); if (d) show2d(+d.dataset.dot); });
$('.thumbs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  b.matches('[data-3d]') ? show3d() : show2d(+b.dataset.img);
});
$('.btn-3d').addEventListener('click', (e) => { e.stopPropagation(); show3d(); });
if (matchMedia('(hover: hover)').matches) {
  stage.addEventListener('pointermove', (e) => {
    if (stage.classList.contains('is-3d') || e.target.closest('button,.viewers-pill,.dots')) { stage.classList.remove('is-zoom'); return; }
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%');
    stage.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%');
    stage.classList.add('is-zoom');
  });
  stage.addEventListener('pointerleave', () => stage.classList.remove('is-zoom'));
}

/* ---------- Live counters ---------- */
setInterval(() => { const n = $('#viewers-n'); n.textContent = Math.max(6, +n.textContent + Math.round((Math.random() - 0.5) * 4)); }, 4500);
const pad = (n) => String(n).padStart(2, '0');
const tick = () => {
  const c = cutoff() - Date.now();
  const co = $('#cutoff'); if (co) co.textContent = `${Math.floor(c / 36e5)}h ${pad(Math.floor((c % 36e5) / 6e4))}m`;
  if (p.flash) { const r = remaining(); $('#flash-t').textContent = `${pad(r.h)}:${pad(r.m)}:${pad(r.s)}`; }
};
tick(); setInterval(tick, 1000);

/* ---------- Engraving ---------- */
if (p.engravable) {
  const box = $('#engrave'), input = $('#engrave-text'), prev = $('#engrave-preview');
  const sync = () => {
    state.engraving = input.value.trim();
    prev.textContent = input.value || 'Your words';
    $('#engrave-left').textContent = 12 - input.value.length;
    updatePrice();
  };
  $('#engrave-on').addEventListener('change', (e) => { state.engraveOn = e.target.checked; box.classList.toggle('is-on', state.engraveOn); if (state.engraveOn) setTimeout(() => input.focus(), 50); updatePrice(); });
  $('[data-engrave-toggle]').addEventListener('click', (e) => { if (e.target.closest('.toggle')) return; const c = $('#engrave-on'); c.checked = !c.checked; c.dispatchEvent(new Event('change')); });
  input.addEventListener('input', sync);
  $$('[data-font]').forEach((b) => b.addEventListener('click', () => {
    state.engraveFont = b.dataset.font;
    $$('[data-font]').forEach((x) => x.classList.toggle('is-active', x === b));
    prev.style.fontFamily = b.dataset.ff; prev.style.fontStyle = b.dataset.fs;
    prev.style.textTransform = b.dataset.font === 'sans' ? 'uppercase' : 'none';
    prev.style.fontSize = b.dataset.font === 'sans' ? '24px' : '34px';
  }));
}

/* ---------- Quantity, add, buy now, wishlist ---------- */
const setQty = (q) => { state.qty = Math.max(1, Math.min(10, q || 1)); $('#qty').value = state.qty; updatePrice(); };
$$('[data-q]').forEach((b) => b.addEventListener('click', () => setQty(state.qty + +b.dataset.q)));
$('#qty').addEventListener('change', (e) => setQty(parseInt(e.target.value, 10)));

function item() { return { id: p.id, finish: state.finish, opts: { ...state.opts }, qty: state.qty, engraving: state.engraveOn ? state.engraving : '' }; }
function validate() {
  const k = missingOption($('#pickers'), p, state);
  if (k) { $('#pickers').scrollIntoView({ behavior: 'smooth', block: 'center' }); toast({ html: `Please choose a <strong>${{ size: 'size', length: 'length', pack: 'pack' }[k]}</strong> first`, dark: true, timeout: 2600 }); return false; }
  if (state.engraveOn && !state.engraving) { $('#engrave-text').focus(); toast({ html: 'Add your engraving text, or switch engraving off', dark: true, timeout: 2600 }); return false; }
  return true;
}
const doAdd = (btn) => {
  if (!validate()) return;
  btn.classList.add('is-loading'); btn.dataset.html = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span>';
  setTimeout(() => {
    addToCart(item(), stage.classList.contains('is-3d') ? $('#viewer canvas') || curImg() : curImg());
    btn.classList.remove('is-loading'); btn.innerHTML = `${ICONS.check} Added`;
    setTimeout(() => { btn.innerHTML = btn.dataset.html; }, 1600);
  }, 450);
};
$('#add').addEventListener('click', (e) => doAdd(e.currentTarget));
$('#sb-add').addEventListener('click', (e) => { if (!validate()) return; doAdd(e.currentTarget); });
$('#buy-now').addEventListener('click', () => { if (!validate()) return; cart.add(item()); location.href = 'checkout.html'; });
$('#wish').addEventListener('click', (e) => {
  const on = wishlist.toggle(p.id); e.currentTarget.classList.toggle('is-on', on);
  toast({ img: img(p.id), html: on ? `<strong>${esc(p.name)}</strong> saved to your wishlist` : 'Removed from wishlist', sub: on ? 'We’ll tell you if the price drops' : '' });
});

/* ---------- Sticky buy bar ---------- */
$('#sb-img').src = img(p.id); $('#sb-name').textContent = p.name;
const sb = $('#sticky-buy');
new IntersectionObserver(([e]) => { const on = !e.isIntersecting && (e.boundingClientRect.top < 0 || isPhone()); sb.classList.toggle('is-on', on); sb.setAttribute('aria-hidden', String(!on)); }).observe($('#add'));
updatePrice();

/* ---------- Frequently bought together ---------- */
const COMPLEMENTS = { rings: ['twist-rope', 'luna-hoops'], necklaces: ['cable-chain', 'starlight-studs'], earrings: ['infinity-pendant', 'aura-band'], bracelets: ['aura-band', 'luna-hoops'], men: ['aura-band', 'care-kit'], bullion: ['cast-bar', 'care-kit'], home: ['cascade-goblet', 'care-kit'], care: ['aura-band', 'luna-hoops'] };
const defaults = defaultOpts;
const fbtIds = [p.id, ...(COMPLEMENTS[p.category] || []).filter((x) => x !== p.id)];
while (fbtIds.length < 3) { const n = [...PRODUCTS].sort((a, b) => b.sold - a.sold).find((x) => !fbtIds.includes(x.id)); fbtIds.push(n.id); }
const fbtOn = new Set(fbtIds);
function renderFbt() {
  const list = fbtIds.map((x) => byId[x]);
  const chosen = list.filter((x) => fbtOn.has(x.id));
  const sum = chosen.reduce((s, x) => s + x.price, 0);
  const jew = chosen.filter((x) => ['rings', 'necklaces', 'earrings', 'bracelets', 'men'].includes(x.category));
  const pctOff = jew.length >= 3 ? 15 : jew.length >= 2 ? 10 : 0;
  const off = Math.round(jew.reduce((s, x) => s + x.price, 0) * pctOff) / 100;
  $('#fbt').innerHTML = `<div class="fbt-items">${list.map((x, i) => `${i ? '<span class="fbt-plus">+</span>' : ''}<div class="fbt-item ${fbtOn.has(x.id) ? '' : 'is-off'}">
      <label class="check"><input type="checkbox" data-fbt="${x.id}" ${fbtOn.has(x.id) ? 'checked' : ''} ${i === 0 ? 'disabled' : ''}><span class="box">${'<svg viewBox="0 0 12 12"><path d="M2 6.2 4.8 9 10 3.2"/></svg>'}</span></label>
      <a class="thumb" href="product.html?id=${x.id}"><img src="${img(x.id)}" alt="" loading="lazy"></a>
      <div><b>${i === 0 ? 'This item: ' : ''}${esc(x.name)}</b><div class="price" style="font-size:13px;margin-top:4px">${money(x.price)}${x.compareAt ? `<s>${money(x.compareAt)}</s>` : ''}</div></div></div>`).join('')}</div>
    <div class="fbt-sum">
      <span class="muted" style="font-size:13px">Total for ${chosen.length} item${chosen.length > 1 ? 's' : ''}</span>
      <div class="buy-price"><span class="now">${money2(sum - off)}</span>${off ? `<s>${money2(sum)}</s>` : ''}</div>
      ${off ? `<span style="color:var(--ok);font-weight:600;font-size:13px">You save ${money2(off)} with Stack &amp; Save (${pctOff}%)</span>` : '<span class="muted" style="font-size:13px">Add another piece to unlock Stack &amp; Save</span>'}
      <button class="btn btn-ink btn-lg btn-block" id="fbt-add">Add ${chosen.length > 1 ? `all ${chosen.length}` : ''} to bag</button>
    </div>`;
  $('#fbt-add').onclick = () => {
    if (fbtOn.has(p.id) && !validate()) return;
    chosen.forEach((x, i) => { const it = x.id === p.id ? item() : { id: x.id, finish: x.finishes?.[0] || 'polished', opts: defaults(x) }; if (i < chosen.length - 1) cart.add(it); else addToCart(it, $('#fbt .thumb img')); });
  };
}
$('#fbt').addEventListener('change', (e) => { const c = e.target.closest('[data-fbt]'); if (!c) return; c.checked ? fbtOn.add(c.dataset.fbt) : fbtOn.delete(c.dataset.fbt); renderFbt(); });
renderFbt();

/* ---------- Reviews ---------- */
const reviews = reviewsFor(p, 24);
const dist = ratingDistribution(p);
const rstate = { star: 0, sort: 'recent', shown: 5 };
$('#rsummary').innerHTML = `<div class="flex center gap-16"><span class="big">${p.rating}</span><div><span class="stars" style="--pct:${(p.rating / 5) * 100}%;font-size:18px"></span><div class="muted" style="font-size:13px;margin-top:6px">${p.reviews.toLocaleString()} verified reviews</div></div></div>
  <div class="dist">${dist.map((n, i) => `<button data-star="${5 - i}"><span>${5 - i}★</span><span class="meter"><i style="--v:${(n / p.reviews) * 100}%"></i></span><span class="muted">${n.toLocaleString()}</span></button>`).join('')}</div>
  <div class="cbox" style="padding:18px;gap:10px;font-size:13px"><div class="flex between"><span>Fit</span><b>${p.options?.size ? 'True to size' : '—'}</b></div><div class="flex between"><span>Would recommend</span><b>${Math.round(p.rating * 19.6)}%</b></div><div class="flex between"><span>Quality</span><b>Excellent</b></div></div>`;
function renderReviews() {
  let list = reviews.filter((r) => !rstate.star || r.stars === rstate.star);
  list = list.sort({ recent: (a, b) => b.date - a.date, helpful: (a, b) => b.helpful - a.helpful, high: (a, b) => b.stars - a.stars, low: (a, b) => a.stars - b.stars, photos: (a, b) => (b.photo ? 1 : 0) - (a.photo ? 1 : 0) }[rstate.sort]);
  $('#rfilters').innerHTML = `<select id="rsort" class="chip" style="padding-right:30px" aria-label="Sort reviews">${[['recent', 'Most recent'], ['helpful', 'Most helpful'], ['photos', 'With photos'], ['high', 'Highest rated'], ['low', 'Lowest rated']].map(([v, l]) => `<option value="${v}" ${rstate.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>${rstate.star ? `<button class="chip is-active" data-star="0">${rstate.star}★ only <span class="x">×</span></button>` : ''}`;
  $('#rsort').onchange = (e) => { rstate.sort = e.target.value; renderReviews(); };
  $('#rlist').innerHTML = list.slice(0, rstate.shown).map((r, i) => `<article class="review">
    <div class="who"><strong>${esc(r.name)}</strong><span class="muted">${esc(r.city)}</span>${r.verified ? `<span class="verified">${ICONS.check} Verified buyer</span>` : ''}${r.size ? `<span class="muted">Fit: ${r.size}</span>` : ''}</div>
    <div><div class="flex between center"><span class="stars" style="--pct:${r.stars * 20}%"></span><span class="muted" style="font-size:12px">${r.justNow ? 'Just now' : fmtDate(r.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
      <h4>${esc(r.title)}</h4><p>${esc(r.body)}</p>${r.photo ? `<img class="rphoto" src="${r.photo}" alt="Customer photo" loading="lazy">` : ''}
      <div class="helpful">Helpful? <button data-helpful="${i}">👍 ${r.helpful}</button><button>Report</button></div></div></article>`).join('') || '<p class="muted">No reviews with this rating yet.</p>';
  $('#more-reviews').classList.toggle('hide', rstate.shown >= list.length);
}
document.addEventListener('click', (e) => {
  const s = e.target.closest('[data-star]'); if (s) { rstate.star = +s.dataset.star; rstate.shown = 5; $$('.dist button').forEach((b) => b.classList.toggle('is-active', +b.dataset.star === rstate.star)); renderReviews(); }
  const h = e.target.closest('[data-helpful]'); if (h && !h.classList.contains('is-on')) { h.classList.add('is-on'); h.textContent = '👍 ' + (parseInt(h.textContent.replace(/\D/g, ''), 10) + 1); }
});
$('#more-reviews').addEventListener('click', () => { rstate.shown += 5; renderReviews(); });
$('#write-review').addEventListener('click', () => {
  openModal(`<form style="padding:40px;display:grid;gap:16px" id="rv-form"><p class="eyebrow">${esc(p.name)}</p><h2 class="display h2" style="margin:0">Write a review</h2>
    <div class="flex gap-8" id="rv-stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-rv="${n}" style="font-size:30px;line-height:1;color:var(--ink)">★</button>`).join('')}</div>
    <div class="field"><input id="rv-name" placeholder=" " required><label for="rv-name">Your name</label></div>
    <div class="field"><input id="rv-title" placeholder=" " required><label for="rv-title">Headline</label></div>
    <div class="field"><textarea id="rv-body" placeholder=" " required></textarea><label for="rv-body">Your review</label></div>
    <button class="btn btn-ink btn-lg">Submit review</button><p class="muted" style="font-size:12px;margin:0">Demo only — your review is shown on this device.</p></form>`, 'modal-sm');
  let stars = 5;
  const paint = () => $$('[data-rv]').forEach((b) => (b.style.color = +b.dataset.rv <= stars ? 'var(--ink)' : 'var(--line-2)'));
  $('#rv-stars').onclick = (e) => { const b = e.target.closest('[data-rv]'); if (b) { stars = +b.dataset.rv; paint(); } };
  $('#rv-form').onsubmit = (e) => {
    e.preventDefault();
    reviews.unshift({ name: $('#rv-name').value, city: 'Just now', stars, title: $('#rv-title').value, body: $('#rv-body').value, date: new Date(), justNow: true, helpful: 0, verified: false, photo: null });
    rstate.sort = 'recent'; rstate.star = 0; renderReviews(); closeModal();
    toast({ icon: ICONS.sparkle, html: '<strong>Thank you!</strong> Your review is live.', dark: true });
  };
});
renderReviews();

/* ---------- Related & recently viewed ---------- */
const related = [...PRODUCTS].filter((x) => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category) || b.sold - a.sold).slice(0, 4);
$('#related').innerHTML = related.map((x) => productCard(x)).join('');
const recent = store.get('recent', []).filter((x) => x !== p.id && byId[x]).slice(0, 8);
if (recent.length) { $('#recent-wrap').classList.remove('hide'); $('#recent').innerHTML = recent.map((x) => productCard(byId[x])).join(''); }
bindTilt(); reveal();
if (location.hash === '#3d') show3d();
