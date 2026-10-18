import { boot, $, $$, productCard, bindTilt, checkSvg, esc, remaining, param, closeDrawer } from './app.js';
import { PRODUCTS, CATEGORIES } from './products.js';

boot();

const q = { get: (k) => param(k) };
const state = {
  cats: new Set(q.get('cat') ? q.get('cat').split(',') : []),
  min: 0, max: 200,
  finishes: new Set(),
  rating: 0,
  sale: q.get('sale') === '1',
  low: false, isNew: q.get('sort') === 'new',
  sort: ['best', 'new', 'price-asc', 'price-desc', 'rating', 'discount'].includes(q.get('sort')) ? q.get('sort') : (q.get('sale') === '1' ? 'discount' : 'featured'),
  cols: 3,
};
try { state.cols = +(localStorage.getItem('ss:cols') || 3); } catch { /* ignore */ }

const box = (id, label, checked, count) => `<label class="check"><input type="checkbox" data-f="${id}" ${checked ? 'checked' : ''}><span class="box">${checkSvg}</span>${label}${count != null ? `<span class="count">${count}</span>` : ''}</label>`;

function renderFilters() {
  $('#f-cat').innerHTML = CATEGORIES.map((c) => box('cat:' + c.id, c.name, state.cats.has(c.id), PRODUCTS.filter((p) => p.category === c.id).length)).join('');
  $('#f-finish').innerHTML = [['polished', 'Mirror polished'], ['brushed', 'Satin brushed'], ['oxidized', 'Oxidized']].map(([f, l]) => box('fin:' + f, `<i class="swatch-dot sw-${f}" style="margin-right:2px"></i>${l}`, state.finishes.has(f), PRODUCTS.filter((p) => p.finishes?.includes(f)).length)).join('');
  $('#f-rating').innerHTML = [[4.8, '4.8 & up'], [4.5, '4.5 & up']].map(([r, l]) => `<label class="check"><input type="radio" name="rating" data-f="rate:${r}" ${state.rating === r ? 'checked' : ''}><span class="box" style="border-radius:50%">${checkSvg}</span><span class="stars" style="--pct:${r * 20}%"></span>${l}</label>`).join('');
  $('#f-avail').innerHTML = box('sale', '⚡ On sale', state.sale, PRODUCTS.filter((p) => p.compareAt).length) + box('new', 'New arrivals', state.isNew, PRODUCTS.filter((p) => p.isNew).length) + box('low', 'Almost gone', state.low, PRODUCTS.filter((p) => p.stock <= 7).length);
}

function header() {
  const only = state.cats.size === 1 ? CATEGORIES.find((c) => c.id === [...state.cats][0]) : null;
  $('#shop-title').innerHTML = state.sale && !only ? 'Flash <em class="serif-i">Sale</em>' : only ? esc(only.name) : 'Shop all';
  $('#shop-blurb').textContent = state.sale && !only ? `Up to 25% off our most-loved pieces. Prices return to normal in ${remaining().h}h ${remaining().m}m.` : only ? only.blurb : 'Every piece in 925 sterling silver, finished by hand and guaranteed for life.';
  $('#shop-eyebrow').textContent = state.sale ? '⚡ Today only' : only ? 'Collection' : 'The collection';
  $('#crumb-cat').textContent = only ? only.name : state.sale ? 'Sale' : '';
  $('#crumb-sep').classList.toggle('hide', !(only || state.sale));
  document.title = `${only ? only.name : state.sale ? 'Flash Sale' : 'Shop all'} — Silver Shop`;
  $('#cat-pills').innerHTML = [['', 'All'], ...CATEGORIES.slice(0, 6).map((c) => [c.id, c.name])].map(([id, n]) => `<button class="chip ${(!id && !state.cats.size) || (state.cats.size === 1 && state.cats.has(id)) ? 'is-active' : ''}" data-pill="${id}">${n}</button>`).join('');
}

function filtered() {
  let list = PRODUCTS.filter((p) =>
    (!state.cats.size || state.cats.has(p.category)) &&
    p.price >= state.min && (state.max >= 200 || p.price <= state.max) &&
    (!state.finishes.size || p.finishes?.some((f) => state.finishes.has(f))) &&
    p.rating >= state.rating && (!state.sale || p.compareAt) && (!state.isNew || p.isNew) && (!state.low || p.stock <= 7));
  const s = {
    featured: (a, b) => (b.flash ? 1 : 0) - (a.flash ? 1 : 0) || b.sold * b.rating - a.sold * a.rating,
    best: (a, b) => b.sold - a.sold, new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.rating - a.rating,
    'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    discount: (a, b) => (b.compareAt ? 1 - b.price / b.compareAt : 0) - (a.compareAt ? 1 - a.price / a.compareAt : 0),
  }[state.sort];
  return list.sort(s);
}

function chips() {
  const c = [];
  state.cats.forEach((id) => c.push([`cat:${id}`, CATEGORIES.find((x) => x.id === id).name]));
  state.finishes.forEach((f) => c.push([`fin:${f}`, f[0].toUpperCase() + f.slice(1)]));
  if (state.rating) c.push(['rate', `${state.rating}★ & up`]);
  if (state.sale) c.push(['sale', 'On sale']);
  if (state.isNew) c.push(['new', 'New']);
  if (state.low) c.push(['low', 'Almost gone']);
  if (state.min > 0 || state.max < 200) c.push(['price', `$${state.min}–${state.max >= 200 ? '200+' : '$' + state.max}`]);
  $('#chips').innerHTML = c.map(([k, l]) => `<button class="chip" data-chip="${k}">${l} <span class="x">×</span></button>`).join('');
}

function render() {
  const list = filtered();
  $('#count').textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
  $('#apply-mobile').textContent = list.length ? `Show ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}` : 'No matches — clear a filter';
  const grid = $('#grid');
  grid.style.setProperty('--cols', state.cols);
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><h3 class="display h3">No pieces match — yet.</h3><p class="muted">Try removing a filter, or browse our bestsellers.</p><button class="btn btn-ink" id="reset-empty">Clear filters</button></div>`;
  } else {
    const cards = list.map((p, i) => productCard(p, { lazy: i > 5 }).replace('class="card"', `class="card" style="--i:${i}"`));
    if (cards.length > 4) cards.splice(state.cols === 4 ? 7 : 5, 0, `<div class="promo-tile" style="--i:5"><div><p class="eyebrow" style="color:#8a8a92">Members only</p><div class="big silver-text" style="background-image:var(--silver-text-light);margin-top:14px">10% off</div><p style="margin-top:12px">Use code <b style="color:#fff;letter-spacing:.12em">SILVER10</b> at checkout. Stacks with Stack &amp; Save.</p></div><button class="btn btn-silver" data-apply-code="SILVER10">Apply code</button></div>`);
    grid.innerHTML = cards.join('');
  }
  bindTilt(grid);
  chips(); header();
  $$('.density button').forEach((b) => b.classList.toggle('is-active', +b.dataset.cols === state.cols));
  $('#sort').value = state.sort;
  const u = new URL(location.href);
  u.search = '';
  if (state.cats.size) u.searchParams.set('cat', [...state.cats].join(','));
  if (state.sale) u.searchParams.set('sale', '1');
  if (state.sort !== 'featured') u.searchParams.set('sort', state.sort);
  history.replaceState(null, '', u);
}

function rangeUI() {
  const a = $('#r-min'), b = $('#r-max');
  a.value = state.min; b.value = state.max;
  $('#r-fill').style.left = (state.min / 200) * 100 + '%';
  $('#r-fill').style.right = 100 - (state.max / 200) * 100 + '%';
  $('#r-min-v').textContent = '$' + state.min;
  $('#r-max-v').textContent = state.max >= 200 ? '$200+' : '$' + state.max;
}

document.addEventListener('change', (e) => {
  const f = e.target.dataset.f; if (!f) return;
  const [k, v] = f.split(':');
  if (k === 'cat') e.target.checked ? state.cats.add(v) : state.cats.delete(v);
  if (k === 'fin') e.target.checked ? state.finishes.add(v) : state.finishes.delete(v);
  if (k === 'rate') state.rating = +v;
  if (k === 'sale') state.sale = e.target.checked;
  if (k === 'new') state.isNew = e.target.checked;
  if (k === 'low') state.low = e.target.checked;
  render();
});
['#r-min', '#r-max'].forEach((s) => $(s).addEventListener('input', () => {
  let a = +$('#r-min').value, b = +$('#r-max').value;
  if (a > b - 10) { if (document.activeElement.id === 'r-min') a = b - 10; else b = a + 10; }
  state.min = Math.max(0, a); state.max = Math.min(200, b); rangeUI(); render();
}));
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
$$('.density button').forEach((b) => b.addEventListener('click', () => { state.cols = +b.dataset.cols; try { localStorage.setItem('ss:cols', state.cols); } catch { /* ignore */ } render(); }));
document.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-chip]');
  if (chip) {
    const [k, v] = chip.dataset.chip.split(':');
    if (k === 'cat') state.cats.delete(v); if (k === 'fin') state.finishes.delete(v);
    if (k === 'rate') state.rating = 0; if (k === 'sale') state.sale = false; if (k === 'new') state.isNew = false; if (k === 'low') state.low = false;
    if (k === 'price') { state.min = 0; state.max = 200; rangeUI(); }
    renderFilters(); render();
  }
  const pill = e.target.closest('[data-pill]');
  if (pill) { state.cats = new Set(pill.dataset.pill ? [pill.dataset.pill] : []); renderFilters(); render(); }
  if (e.target.closest('#clear-all, #reset-empty')) { Object.assign(state, { cats: new Set(), finishes: new Set(), rating: 0, sale: false, isNew: false, low: false, min: 0, max: 200 }); rangeUI(); renderFilters(); render(); }
  if (e.target.closest('#open-filters')) { $('#filters').classList.add('is-open'); $('#scrim').classList.add('is-open'); document.body.classList.add('is-locked'); }
  if (e.target.closest('#apply-mobile, #close-filters')) { closeDrawer(); if (e.target.closest('#apply-mobile')) scrollTo({ top: $('.toolbar').offsetTop - 70, behavior: 'smooth' }); }
});

renderFilters(); rangeUI(); render();
