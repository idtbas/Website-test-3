/* Silver Club — sign up, sign in and the member dashboard. Demo: accounts live in this browser only. */
import { boot, $, $$, esc, money, money2, account, ICONS, toast, confetti, cart, productCard, bindTilt, wishlist, store, session, POINT_VALUE, WELCOME_POINTS, TIERS, fmtDate, checkSvg, reveal, optsText, dispatchDate, TAX, openDrawer, mountGoogleButton, googleEnabled } from './app.js';
import { PRODUCTS, byId, img } from './products.js';

boot();
const root = $('#acct-root');
let mode = ['signin', 'reset'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'join';
let tab = ['orders', 'saved', 'addresses', 'profile'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';

const field = (id, label, { type = 'text', value = '', ac = '', req = true, extra = '', hint = '' } = {}) =>
  `<div class="field" data-field="${id}"><input id="${id}" name="${id}" type="${type}" placeholder=" " value="${esc(value)}" ${ac ? `autocomplete="${ac}"` : ''} ${req ? 'required' : ''} ${extra}><label for="${id}">${label}</label>${hint ? `<span class="hint-sm">${hint}</span>` : ''}<span class="err" role="alert"></span></div>`;
const pwField = (id, label, ac) => `<div class="field pw" data-field="${id}"><input id="${id}" name="${id}" type="password" placeholder=" " autocomplete="${ac}" required minlength="8"><label for="${id}">${label}</label><button type="button" class="pw-toggle" data-pw="${id}" aria-label="Show password">Show</button><span class="err" role="alert"></span></div>`;
const setErr = (id, msg) => { const f = $(`[data-field="${id}"]`); if (!f) return !msg; f.classList.toggle('is-invalid', !!msg); f.classList.toggle('is-valid', !msg && !!$('#' + id)?.value); $('.err', f).textContent = msg || ''; return !msg; };
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const memberNo = (u) => 'SC ' + String(Math.abs([...u.email].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7))).padStart(8, '0').slice(0, 8).replace(/(\d{4})(\d{4})/, '$1 $2');

function clubCard(u) {
  const t = u ? account.tier(u) : TIERS[0];
  return `<div class="club-card ${u ? 'is-member' : ''}" data-tilt="10">
    <div class="cc-top"><span class="cc-logo">Silver <i>Club</i></span><span class="cc-tier">${t.name}</span></div>
    <div class="cc-chip"></div>
    <div class="cc-points"><b>${(u ? u.points : WELCOME_POINTS).toLocaleString()}</b><span>Silver Points · ${money2((u ? u.points : WELCOME_POINTS) * POINT_VALUE)}</span></div>
    <div class="cc-bottom"><span>${u ? esc(u.first + ' ' + u.last) : 'Your name here'}</span><span>${u ? memberNo(u) : 'SC 0000 0000'}</span></div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Signed out: join / sign in / reset                                  */
/* ------------------------------------------------------------------ */
function renderAuth() {
  document.title = 'Join the Silver Club — Silver Shop';
  root.innerHTML = `<section class="auth">
    <div class="club">
      <p class="eyebrow">The Silver Club · free to join</p>
      <h1 class="display h1">Members <em class="serif-i">shine</em> brighter.</h1>
      <p class="lead">One account for your orders, sizes and saved pieces — and it pays you back on everything you buy.</p>
      ${clubCard(null)}
      <ul class="perks">
        <li>${ICONS.gift}<span><b>$12.50 welcome credit</b>250 points the moment you join — use them on your first order.</span></li>
        <li>${ICONS.sparkle}<span><b>5% back, always</b>1 Silver Point for every $1. Points never expire.</span></li>
        <li>${ICONS.cake}<span><b>A birthday gift</b>Something silver from us, every year.</span></li>
        <li>${ICONS.box}<span><b>Tracking &amp; one-tap reorders</b>See every order and buy again in a tap.</span></li>
      </ul>
    </div>
    <div class="auth-card" id="auth-card">
      <div class="seg" role="tablist" aria-label="Account">
        <button role="tab" data-mode="join" aria-selected="${mode === 'join'}">Create account</button>
        <button role="tab" data-mode="signin" aria-selected="${mode !== 'join'}">Sign in</button>
      </div>
      <div class="sso hide" data-sso><div class="g-btn" id="g-btn"></div><div class="or">or use your email</div></div>
      <form id="join-form" class="auth-form ${mode === 'join' ? '' : 'hide'}" novalidate>
        <div><h2 class="display h3">Create your account</h2><p class="muted">Takes 30 seconds. Your $12.50 credit is applied right away.</p></div>
        <div class="row-2">${field('j-first', 'First name', { ac: 'given-name' })}${field('j-last', 'Last name', { ac: 'family-name' })}</div>
        ${field('j-email', 'Email address', { type: 'email', ac: 'email', extra: 'inputmode="email"' })}
        ${pwField('j-pass', 'Create a password', 'new-password')}
        <div class="strength" id="strength" aria-live="polite"><div class="bars"><i></i><i></i><i></i><i></i></div><span id="strength-l">At least 8 characters</span></div>
        ${field('j-bday', 'Birthday (optional, for your gift)', { type: 'date', req: false, ac: 'bday' })}
        <label class="check"><input type="checkbox" id="j-news" checked><span class="box">${checkSvg}</span><span>Send me early access to drops and member-only sales</span></label>
        <label class="check" data-field="j-terms"><input type="checkbox" id="j-terms"><span class="box">${checkSvg}</span><span>I agree to the Terms and Privacy Policy <span class="err" role="alert" style="display:inline"></span></span></label>
        <button class="btn btn-ink btn-lg btn-block" type="submit">Create account · get $12.50</button>
        <p class="switch">Already a member? <button type="button" data-mode="signin">Sign in</button></p>
      </form>
      <form id="signin-form" class="auth-form ${mode === 'signin' ? '' : 'hide'}" novalidate>
        <div><h2 class="display h3">Welcome back</h2><p class="muted">Sign in to see your orders and use your points.</p></div>
        ${field('s-email', 'Email address', { type: 'email', ac: 'email', extra: 'inputmode="email"' })}
        ${pwField('s-pass', 'Password', 'current-password')}
        <div class="flex between center"><label class="check"><input type="checkbox" id="s-remember" checked><span class="box">${checkSvg}</span>Keep me signed in</label><button type="button" class="link-btn" data-mode="reset">Forgot password?</button></div>
        <button class="btn btn-ink btn-lg btn-block" type="submit">Sign in</button>
        <p class="switch">New here? <button type="button" data-mode="join">Create an account</button> and get $12.50 off.</p>
      </form>
      <form id="reset-form" class="auth-form ${mode === 'reset' ? '' : 'hide'}" novalidate>
        <div><h2 class="display h3">Reset your password</h2><p class="muted">In a live store we’d email you a secure link. In this demo you can set a new password right here.</p></div>
        ${field('r-email', 'Email address', { type: 'email', ac: 'email' })}
        ${pwField('r-pass', 'New password', 'new-password')}
        <button class="btn btn-ink btn-lg btn-block" type="submit">Update password &amp; sign in</button>
        <p class="switch"><button type="button" data-mode="signin">Back to sign in</button></p>
      </form>
      <p class="demo-small">${ICONS.lock} Demo store: accounts are saved only in this browser, with salted and hashed passwords. Don’t reuse a real password.</p>
    </div>
  </section>`;
  bindTilt(root);
  if (googleEnabled()) mountGoogleButton($('#g-btn'), (r) => { if (r.ok) afterAuth(r.created); else toast({ html: r.msg, dark: true }); });
  if (location.hash === '#join' || location.hash === '#signin') setTimeout(() => $('#auth-card').scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
}

function setMode(m) {
  mode = m;
  $$('.seg [data-mode]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m || (m === 'reset' && b.dataset.mode === 'signin'))));
  ['join', 'signin', 'reset'].forEach((x) => $(`#${x}-form`).classList.toggle('hide', x !== m));
  history.replaceState(null, '', '#' + m);
  $(`#${m}-form input`)?.focus({ preventScroll: true });
}

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  if (pw.length < 8) s = Math.min(s, 1);
  return s;
}

function afterAuth(welcome) {
  const next = session.get('next', null);
  session.set('next', null);
  if (welcome) {
    confetti({ count: 120 });
    toast({ icon: ICONS.gift, html: `<strong>Welcome, ${esc(account.user.first)}!</strong> 250 points ($12.50) are in your account.`, sub: 'Use them at checkout', dark: true, timeout: 5200 });
  } else toast({ icon: ICONS.check, html: `<strong>Signed in.</strong> Welcome back, ${esc(account.user.first)}.`, dark: true, timeout: 3000 });
  if (next) { setTimeout(() => { location.href = next; }, welcome ? 1300 : 500); return; }
  tab = 'overview'; history.replaceState(null, '', location.pathname);
  render(); scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ */
/* Signed in: dashboard                                                */
/* ------------------------------------------------------------------ */
function orderStatus(o) {
  const now = Date.now(), placed = o.at;
  const ship = +dispatchDate(new Date(placed)) + 16 * 36e5;
  const eta = (o.totals?.eta || [placed + 3 * 864e5, placed + 5 * 864e5]).map(Number);
  if (now < ship) return { key: 'finishing', label: 'Being hand-finished', step: 1, eta };
  if (now < eta[1]) return { key: 'shipped', label: 'On its way', step: 2, eta };
  return { key: 'delivered', label: 'Delivered', step: 3, eta };
}

function renderDash() {
  const u = account.user, t = account.tier(u), nt = account.nextTier(u);
  document.title = 'Your account — Silver Shop';
  const progress = nt ? Math.min(100, (u.lifetime / nt.min) * 100) : 100;
  root.innerHTML = `<section class="dash">
    <header class="dash-head">
      <div><p class="eyebrow">Silver Club · member since ${fmtDate(u.created, { month: 'long', year: 'numeric' })}</p><h1 class="display h2">${greet()}, <em class="serif-i">${esc(u.first)}.</em></h1></div>
      <button class="btn btn-ghost btn-sm" data-logout>${ICONS.logout} Sign out</button>
    </header>
    <div class="dash-top">
      ${clubCard(u)}
      <div class="tier-box">
        <div class="flex between center wrap-f gap-8"><span class="eyebrow">Your tier</span><span class="tag tag-silver">${t.name}</span></div>
        <p class="tier-perk">${t.perk}</p>
        <div class="meter"><i style="--v:${progress}%"></i></div>
        <p class="muted tier-next">${nt ? `<b>${(nt.min - u.lifetime).toLocaleString()} points</b> to ${nt.name} — ${nt.perk}` : 'You’ve reached our highest tier. Thank you.'}</p>
        <div class="points-cta"><div><b>${money2(u.points * POINT_VALUE)}</b><span>ready to spend</span></div><a class="btn btn-ink" href="shop.html">Spend my points</a></div>
      </div>
    </div>
    <nav class="dash-tabs" role="tablist" aria-label="Account sections">
      ${[['overview', 'Overview'], ['orders', `Orders${u.orders.length ? ` (${u.orders.length})` : ''}`], ['saved', `Saved${wishlist.ids.size ? ` (${wishlist.ids.size})` : ''}`], ['addresses', 'Addresses'], ['profile', 'Profile']].map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${tab === k}">${l}</button>`).join('')}
    </nav>
    <div id="dash-panel" class="dash-panel"></div>
  </section>`;
  bindTilt(root);
  renderPanel();
}

function orderCard(o, open = false) {
  const st = orderStatus(o);
  const items = o.lines || [];
  return `<article class="order ${open ? 'is-open' : ''}" data-order="${esc(o.no)}">
    <header class="order-head" data-toggle-order>
      <div><b>${esc(o.no)}</b><small>${fmtDate(o.at, { month: 'short', day: 'numeric', year: 'numeric' })} · ${items.reduce((s, l) => s + l.qty, 0)} item${items.length > 1 ? 's' : ''}</small></div>
      <div class="order-thumbs">${items.slice(0, 4).map((l) => `<img src="${img(l.id)}" alt="">`).join('')}</div>
      <span class="status s-${st.key}">${st.label}</span>
      <b class="order-total">${money2(o.totals.total)}</b>
    </header>
    <div class="order-body">
      <ol class="track">${['Placed', 'Hand-finished', 'Shipped', 'Delivered'].map((s, i) => `<li class="${i <= st.step ? 'is-done' : ''}"><span></span>${s}</li>`).join('')}</ol>
      <p class="muted" style="margin:0;font-size:13px">${st.key === 'delivered' ? `Delivered ${fmtDate(st.eta[1])}` : `Estimated delivery ${fmtDate(st.eta[0])} – ${fmtDate(st.eta[1])}`} · ${esc(o.totals.shipName || 'Standard')}</p>
      <div class="order-lines">${items.map((l) => `<div class="sum-item"><div class="thumb"><img src="${img(l.id)}" alt=""><span class="q">${l.qty}</span></div><div><b>${esc(l.name)}</b><small>${esc(l.opts || '')}${l.engraving ? ` · “${esc(l.engraving)}”` : ''}</small></div><b>${l.total ? money2(l.total) : 'Free'}</b></div>`).join('')}</div>
      <div class="order-actions"><button class="btn btn-ink btn-sm" data-reorder="${esc(o.no)}">Buy again</button><button class="btn btn-ghost btn-sm" data-info="returns">Start a return</button><button class="btn btn-ghost btn-sm" data-info="warranty">Resize or polish</button></div>
    </div>
  </article>`;
}

function renderPanel() {
  const u = account.user, p = $('#dash-panel');
  $$('.dash-tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  if (tab === 'overview') {
    const bought = new Set(u.orders.flatMap((o) => (o.lines || []).map((l) => l.id)));
    const seed = [...wishlist.ids, ...store.get('recent', [])].filter((id) => byId[id] && !bought.has(id));
    const picks = [...new Set([...seed, ...[...PRODUCTS].sort((a, b) => b.sold - a.sold).map((x) => x.id)])].filter((id) => !bought.has(id)).slice(0, 4).map((id) => byId[id]);
    const t = cart.totals();
    p.innerHTML = `
      ${cart.items.length ? `<div class="bag-waiting"><div class="bw-thumbs">${cart.items.slice(0, 3).map((i) => `<img src="${img(i.id)}" alt="">`).join('')}</div><div><b>Your bag is waiting</b><span>${cart.count()} piece${cart.count() > 1 ? 's' : ''} · ${money2(t.afterDiscount)}${u.points ? ` · use ${money2(Math.min(u.points * POINT_VALUE, t.afterDiscount))} in points` : ''}</span></div><a class="btn btn-ink btn-sm" href="checkout.html">Checkout</a></div>` : ''}
      <div class="ov-grid">
        <div class="cbox"><div class="flex between center"><h3 class="eyebrow" style="margin:0">Latest order</h3>${u.orders.length ? '<button class="link-btn" data-tab="orders">All orders</button>' : ''}</div>
          ${u.orders.length ? orderCard(u.orders[0], false) : `<div class="ov-empty">${ICONS.box}<p><b>No orders yet.</b> Your ${money2(u.points * POINT_VALUE)} credit is ready for your first piece.</p><a class="btn btn-silver btn-sm" href="shop.html?sort=best">Shop bestsellers</a></div>`}
        </div>
        <div class="cbox"><h3 class="eyebrow" style="margin:0">Points activity</h3>
          <ul class="history">${u.history.slice(0, 5).map((h) => `<li><span>${esc(h.note)}<small>${fmtDate(h.at, { month: 'short', day: 'numeric' })}</small></span><b class="${h.pts < 0 ? 'neg' : ''}">${h.pts > 0 ? '+' : ''}${h.pts}</b></li>`).join('')}</ul>
        </div>
      </div>
      <div class="section-head" style="margin:48px 0 24px"><h2 class="display h3">Picked for you</h2><a class="btn-link" href="shop.html">Shop all ${ICONS.arrow}</a></div>
      <div class="grid grid-4">${picks.map((x) => productCard(x)).join('')}</div>`;
  }
  if (tab === 'orders') {
    p.innerHTML = u.orders.length ? `<div class="orders">${u.orders.map((o, i) => orderCard(o, i === 0)).join('')}</div>`
      : `<div class="empty">${ICONS.box.replace('<svg', '<svg width="44" height="44"')}<h3 class="display h3">No orders yet</h3><p class="muted">When you place an order it appears here with live tracking.</p><a class="btn btn-ink" href="shop.html">Start shopping</a></div>`;
  }
  if (tab === 'saved') {
    const ids = [...wishlist.ids].filter((id) => byId[id]);
    p.innerHTML = ids.length ? `<div class="grid grid-4">${ids.map((id) => productCard(byId[id])).join('')}</div>`
      : `<div class="empty">${ICONS.heartO.replace('<svg', '<svg width="44" height="44"')}<h3 class="display h3">Nothing saved yet</h3><p class="muted">Tap the heart on any piece and it will wait for you here.</p><a class="btn btn-ink" href="shop.html">Discover</a></div>`;
  }
  if (tab === 'addresses') renderAddresses();
  if (tab === 'profile') renderProfile();
  bindTilt(p); reveal(p);
}

/* Addresses */
let editing = null;
function renderAddresses() {
  const u = account.user, p = $('#dash-panel');
  const a = editing != null && editing >= 0 ? u.addresses[editing] : { first: u.first, last: u.last, country: 'US' };
  p.innerHTML = `<div class="addr-grid">
    ${u.addresses.map((ad, i) => `<div class="addr ${ad.default ? 'is-default' : ''}">${ad.default ? '<span class="tag tag-ink tag-xs">Default</span>' : ''}<p><b>${esc(ad.first)} ${esc(ad.last)}</b><br>${esc(ad.address)}${ad.apt ? ', ' + esc(ad.apt) : ''}<br>${esc(ad.city)}${ad.region ? ', ' + esc(ad.region) : ''} ${esc(ad.postal)}<br>${esc(TAX[ad.country]?.name || ad.country)}${ad.phone ? '<br>' + esc(ad.phone) : ''}</p>
      <div class="addr-actions"><button class="link-btn" data-addr-edit="${i}">Edit</button>${ad.default ? '' : `<button class="link-btn" data-addr-default="${i}">Make default</button>`}<button class="link-btn" data-addr-del="${i}">Remove</button></div></div>`).join('')}
    ${editing == null ? `<button class="addr addr-new" data-addr-edit="-1">${ICONS.plus}<span>Add an address</span></button>` : ''}
  </div>
  ${editing != null ? `<form class="cbox addr-form" id="addr-form" novalidate><h3 class="display h3" style="margin:0">${editing >= 0 ? 'Edit address' : 'New address'}</h3>
    <div class="field"><select id="a-country">${Object.entries(TAX).map(([k, v]) => `<option value="${k}" ${k === a.country ? 'selected' : ''}>${v.name}</option>`).join('')}</select><label for="a-country">Country / region</label></div>
    <div class="row-2">${field('a-first', 'First name', { value: a.first, ac: 'given-name' })}${field('a-last', 'Last name', { value: a.last, ac: 'family-name' })}</div>
    ${field('a-address', 'Address', { value: a.address, ac: 'address-line1' })}${field('a-apt', 'Apartment, suite (optional)', { value: a.apt, req: false, ac: 'address-line2' })}
    <div class="row-3">${field('a-city', 'City', { value: a.city, ac: 'address-level2' })}${field('a-region', 'State / region', { value: a.region, req: false, ac: 'address-level1' })}${field('a-postal', 'Postal code', { value: a.postal, ac: 'postal-code' })}</div>
    ${field('a-phone', 'Phone (optional)', { type: 'tel', value: a.phone, req: false, ac: 'tel' })}
    <label class="check"><input type="checkbox" id="a-default" ${a.default || !u.addresses.length ? 'checked' : ''}><span class="box">${checkSvg}</span>Use as my default shipping address</label>
    <div class="flex gap-12 wrap-f"><button class="btn btn-ink" type="submit">Save address</button><button class="btn btn-ghost" type="button" data-addr-cancel>Cancel</button></div></form>` : ''}`;
}

/* Profile */
function renderProfile() {
  const u = account.user, p = $('#dash-panel');
  p.innerHTML = `<div class="profile-grid">
    <form class="cbox" id="profile-form" novalidate><h3 class="display h3" style="margin:0">Personal details</h3>
      <div class="row-2">${field('p-first', 'First name', { value: u.first, ac: 'given-name' })}${field('p-last', 'Last name', { value: u.last, ac: 'family-name' })}</div>
      ${field('p-email', 'Email address', { type: 'email', value: u.email, ac: 'email' })}
      <div class="row-2">${field('p-phone', 'Phone (optional)', { type: 'tel', value: u.phone, req: false, ac: 'tel' })}${field('p-bday', 'Birthday', { type: 'date', value: u.birthday, req: false, ac: 'bday' })}</div>
      <button class="btn btn-ink" type="submit">Save changes</button></form>
    <div class="grid" style="gap:24px;align-content:start">
      <form class="cbox" id="pw-form" novalidate><h3 class="display h3" style="margin:0">Password</h3>${u.google ? `<p class="g-note"><svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.6-3.9-12.3-9.1H4.4v5.7C8 41.1 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.7 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.4C2.9 17.1 2 20.4 2 24s.9 6.9 2.4 9.9l7.3-5.7z"/><path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8 6.9 4.4 14.1l7.3 5.7c1.7-5.2 6.6-9.1 12.3-9.1z"/></svg>You sign in with Google${u.pw ? '' : '. Add a password to also sign in with your email.'}</p>` : ''}${u.pw ? pwField('pw-cur', 'Current password', 'current-password') : ''}${pwField('pw-new', u.pw ? 'New password (8+ characters)' : 'Password (8+ characters)', 'new-password')}<button class="btn btn-ghost" type="submit">${u.pw ? 'Update password' : 'Add password'}</button></form>
      <div class="cbox"><h3 class="display h3" style="margin:0">Preferences</h3>
        <label class="pref"><span><b>Early access emails</b><small>New drops and member-only sales</small></span><span class="toggle"><input type="checkbox" id="pref-news" ${u.news ? 'checked' : ''} aria-label="Early access emails"><i></i></span></label>
        <label class="pref"><span><b>Price-drop alerts</b><small>When something you saved goes on sale</small></span><span class="toggle"><input type="checkbox" id="pref-drop" ${u.drops !== false ? 'checked' : ''} aria-label="Price-drop alerts"><i></i></span></label>
      </div>
      <div class="cbox danger"><h3 class="display h3" style="margin:0">Delete account</h3><p class="muted" style="margin:0;font-size:14px">Removes your account, points and order history from this browser.</p><div id="del-zone"><button class="btn btn-ghost btn-sm" data-del>Delete my account</button></div></div>
    </div></div>`;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */
root.addEventListener('click', async (e) => {
  const m = e.target.closest('[data-mode]'); if (m) { e.preventDefault(); setMode(m.dataset.mode); }
  const pw = e.target.closest('[data-pw]');
  if (pw) { const i = $('#' + pw.dataset.pw); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; pw.textContent = show ? 'Hide' : 'Show'; pw.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); }
  const tb = e.target.closest('[data-tab]');
  if (tb && account.user) { tab = tb.dataset.tab; editing = null; history.replaceState(null, '', tab === 'overview' ? location.pathname : '#' + tab); renderPanel(); if (tb.closest('.cbox')) $('.dash-tabs').scrollIntoView({ behavior: 'smooth' }); }
  if (e.target.closest('[data-logout]')) { account.logout(); toast({ icon: ICONS.logout, html: 'You’ve been signed out.', dark: true, timeout: 2600 }); mode = 'signin'; render(); }
  const tg = e.target.closest('[data-toggle-order]'); if (tg && tab === 'orders') tg.parentElement.classList.toggle('is-open');
  const ro = e.target.closest('[data-reorder]');
  if (ro) {
    const o = account.user.orders.find((x) => x.no === ro.dataset.reorder);
    (o.items || []).filter((i) => byId[i.id]).forEach((i) => cart.add({ id: i.id, finish: i.finish, opts: i.opts, qty: i.qty, engraving: i.engraving || '' }));
    openDrawer('bag');
  }
  const ae = e.target.closest('[data-addr-edit]'); if (ae) { editing = +ae.dataset.addrEdit; renderAddresses(); $('#addr-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  if (e.target.closest('[data-addr-cancel]')) { editing = null; renderAddresses(); }
  const ad = e.target.closest('[data-addr-default]'); if (ad) { const u = account.user; u.addresses.forEach((a, i) => (a.default = i === +ad.dataset.addrDefault)); account.update({}); renderAddresses(); }
  const dl = e.target.closest('[data-addr-del]'); if (dl) { const u = account.user; const was = u.addresses[+dl.dataset.addrDel].default; u.addresses.splice(+dl.dataset.addrDel, 1); if (was && u.addresses[0]) u.addresses[0].default = true; account.update({}); renderAddresses(); }
  if (e.target.closest('[data-del]')) $('#del-zone').innerHTML = `<p style="margin:0 0 10px;font-weight:600">This can’t be undone. ${account.user.points} points will be lost.</p><div class="flex gap-8 wrap-f"><button class="btn btn-ink btn-sm" data-del-yes>Delete permanently</button><button class="btn btn-ghost btn-sm" data-del-no>Keep my account</button></div>`;
  if (e.target.closest('[data-del-no]')) renderProfile();
  if (e.target.closest('[data-del-yes]')) { account.remove(); toast({ html: 'Your account was deleted.', dark: true }); mode = 'join'; render(); }
});

root.addEventListener('input', (e) => {
  if (e.target.id === 'j-pass') {
    const s = strength(e.target.value);
    $$('#strength .bars i').forEach((b, i) => b.classList.toggle('on', i < s));
    $('#strength').dataset.s = s;
    $('#strength-l').textContent = !e.target.value ? 'At least 8 characters' : e.target.value.length < 8 ? `${8 - e.target.value.length} more character${8 - e.target.value.length > 1 ? 's' : ''}` : ['Weak', 'Weak', 'Fair', 'Strong', 'Excellent'][s];
  }
  const f = e.target.closest('.field.is-invalid'); if (f) { f.classList.remove('is-invalid'); }
});

root.addEventListener('change', (e) => {
  const u = account.user; if (!u) return;
  if (e.target.id === 'pref-news') { account.update({ news: e.target.checked }); toast({ html: e.target.checked ? 'Early access emails on' : 'Early access emails off', dark: true, timeout: 2000 }); }
  if (e.target.id === 'pref-drop') { account.update({ drops: e.target.checked }); toast({ html: e.target.checked ? 'Price-drop alerts on' : 'Price-drop alerts off', dark: true, timeout: 2000 }); }
});

const busy = (form, on) => { const b = $('button[type=submit]', form); b.classList.toggle('is-loading', on); if (on) { b.dataset.html = b.innerHTML; b.innerHTML = '<span class="spinner"></span>'; } else if (b.dataset.html) b.innerHTML = b.dataset.html; };

root.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target, v = (id) => ($('#' + id)?.value || '').trim();
  if (f.id === 'join-form') {
    const ok = [
      setErr('j-first', v('j-first') ? '' : 'Enter your first name'),
      setErr('j-last', v('j-last') ? '' : 'Enter your last name'),
      setErr('j-email', emailOk(v('j-email')) ? (account.exists(v('j-email')) ? 'You already have an account — sign in instead' : '') : 'Enter a valid email, like name@example.com'),
      setErr('j-pass', $('#j-pass').value.length >= 8 ? '' : 'Use at least 8 characters'),
    ];
    const terms = $('#j-terms').checked;
    $('[data-field="j-terms"] .err').textContent = terms ? '' : '— required';
    if (ok.includes(false) || !terms) { $('.field.is-invalid input, #j-terms:not(:checked)', f)?.focus(); return; }
    busy(f, true);
    await new Promise((r) => setTimeout(r, 650));
    const r = await account.register({ first: v('j-first'), last: v('j-last'), email: v('j-email'), password: $('#j-pass').value, birthday: v('j-bday'), news: $('#j-news').checked });
    busy(f, false);
    if (!r.ok) { setErr('j-email', r.msg); return; }
    afterAuth(true);
  }
  if (f.id === 'signin-form') {
    const ok = [setErr('s-email', emailOk(v('s-email')) ? '' : 'Enter the email you signed up with'), setErr('s-pass', $('#s-pass').value ? '' : 'Enter your password')];
    if (ok.includes(false)) return;
    busy(f, true);
    await new Promise((r) => setTimeout(r, 450));
    const r = await account.login(v('s-email'), $('#s-pass').value);
    busy(f, false);
    if (!r.ok) { setErr(r.field === 'email' ? 's-email' : 's-pass', r.msg); return; }
    afterAuth(false);
  }
  if (f.id === 'reset-form') {
    const ok = [setErr('r-email', !emailOk(v('r-email')) ? 'Enter a valid email' : account.exists(v('r-email')) ? '' : 'No account uses that email'), setErr('r-pass', $('#r-pass').value.length >= 8 ? '' : 'Use at least 8 characters')];
    if (ok.includes(false)) return;
    await account.setPassword($('#r-pass').value, v('r-email'));
    await account.login(v('r-email'), $('#r-pass').value);
    afterAuth(false);
  }
  if (f.id === 'addr-form') {
    const ok = ['a-first', 'a-last', 'a-address', 'a-city', 'a-postal'].map((id) => setErr(id, v(id) ? '' : 'Required'));
    if (ok.includes(false)) return;
    const u = account.user;
    const ad = { country: $('#a-country').value, first: v('a-first'), last: v('a-last'), address: v('a-address'), apt: v('a-apt'), city: v('a-city'), region: v('a-region'), postal: v('a-postal'), phone: v('a-phone'), default: $('#a-default').checked };
    if (ad.default) u.addresses.forEach((a) => (a.default = false));
    if (editing >= 0) u.addresses[editing] = ad; else u.addresses.push(ad);
    if (!u.addresses.some((a) => a.default)) u.addresses[0].default = true;
    account.update({}); editing = null; renderAddresses();
    toast({ icon: ICONS.pin, html: 'Address saved', sub: 'Pre-filled at checkout', dark: true, timeout: 2400 });
  }
  if (f.id === 'profile-form') {
    const ok = [setErr('p-first', v('p-first') ? '' : 'Required'), setErr('p-last', v('p-last') ? '' : 'Required'), setErr('p-email', emailOk(v('p-email')) ? '' : 'Enter a valid email')];
    if (ok.includes(false)) return;
    const r = account.update({ first: v('p-first'), last: v('p-last'), email: v('p-email'), phone: v('p-phone'), birthday: v('p-bday') });
    if (!r.ok) { setErr('p-email', r.msg); return; }
    toast({ icon: ICONS.check, html: 'Details saved', dark: true, timeout: 2200 });
    renderDash(); tab = 'profile'; renderPanel();
  }
  if (f.id === 'pw-form') {
    const hadPw = !!account.user.pw;
    const cur = !hadPw || await account.checkPassword($('#pw-cur').value);
    const ok = [setErr('pw-cur', cur ? '' : 'That isn’t your current password'), setErr('pw-new', $('#pw-new').value.length >= 8 ? '' : 'Use at least 8 characters')];
    if (ok.includes(false)) return;
    await account.setPassword($('#pw-new').value);
    f.reset(); $$('.field', f).forEach((x) => x.classList.remove('is-valid'));
    toast({ icon: ICONS.lock, html: hadPw ? 'Password updated' : 'Password added. You can now sign in with email too.', dark: true, timeout: 2600 });
    if (!hadPw) renderProfile();
  }
});

function render() { account.user ? renderDash() : renderAuth(); }
render();
