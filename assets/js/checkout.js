/* Silver Shop — checkout. Demo only: no payment data leaves the browser and nothing is charged. */
import { boot, $, $$, money2, esc, cart, TAX, ICONS, checkSvg, fmtDate, confetti, toast, store, session, account, POINT_VALUE, WELCOME_POINTS, FREE_GIFT, dispatchDate, rewardMeter, gapFillHtml, optsText, mountGoogleButton, googleEnabled } from './app.js';
import { byId, img } from './products.js';

boot({ chrome: false });

const ss = {
  get(k, d) { try { const v = sessionStorage.getItem('co:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { sessionStorage.setItem('co:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const US_STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
const COUNTRIES = {
  US: { region: 'State', regions: US_STATES, postal: 'ZIP code', re: /^\d{5}(-\d{4})?$/, ex: '10001' },
  CA: { region: 'Province', regions: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'], postal: 'Postal code', re: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ex: 'M5V 2T6' },
  GB: { region: 'County (optional)', optional: true, postal: 'Postcode', re: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/, ex: 'SW1A 1AA' },
  DE: { postal: 'PLZ', re: /^\d{5}$/, ex: '10115' },
  FR: { postal: 'Code postal', re: /^\d{5}$/, ex: '75001' },
  AT: { postal: 'PLZ', re: /^\d{4}$/, ex: '1010' },
  CH: { postal: 'PLZ', re: /^\d{4}$/, ex: '8001' },
  NL: { postal: 'Postcode', re: /^\d{4}\s?[A-Za-z]{2}$/, ex: '1012 AB' },
  PT: { postal: 'Código postal', re: /^\d{4}-\d{3}$/, ex: '1100-148' },
  AU: { region: 'State', regions: ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'], postal: 'Postcode', re: /^\d{4}$/, ex: '2000' },
  JP: { region: 'Prefecture', postal: 'Postal code', re: /^\d{3}-?\d{4}$/, ex: '100-0001' },
};
const DEMO_ADDR = {
  US: [['925 Sterling Blvd', 'Seattle', 'WA', '98101'], ['221 Silverline Ave', 'Austin', 'TX', '78701'], ['48 Argent Way', 'Brooklyn', 'NY', '11201'], ['12 Lustre Lane', 'Denver', 'CO', '80202'], ['77 Mercury Court', 'San Francisco', 'CA', '94103']],
  CA: [['88 Sterling Road', 'Toronto', 'ON', 'M5V 2T6'], ['410 Argent Street', 'Vancouver', 'BC', 'V6B 1A1']],
  GB: [['14 Silver Street', 'London', '', 'EC1A 1BB'], ['3 Hallmark Row', 'Sheffield', '', 'S1 2HE']],
  DE: [['Silberstraße 9', 'Berlin', '', '10115'], ['Argentweg 25', 'München', '', '80331']],
  FR: [['12 Rue de l’Argent', 'Paris', '', '75001']],
  AT: [['Silbergasse 4', 'Wien', '', '1010']],
  CH: [['Silberweg 7', 'Zürich', '', '8001']],
  NL: [['Zilverstraat 18', 'Amsterdam', '', '1012 AB']],
  PT: [['Rua da Prata 120', 'Lisboa', '', '1100-148']],
  AU: [['9 Sterling Parade', 'Sydney', 'NSW', '2000']],
  JP: [['1-2-5 Ginza', 'Chuo-ku, Tokyo', 'Tokyo', '104-0061']],
};
const EMAIL_FIX = { 'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'outlok.com': 'outlook.com', 'icloud.co': 'icloud.com' };

const data = ss.get('data', { email: '', phone: '', news: true, country: 'US', first: '', last: '', address: '', apt: '', city: '', region: '', postal: '', ship: 'standard', wrap: false, giftMsg: '', hidePrices: false, pay: 'card', billingSame: true, bAddress: '', bCity: '', bPostal: '', usePoints: true, createAcct: false });
// Signed-in members get their details and default address filled in.
(function prefill() {
  const u = account.user; if (!u) return;
  const a = u.addresses.find((x) => x.default) || u.addresses[0];
  if (!data.email) Object.assign(data, { email: u.email, first: u.first, last: u.last, phone: data.phone || u.phone || '' });
  if (a && !data.address) Object.assign(data, { first: a.first, last: a.last, address: a.address, apt: a.apt || '', city: a.city, region: a.region || '', postal: a.postal, country: a.country, phone: a.phone || data.phone });
})();
const card = { number: '', name: '', exp: '', cvc: '' };
let step = ss.get('step', 1), maxStep = ss.get('max', 1);
const save = () => { ss.set('data', data); ss.set('step', step); ss.set('max', maxStep); };

const root = $('#co-root');

/* ------------------------------------------------------------------ */
/* Markup                                                              */
/* ------------------------------------------------------------------ */
const field = (id, label, { type = 'text', value = '', ac = '', req = true, extra = '', inputmode = '', max = '' } = {}) =>
  `<div class="field" data-field="${id}"><input id="${id}" name="${id}" type="${type}" placeholder=" " value="${esc(value)}" ${ac ? `autocomplete="${ac}"` : ''} ${req ? 'required' : ''} ${inputmode ? `inputmode="${inputmode}"` : ''} ${max ? `maxlength="${max}"` : ''} ${extra}><label for="${id}">${label}</label><span class="err" role="alert"></span></div>`;

function regionField() {
  const c = COUNTRIES[data.country];
  if (!c.region) return '';
  if (c.regions) return `<div class="field" data-field="region"><select id="region" autocomplete="address-level1" required><option value="">Select…</option>${c.regions.map((r) => `<option ${r === data.region ? 'selected' : ''}>${r}</option>`).join('')}</select><label for="region">${c.region}</label><span class="err" role="alert"></span></div>`;
  return field('region', c.region, { value: data.region, ac: 'address-level1', req: !c.optional });
}
function addressRow() {
  const c = COUNTRIES[data.country];
  return `<div class="${c.region ? 'row-3' : 'row-2'}" id="addr-row">${field('city', 'City', { value: data.city, ac: 'address-level2' })}${regionField()}${field('postal', c.postal, { value: data.postal, ac: 'postal-code' })}</div>`;
}

function init() {
  root.innerHTML = `<div class="co">
    <section class="co-main" aria-label="Checkout">
      <div class="reserve"><svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#333" stroke-width="3"/><circle id="reserve-arc" cx="18" cy="18" r="15" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="94.25" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg><span>High demand — your pieces are reserved for <strong id="reserve-t">10:00</strong></span></div>
      <ol class="steps" id="steps">${['Information', 'Shipping', 'Payment', 'Review'].map((s, i) => `<li data-go="${i + 1}"><span class="dot">${i + 1}</span><span class="lbl">${s}</span>${i < 3 ? '<span class="bar"></span>' : ''}</li>`).join('')}</ol>

      <form class="co-panel" data-step="1" novalidate>
        <div class="grid" style="gap:12px"><span class="eyebrow" style="text-align:center">Express checkout</span>
          <div class="express-co"><button type="button" class="x1" data-express="wallet">Express Pay</button><button type="button" class="x2" data-express="wallet">Silver Pay</button><button type="button" class="x3" data-express="pay4">Pay in 4</button></div></div>
        ${!account.user && googleEnabled() ? '<div class="sso co-sso hide" data-sso><div class="g-btn" id="co-g-btn"></div><small class="muted">Sign in with Google to fill in your details and use your $12.50 welcome credit</small></div>' : ''}
        <div class="or">or continue below</div>
        <div class="flex between center wrap-f gap-8"><h3>Contact</h3><span class="muted" style="font-size:13px" id="acct-note">${acctNote()}</span></div>
        ${savedAddrs()}
        ${field('email', 'Email address', { type: 'email', value: data.email, ac: 'email', inputmode: 'email' })}
        <label class="check"><input type="checkbox" id="news" ${data.news ? 'checked' : ''}><span class="box">${checkSvg}</span><span>Email me early access to drops &amp; private sales <span class="muted">(members get 15% off)</span></span></label>
        <h3>Shipping address</h3>
        <div class="field" data-field="country"><select id="country" autocomplete="country">${Object.entries(TAX).map(([k, v]) => `<option value="${k}" ${k === data.country ? 'selected' : ''}>${v.name}</option>`).join('')}</select><label for="country">Country / region</label></div>
        <div class="row-2">${field('first', 'First name', { value: data.first, ac: 'given-name' })}${field('last', 'Last name', { value: data.last, ac: 'family-name' })}</div>
        <div style="position:relative">${field('address', 'Address', { value: data.address, ac: 'off' })}<div class="suggest" id="suggest" role="listbox"></div></div>
        ${field('apt', 'Apartment, suite, etc. (optional)', { value: data.apt, ac: 'address-line2', req: false })}
        ${addressRow()}
        ${field('phone', 'Phone (optional — for delivery updates)', { type: 'tel', value: data.phone, ac: 'tel', req: false, inputmode: 'tel' })}
        ${account.user ? '' : `<div class="join-box ${data.createAcct ? 'is-on' : ''}" id="join-box">
          <label class="check"><input type="checkbox" id="createAcct" ${data.createAcct ? 'checked' : ''}><span class="box">${checkSvg}</span><span><b>Save my details &amp; take $12.50 off now</b><small>Join the Silver Club: ${WELCOME_POINTS} welcome points applied to this order, plus 5% back on it.</small></span></label>
          <div class="join-pw">${field('acct-pass', 'Create a password (8+ characters)', { type: 'password', ac: 'new-password', req: false })}</div></div>`}
        <div class="co-nav"><a class="back" href="index.html">${ICONS.arrow} Return to shop</a><button class="btn btn-ink btn-lg" type="submit">Continue to shipping</button></div>
      </form>

      <form class="co-panel" data-step="2" novalidate>
        <div class="review-box" id="ship-recap"></div>
        <h3>Shipping method</h3>
        <div class="radio-cards" id="methods"></div>
        <div class="order-bump" id="bump"></div>
        <h3>Gift options</h3>
        <div class="gift-box">
          <div class="flex center gap-12"><div style="flex:1"><b style="font-size:14px">Signature gift wrap</b><div class="muted" style="font-size:12.5px">Black lacquer box, silver ribbon, wax seal · +$6</div></div><span class="toggle"><input type="checkbox" id="wrap" ${data.wrap ? 'checked' : ''} aria-label="Add gift wrap"><i></i></span></div>
          <div class="field"><textarea id="giftMsg" placeholder=" " maxlength="200">${esc(data.giftMsg)}</textarea><label for="giftMsg">Gift message (free) · <span id="gm-left">${200 - data.giftMsg.length}</span> characters left</label></div>
          <label class="check"><input type="checkbox" id="hidePrices" ${data.hidePrices ? 'checked' : ''}><span class="box">${checkSvg}</span>Hide prices on the packing slip</label>
        </div>
        <div class="co-nav"><button type="button" class="back" data-go="1">${ICONS.arrow} Back to information</button><button class="btn btn-ink btn-lg" type="submit">Continue to payment</button></div>
      </form>

      <form class="co-panel" data-step="3" novalidate>
        <div class="flex between center"><h3>Payment</h3><span class="muted" style="font-size:12px;display:flex;gap:6px;align-items:center">${ICONS.lock.replace('<svg', '<svg width="14" height="14"')} All transactions are encrypted</span></div>
        <div class="hint hide" id="pay-error" style="background:#fdecea;color:var(--alert)"></div>
        <div class="pay-tabs" role="tablist">
          <button type="button" data-pay="card">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 9.5h19M6 15h4"/></svg>'}Card</button>
          <button type="button" data-pay="pay4">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 3"/></svg>'}Pay in 4</button>
          <button type="button" data-pay="wallet">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3"/><rect x="3" y="7.5" width="18" height="12" rx="2"/><circle cx="16.5" cy="13.5" r="1.3"/></svg>'}Wallet</button>
          <button type="button" data-pay="bank">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>'}Bank</button>
        </div>
        <div class="pay-pane" data-pane="card">
          <div class="paycard-wrap"><div class="paycard" id="paycard">
            <div class="face front"><span class="logo-sm">Silver</span><span class="brand" id="pc-brand"></span><div class="chip"></div><div class="num" id="pc-num">•••• •••• •••• ••••</div><div class="meta"><div><small>Card holder</small><span class="nm" id="pc-name">YOUR NAME</span></div><div><small>Expires</small><span id="pc-exp">MM/YY</span></div></div></div>
            <div class="face back"><div class="stripe"></div><div class="sig"><span id="pc-cvc">•••</span></div><p>This card is a demo preview. Silver Shop never stores full card numbers. Payments are encrypted end to end.</p></div>
          </div></div>
          ${field('cc-number', 'Card number', { ac: 'cc-number', inputmode: 'numeric', max: 23 })}
          ${field('cc-name', 'Name on card', { ac: 'cc-name' })}
          <div class="row-2">${field('cc-exp', 'Expiry (MM / YY)', { ac: 'cc-exp', inputmode: 'numeric', max: 7 })}${field('cc-cvc', 'Security code', { ac: 'cc-csc', inputmode: 'numeric', max: 4 })}</div>
          <div class="hint">Demo — use <code data-fill="4242424242424242">4242 4242 4242 4242</code> (success) or <code data-fill="4000000000000002">4000 0000 0000 0002</code> (decline), any future date &amp; CVC.</div>
        </div>
        <div class="pay-pane" data-pane="pay4"><div class="cbox" id="pay4-plan" style="padding:20px"></div></div>
        <div class="pay-pane" data-pane="wallet"><div class="cbox" style="padding:24px;text-align:center;gap:12px"><b>Pay with your digital wallet</b><p class="muted" style="margin:0;font-size:14px">You’ll confirm with your fingerprint or face on the next step. (Demo: approved automatically.)</p></div></div>
        <div class="pay-pane" data-pane="bank"><div class="cbox" style="padding:24px;gap:10px"><b>Instant bank transfer</b><p class="muted" style="margin:0;font-size:14px">After you place your order we’ll show the bank details and a unique reference. Your pieces are reserved for 48 hours and ship as soon as the transfer arrives.</p></div></div>
        <h3>Billing address</h3>
        <label class="check"><input type="checkbox" id="billingSame" ${data.billingSame ? 'checked' : ''}><span class="box">${checkSvg}</span>Same as shipping address</label>
        <div class="grid ${data.billingSame ? 'hide' : ''}" style="gap:12px" id="billing">${field('bAddress', 'Billing address', { value: data.bAddress, ac: 'billing address-line1' })}<div class="row-2">${field('bCity', 'City', { value: data.bCity, ac: 'billing address-level2' })}${field('bPostal', 'Postal code', { value: data.bPostal, ac: 'billing postal-code' })}</div></div>
        <div class="co-nav"><button type="button" class="back" data-go="2">${ICONS.arrow} Back to shipping</button><button class="btn btn-ink btn-lg" type="submit">Review order</button></div>
      </form>

      <form class="co-panel" data-step="4" novalidate>
        <h2>Review &amp; place order</h2>
        <div class="review-box" id="final-recap"></div>
        <label class="check" data-field="terms"><input type="checkbox" id="terms"><span class="box">${checkSvg}</span><span>I agree to the <a href="#" onclick="return false" style="text-decoration:underline">Terms</a> and <a href="#" onclick="return false" style="text-decoration:underline">Privacy Policy</a>, and understand this is a demo store — no payment will be taken.</span></label>
        <span class="err" id="terms-err" style="display:none;color:var(--alert);font-size:12px;margin-top:-12px">Please accept the terms to continue.</span>
        <button class="btn btn-ink btn-lg btn-block" type="submit" id="place">${ICONS.lock} Place order · <span id="place-total"></span></button>
        <div class="trust-row"><div>${ICONS.lock}256-bit SSL encryption</div><div>${ICONS.return}Free 60-day returns</div><div>${ICONS.shield}Lifetime warranty</div></div>
        <div class="co-nav"><button type="button" class="back" data-go="3">${ICONS.arrow} Back to payment</button></div>
      </form>
    </section>

    <aside class="co-side" id="co-side" aria-label="Order summary">
      <button class="sum-toggle" id="sum-toggle" type="button"><span class="flex center gap-8">${ICONS.bag.replace('<svg', '<svg width="20" height="20"')} <span id="sum-toggle-l">Show order summary</span></span><b id="sum-toggle-t"></b></button>
      <div class="co-side-inner" id="summary"></div>
    </aside>
  </div>`;

  bind();
  if (!account.user) mountGoogleButton($('#co-g-btn'), (r) => {
    if (!r.ok) { toast({ html: r.msg, dark: true }); return; }
    const u = account.user;
    Object.assign(data, { email: u.email, first: u.first, last: u.last, usePoints: true }); save();
    session.set('g-welcome', r.created);
    location.reload();
  });
  const gw = session.get('g-welcome', null);
  if (gw !== null && account.user) { toast({ icon: ICONS.gift, html: gw ? `<strong>Welcome, ${esc(account.user.first)}!</strong> $12.50 in points is ready to use.` : '<strong>Signed in with Google.</strong> Your points are ready.', dark: true }); session.set('g-welcome', null); }
  goTo(step, false);
  reserveTimer();
}

/* ------------------------------------------------------------------ */
/* Summary sidebar                                                     */
/* ------------------------------------------------------------------ */
let shownTotal = 0;
function totals() {
  const pts = account.user && data.usePoints ? account.user.points : 0;
  return cart.totals({ shipping: step >= 2 ? data.ship : null, country: data.country, giftWrap: data.wrap, points: pts });
}
function acctNote() {
  const u = account.user;
  return u ? `Signed in as <b style="color:var(--ink)">${esc(u.first)}</b> · <button type="button" class="link-btn" data-co-logout>Not you?</button>`
    : 'Have an account? <a href="account.html#signin" data-co-login style="text-decoration:underline;color:var(--ink);font-weight:600">Sign in</a>';
}
function savedAddrs() {
  const u = account.user; if (!u || u.addresses.length < 2) return '';
  return `<div class="saved-addrs" role="radiogroup" aria-label="Saved addresses">${u.addresses.map((a, i) => `<button type="button" class="chip ${a.address === data.address ? 'is-active' : ''}" data-use-addr="${i}">${ICONS.pin.replace('<svg', '<svg width="14" height="14"')} ${esc(a.address)}, ${esc(a.city)}</button>`).join('')}</div>`;
}
const optLine = optsText;

function renderSummary() {
  const t = totals();
  const tax = TAX[data.country];
  $('#summary').innerHTML = `
    <div class="sum-items">${t.lines.map((l) => `<div class="sum-item"><div class="thumb"><img src="${img(l.id)}" alt=""><span class="q">${l.qty}</span></div><div><b>${esc(l.p.name)}</b>${l.addon ? ' <span class="tag tag-silver" style="height:18px;font-size:8px">Deal</span>' : ''}<small>${esc(optLine(l))}${l.engraving ? `<br>Engraved: “${esc(l.engraving)}”` : ''}</small></div><div style="text-align:right;font-weight:600;font-variant-numeric:tabular-nums">${money2(l.total)}${l.compare ? `<small><s>${money2(l.compare * l.qty)}</s></small>` : ''}</div></div>`).join('')}
      ${t.freeGift ? `<div class="sum-item"><div class="thumb"><img src="${img('care-kit')}" alt=""><span class="q">1</span></div><div><b>Silver Care Kit</b> <span class="tag tag-ink tag-xs">Free gift</span><small>Unlocked at ${money2(FREE_GIFT)}</small></div><div style="text-align:right;font-weight:600;color:var(--ok)">FREE</div></div>` : ''}</div>
    ${t.toGift > 0 ? `<div class="co-reward">${rewardMeter(t)}${gapFillHtml(t)}</div>` : ''}
    ${account.user && account.user.points ? `<label class="points-toggle"><span>${ICONS.sparkle}<span><b>Use ${Math.min(account.user.points, Math.ceil(t.afterDiscount / POINT_VALUE)).toLocaleString()} Silver Points</b><small>${account.user.points.toLocaleString()} available · worth ${money2(account.user.points * POINT_VALUE)}</small></span></span><span class="toggle"><input type="checkbox" id="usePoints" ${data.usePoints ? 'checked' : ''} aria-label="Use Silver Points"><i></i></span></label>` : ''}
    ${!account.user && data.createAcct ? `<div class="points-line">${ICONS.gift}<span><b>$12.50 Silver Club credit</b> applies when you continue</span></div>` : ''}
    ${t.promo ? `<div class="flex between center"><span class="applied">${ICONS.sparkle.replace('<svg', '<svg width="12" height="12"')} ${t.promo} <button type="button" data-rm-promo aria-label="Remove code">✕</button></span><span class="muted" style="font-size:12px">${esc(PROMO_LABEL(t.promo))}</span></div>` : `<form class="promo-form" id="promo-form"><div class="field"><input id="promo" placeholder=" " autocomplete="off" style="text-transform:uppercase"><label for="promo">Gift card or discount code</label></div><button class="btn btn-silver" type="submit">Apply</button></form>`}
    <div class="promo-msg" id="promo-msg"></div>
    <div class="totals">
      <div class="sum-row"><span>Subtotal · ${cart.count()} item${cart.count() > 1 ? 's' : ''}</span><span>${money2(t.merch)}</span></div>
      ${t.stack ? `<div class="sum-row discount"><span>Stack &amp; Save (${t.stackPct}%)</span><span>−${money2(t.stack)}</span></div>` : ''}
      ${t.promoAmt ? `<div class="sum-row discount"><span>Discount · ${t.promo}</span><span>−${money2(t.promoAmt)}</span></div>` : ''}
      ${t.pointsAmt ? `<div class="sum-row discount"><span>Silver Points (${t.pointsUsed.toLocaleString()})</span><span>−${money2(t.pointsAmt)}</span></div>` : ''}
      <div class="sum-row"><span>Shipping${t.ship ? ` · ${t.ship.name}` : ''}</span><span>${t.ship ? (t.shipCost ? money2(t.shipCost) : '<b style="color:var(--ok)">FREE</b>') : '<span class="muted">Calculated next</span>'}</span></div>
      ${t.wrap ? `<div class="sum-row"><span>Gift wrap</span><span>${money2(t.wrap)}</span></div>` : ''}
      <div class="sum-row"><span>${tax.label} (${(t.rate * 100).toFixed(t.rate * 100 % 1 ? 2 : 0)}%)${step < 2 ? ' · est.' : ''}</span><span>${step >= 2 ? money2(t.tax) : '<span class="muted">Calculated next</span>'}</span></div>
      <div class="grand"><span style="font-weight:600">Total</span><span><small>USD</small><b id="grand">${money2(shownTotal)}</b></span></div>
    </div>
    ${savings(t) > 0 ? `<div class="savings-pill"><span>${ICONS.sparkle.replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px"')} Total savings today</span><span>${money2(savings(t))}</span></div>` : ''}
    ${t.earn ? `<div class="earn-note">${account.user ? `You’ll earn <b>${t.earn} Silver Points</b> on this order` : `Members earn <b>${t.earn} points</b> on this order`}</div>` : ''}
    <div class="trust-row"><div>${ICONS.lock}Secure SSL</div><div>${ICONS.return}60-day returns</div><div>${ICONS.shield}Lifetime warranty</div></div>
    <figure style="margin:0;padding:16px;border-radius:14px;background:#fff;border:1px solid var(--line);font-size:13px"><span class="stars" style="--pct:100%"></span><blockquote style="margin:8px 0;color:var(--muted)">“Arrived in two days in the most beautiful box. Even better than the photos.”</blockquote><figcaption style="font-weight:600">— Priya S., verified buyer</figcaption></figure>`;
  const target = step >= 2 ? t.total : t.afterDiscount;
  animateTotal(target);
  $('#sum-toggle-t').textContent = money2(target);
  const pt = $('#place-total'); if (pt) pt.textContent = money2(target);
  const pf = $('#promo-form');
  if (pf) pf.onsubmit = (e) => {
    e.preventDefault();
    const r = cart.applyPromo($('#promo').value);
    if (r.ok) { renderAll(); setMsg(r.msg, true); confetti({ count: 60, x: 0.82, y: 0.4 }); } else { setMsg(r.msg, false); $('#promo').closest('.field').classList.add('is-invalid'); }
  };
}
const savings = (t) => t.compareSavings + t.discount + t.pointsAmt + (t.freeGift ? byId['care-kit'].price : 0) + (t.ship && t.ship.price === 0 && t.ship.id === 'standard' ? 8 : 0);
const PROMO_LABEL = (c) => ({ SILVER10: '10% off', WELCOME15: '15% off', FREESHIP: 'Free express', VIP20: '20% off' }[c] || '');
function setMsg(m, ok) { const el = $('#promo-msg'); el.textContent = m; el.className = 'promo-msg ' + (ok ? 'ok' : 'bad'); }
function animateTotal(to) {
  const el = $('#grand'); const from = shownTotal; shownTotal = to;
  if (Math.abs(from - to) < 0.005) { el.textContent = money2(to); return; }
  const t0 = performance.now();
  const step2 = (t) => { const k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3); el.textContent = money2(from + (to - from) * e); if (k < 1) requestAnimationFrame(step2); };
  requestAnimationFrame(step2);
}

/* ------------------------------------------------------------------ */
/* Step 2 pieces                                                        */
/* ------------------------------------------------------------------ */
const range = (a, b) => (+a === +b ? fmtDate(a) : `${fmtDate(a)} – ${fmtDate(b)}`);
function renderShipping() {
  const t = totals();
  $('#methods').innerHTML = t.methods.map((m) => `<label class="rc"><input type="radio" name="ship" value="${m.id}" ${m.id === data.ship ? 'checked' : ''}><span class="o"></span><span><strong>${m.name}${m.id === 'express' ? '<span class="pill">Most popular</span>' : ''}</strong><small>Arrives ${range(...m.eta)} · ${m.desc}</small></span><span class="p ${m.price ? '' : 'free'}">${m.price ? money2(m.price) : 'FREE'}</span></label>`).join('');
  const k = bumpProduct();
  const bumpIdx = cart.items.findIndex((i) => i.id === k.id && i.addon);
  $('#bump').innerHTML = `<span class="ribbon">Checkout only</span><label class="check" style="align-self:center"><input type="checkbox" id="bump-cb" ${bumpIdx > -1 ? 'checked' : ''}><span class="box">${checkSvg}</span></label><img src="${img(k.id)}" alt=""><div><strong>Add ${esc(k.name)} for ${money2(k.addon)}</strong> <span class="muted" style="text-decoration:line-through;font-size:13px">${money2(k.price)}</span><p>${k.id === 'care-kit' ? 'Keeps your new pieces mirror-bright for years.' : 'Everyday sparkle, packed in the same box.'} ${Math.round((1 - k.addon / k.price) * 100)}% off, only here.</p></div>`;
  $('#ship-recap').innerHTML = recapRows(['contact', 'ship']);
}
function bumpProduct() {
  const giftOn = cart.totals().freeGift;
  const has = (id) => cart.items.some((i) => i.id === id && !i.addon);
  return byId[!giftOn && !has('care-kit') ? 'care-kit' : has('starlight-studs') ? 'care-kit' : 'starlight-studs'];
}
function recapRows(which) {
  const c = TAX[data.country].name;
  const t = totals();
  const rows = {
    contact: ['Contact', esc(data.email), 1],
    ship: ['Ship to', `${esc(data.first)} ${esc(data.last)}<br>${esc(data.address)}${data.apt ? ', ' + esc(data.apt) : ''}, ${esc(data.city)}${data.region ? ', ' + esc(data.region) : ''} ${esc(data.postal)}, ${c}`, 1],
    method: ['Method', t.ship ? `${t.ship.name} · ${t.ship.price ? money2(t.ship.price) : 'Free'}<br><span class="muted">Arrives ${range(...t.ship.eta)}</span>` : '', 2],
    gift: ['Gift', [data.wrap ? 'Signature gift wrap' : '', data.giftMsg ? `“${esc(data.giftMsg)}”` : '', data.hidePrices ? 'Prices hidden' : ''].filter(Boolean).join('<br>') || '<span class="muted">None</span>', 2],
    pay: ['Payment', payLabel(), 3],
  };
  return which.map((k) => `<div><span>${rows[k][0]}</span><span>${rows[k][1]}</span><button type="button" data-go="${rows[k][2]}">Change</button></div>`).join('');
}
function payLabel() {
  if (data.pay === 'card') { const d = card.number.replace(/\D/g, ''); return `${brand(d).label || 'Card'} ending •••• ${d.slice(-4) || '----'}<br><span class="muted">Expires ${esc(card.exp)}</span>`; }
  return { pay4: 'Pay in 4 · interest-free', wallet: 'Digital wallet', bank: 'Instant bank transfer' }[data.pay];
}

/* ------------------------------------------------------------------ */
/* Payment helpers                                                     */
/* ------------------------------------------------------------------ */
function brand(d) {
  if (/^3[47]/.test(d)) return { id: 'amex', label: 'AMEX', len: 15, cvc: 4, groups: [4, 6, 5] };
  if (/^4/.test(d)) return { id: 'visa', label: 'VISA', len: 16, cvc: 3, groups: [4, 4, 4, 4] };
  if (/^(5[1-5]|2[2-7])/.test(d)) return { id: 'mc', label: 'MASTERCARD', len: 16, cvc: 3, groups: [4, 4, 4, 4] };
  if (/^6(011|5)/.test(d)) return { id: 'disc', label: 'DISCOVER', len: 16, cvc: 3, groups: [4, 4, 4, 4] };
  return { id: '', label: '', len: 16, cvc: 3, groups: [4, 4, 4, 4] };
}
function luhn(d) { let s = 0; for (let i = 0; i < d.length; i++) { let n = +d[d.length - 1 - i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } s += n; } return s % 10 === 0; }
function fmtCard(d) { const b = brand(d); let out = [], i = 0; for (const g of b.groups) { if (i >= d.length) break; out.push(d.slice(i, i + g)); i += g; } return out.join(' '); }
function renderPay4() {
  const t = totals(); const part = Math.round((t.total / 4) * 100) / 100;
  $('#pay4-plan').innerHTML = `<b>4 interest-free payments of ${money2(part)}</b><p class="muted" style="margin:0;font-size:13px">No fees when you pay on time. Soft credit check only.</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:6px">${[0, 14, 28, 42].map((d, i) => { const dt = new Date(Date.now() + d * 864e5); return `<div style="text-align:center;padding:12px 4px;border-radius:12px;background:${i ? 'var(--mist)' : 'var(--ink)'};color:${i ? 'inherit' : '#fff'}"><div style="width:26px;height:26px;margin:0 auto 8px;border-radius:50%;background:conic-gradient(${i ? '#0a0a0b' : '#fff'} ${(i + 1) * 25}%, ${i ? '#d4d4d8' : '#444'} 0)"></div><b style="font-size:13px">${money2(part)}</b><div style="font-size:11px;opacity:.7">${i ? fmtDate(dt, { month: 'short', day: 'numeric' }) : 'Today'}</div></div>`; }).join('')}</div>`;
}
function syncCardPreview() {
  const d = card.number.replace(/\D/g, ''); const b = brand(d);
  const shown = (d + '•'.repeat(Math.max(0, b.len - d.length))).slice(0, b.len);
  const groups = []; let i = 0; for (const g of b.groups) { groups.push(shown.slice(i, i + g)); i += g; }
  $('#pc-num').textContent = groups.join(' ');
  $('#pc-name').textContent = card.name.toUpperCase() || 'YOUR NAME';
  $('#pc-exp').textContent = card.exp || 'MM/YY';
  $('#pc-cvc').textContent = card.cvc ? card.cvc.replace(/./g, '•') : '•'.repeat(b.cvc);
  const br = $('#pc-brand'); if (br.textContent !== b.label) { br.style.opacity = 0; setTimeout(() => { br.textContent = b.label; br.style.opacity = 1; }, 150); }
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */
function rule(id) {
  const v = ($('#' + id)?.value || '').trim();
  const c = COUNTRIES[data.country];
  switch (id) {
    case 'email': return !v ? 'Enter your email so we can send your receipt' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email, like name@example.com';
    case 'first': return v ? '' : 'Enter a first name';
    case 'last': return v ? '' : 'Enter a last name';
    case 'address': return v.length >= 4 ? '' : 'Enter a street address';
    case 'city': return v ? '' : 'Enter a city';
    case 'region': return c.optional || v ? '' : `Select a ${c.region.toLowerCase()}`;
    case 'postal': return !v ? `Enter a ${c.postal}` : c.re.test(v) ? '' : `Enter a valid ${c.postal} (e.g. ${c.ex})`;
    case 'phone': return !v || v.replace(/\D/g, '').length >= 7 ? '' : 'Enter a valid phone number';
    case 'cc-number': { const d = v.replace(/\D/g, ''); const b = brand(d); return !d ? 'Enter your card number' : d.length !== b.len ? 'Card number is incomplete' : !luhn(d) ? 'That card number isn’t valid' : ''; }
    case 'cc-name': return v.length >= 2 ? '' : 'Enter the name on the card';
    case 'cc-exp': { const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/); if (!m) return 'Enter the expiry as MM / YY'; const mm = +m[1], yy = 2000 + +m[2]; if (mm < 1 || mm > 12) return 'Invalid month'; const end = new Date(yy, mm, 1); return end > new Date() ? '' : 'This card has expired'; }
    case 'cc-cvc': { const b = brand(card.number.replace(/\D/g, '')); return new RegExp(`^\\d{${b.cvc}}$`).test(v) ? '' : `Enter the ${b.cvc}-digit security code`; }
    case 'bAddress': case 'bCity': return v ? '' : 'Required';
    case 'bPostal': return v.length >= 3 ? '' : 'Required';
    case 'acct-pass': return !data.createAcct || $('#acct-pass').value.length >= 8 ? '' : 'Choose a password with at least 8 characters';
    default: return '';
  }
}
function check(id, show = true) {
  const f = $(`[data-field="${id}"]`); if (!f || !$('.err', f) || !$('#' + id)) return true;
  const msg = rule(id);
  if (show) {
    f.classList.toggle('is-invalid', !!msg);
    f.classList.toggle('is-valid', !msg && !!$('#' + id).value.trim() && !['phone', 'apt'].includes(id));
    $('.err', f).textContent = msg;
  }
  return !msg;
}
function validateStep(n) {
  let ids = [];
  if (n === 1) ids = ['email', 'first', 'last', 'address', 'city', 'region', 'postal', 'phone', 'acct-pass'];
  if (n === 3 && data.pay === 'card') ids = ['cc-number', 'cc-name', 'cc-exp', 'cc-cvc'];
  if (n === 3 && !data.billingSame) ids.push('bAddress', 'bCity', 'bPostal');
  const bad = ids.filter((id) => $('#' + id) && !check(id));
  if (bad.length) {
    const el = $('#' + bad[0]); el.focus({ preventScroll: true });
    el.closest('.field').scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.closest('.field').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
function goTo(n, scroll = true) {
  n = Math.min(n, maxStep);
  step = n; save();
  $$('.co-panel').forEach((p) => p.classList.toggle('is-active', +p.dataset.step === n));
  $$('#steps li').forEach((li) => { const i = +li.dataset.go; li.classList.toggle('is-active', i === n); li.classList.toggle('is-done', i < n || (i <= maxStep && i !== n && i < maxStep)); });
  if (n === 2) renderShipping();
  if (n === 3) { selectPay(data.pay); renderPay4(); }
  if (n === 4) $('#final-recap').innerHTML = recapRows(['contact', 'ship', 'method', 'gift', 'pay']);
  renderSummary();
  if (scroll) scrollTo({ top: 0, behavior: 'smooth' });
}
function renderAll() { renderSummary(); if (step === 2) renderShipping(); if (step === 3) renderPay4(); if (step === 4) $('#final-recap').innerHTML = recapRows(['contact', 'ship', 'method', 'gift', 'pay']); }
function selectPay(m) {
  data.pay = m; save();
  $$('[data-pay]').forEach((b) => b.classList.toggle('is-active', b.dataset.pay === m));
  $$('[data-pane]').forEach((p) => p.classList.toggle('is-active', p.dataset.pane === m));
}

/* ------------------------------------------------------------------ */
/* Address autocomplete                                                */
/* ------------------------------------------------------------------ */
let hl = -1;
function suggest() {
  const v = $('#address').value.trim().toLowerCase(), box = $('#suggest');
  if (v.length < 2) { box.classList.remove('is-on'); return; }
  const list = DEMO_ADDR[data.country] || [];
  let hits = list.filter((a) => a.join(' ').toLowerCase().includes(v));
  if (!hits.length) hits = list.slice(0, 3);
  hl = -1;
  box.innerHTML = hits.map((a, i) => `<button type="button" role="option" data-sug="${i}" data-a='${esc(JSON.stringify(a))}'>${ICONS.search.replace('<svg', '<svg width="16" height="16" style="flex:none;margin-top:2px"')}<span><b>${esc(a[0])}</b><br><small>${esc(a[1])}${a[2] ? ', ' + esc(a[2]) : ''} ${esc(a[3])}</small></span></button>`).join('') + '<div class="powered">Suggested addresses · demo data</div>';
  box.classList.add('is-on');
}
function pickSuggestion(btn) {
  const [a, c, r, p] = JSON.parse(btn.dataset.a);
  Object.assign(data, { address: a, city: c, region: r, postal: p });
  $('#address').value = a; $('#city').value = c; $('#postal').value = p;
  if ($('#region')) $('#region').value = r;
  $('#suggest').classList.remove('is-on');
  ['address', 'city', 'region', 'postal'].forEach((id) => $('#' + id) && check(id));
  save(); $('#apt').focus();
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */
function bind() {
  root.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = +e.target.dataset.step;
    if (!n) return;
    if (n === 4) return placeOrder();
    if (!validateStep(n)) return;
    if (n === 1 && data.createAcct && !account.user) {
      if (account.exists(data.email)) { const f = $('[data-field="email"]'); f.classList.add('is-invalid'); $('.err', f).innerHTML = 'You already have an account. <a href="account.html#signin" data-co-login style="text-decoration:underline;font-weight:600;color:var(--ink)">Sign in</a> to use your points.'; return; }
      const r = await account.register({ first: data.first, last: data.last, email: data.email, password: $('#acct-pass').value, news: data.news, phone: data.phone });
      if (r.ok) {
        account.user.addresses.push({ country: data.country, first: data.first, last: data.last, address: data.address, apt: data.apt, city: data.city, region: data.region, postal: data.postal, phone: data.phone, default: true });
        account.update({});
        data.createAcct = false; data.usePoints = true; save();
        $('#join-box')?.remove(); $('#acct-note').innerHTML = acctNote();
        toast({ icon: ICONS.gift, html: `<strong>Welcome to the Silver Club, ${esc(data.first)}!</strong> $12.50 is off this order.`, sub: 'Your address is saved for next time', dark: true });
      }
    }
    maxStep = Math.max(maxStep, n + 1);
    goTo(n + 1);
  });
  root.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go && (+go.dataset.go <= maxStep)) { e.preventDefault(); goTo(+go.dataset.go); }
    const pay = e.target.closest('[data-pay]'); if (pay) selectPay(pay.dataset.pay);
    const sug = e.target.closest('[data-sug]'); if (sug) pickSuggestion(sug);
    const fill = e.target.closest('[data-fill]');
    if (fill) {
      card.number = fmtCard(fill.dataset.fill); $('#cc-number').value = card.number;
      if (!$('#cc-name').value) { card.name = `${data.first} ${data.last}`.trim() || 'Alex Morgan'; $('#cc-name').value = card.name; }
      card.exp = '12 / 29'; $('#cc-exp').value = card.exp; card.cvc = '123'; $('#cc-cvc').value = '123';
      ['cc-number', 'cc-name', 'cc-exp', 'cc-cvc'].forEach((id) => check(id)); syncCardPreview();
    }
    const ex = e.target.closest('[data-express]');
    if (ex) expressCheckout(ex.dataset.express);
    if (e.target.closest('[data-rm-promo]')) { cart.removePromo(); renderAll(); }
    if (e.target.closest('[data-co-login]')) session.set('next', 'checkout.html');
    if (e.target.closest('[data-co-logout]')) { account.logout(); ['email', 'first', 'last', 'address', 'apt', 'city', 'region', 'postal', 'phone'].forEach((k) => (data[k] = '')); save(); location.reload(); }
    const ua = e.target.closest('[data-use-addr]');
    if (ua) {
      const a = account.user.addresses[+ua.dataset.useAddr];
      Object.assign(data, { first: a.first, last: a.last, address: a.address, apt: a.apt || '', city: a.city, region: a.region || '', postal: a.postal, country: a.country, phone: a.phone || data.phone }); save();
      ['first', 'last', 'address', 'apt', 'phone'].forEach((id) => { $('#' + id).value = data[id]; });
      $('#country').value = data.country; $('#addr-row').outerHTML = addressRow();
      $$('[data-use-addr]').forEach((b) => b.classList.toggle('is-active', b === ua));
      renderSummary();
    }
    if (e.target.closest('#sum-toggle')) { const s = $('#co-side'); s.classList.toggle('is-open'); $('#sum-toggle-l').textContent = s.classList.contains('is-open') ? 'Hide order summary' : 'Show order summary'; }
    if (!e.target.closest('#suggest, #address')) $('#suggest')?.classList.remove('is-on');
  });
  root.addEventListener('input', (e) => {
    const t = e.target, id = t.id;
    if (['email', 'phone', 'first', 'last', 'address', 'apt', 'city', 'region', 'postal', 'giftMsg', 'bAddress', 'bCity', 'bPostal'].includes(id)) { data[id] = t.value; save(); }
    if (id === 'address') suggest();
    if (id === 'giftMsg') $('#gm-left').textContent = 200 - t.value.length;
    if (id === 'cc-number') {
      const d = t.value.replace(/\D/g, '').slice(0, brand(t.value.replace(/\D/g, '')).len);
      const pos = t.selectionStart, before = t.value.length;
      t.value = fmtCard(d); card.number = t.value;
      if (pos < before) t.setSelectionRange(pos, pos);
      if (d.length === brand(d).len) { check(id); if (luhn(d)) $('#cc-name').focus(); }
    }
    if (id === 'cc-exp') {
      let d = t.value.replace(/\D/g, '').slice(0, 4);
      if (d.length === 1 && +d > 1) d = '0' + d;
      t.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; card.exp = t.value;
      if (d.length === 4) { check(id); $('#cc-cvc').focus(); }
    }
    if (id === 'cc-cvc') { t.value = t.value.replace(/\D/g, ''); card.cvc = t.value; }
    if (id === 'cc-name') card.name = t.value;
    if (id.startsWith('cc-')) syncCardPreview();
    if ($(`[data-field="${id}"]`)?.classList.contains('is-invalid')) check(id);
  });
  root.addEventListener('focusout', (e) => {
    const id = e.target.id;
    if (!id || !$(`[data-field="${id}"]`) || !e.target.value) return;
    check(id);
    if (id === 'email') {
      const dom = e.target.value.split('@')[1]?.toLowerCase();
      const f = $('[data-field="email"]');
      if (EMAIL_FIX[dom]) { $('.err', f).innerHTML = `Did you mean <button type="button" style="text-decoration:underline;font-weight:600;color:var(--ink)" id="email-fix">${esc(e.target.value.split('@')[0])}@${EMAIL_FIX[dom]}</button>?`; f.classList.add('is-invalid'); $('#email-fix').onclick = () => { e.target.value = e.target.value.split('@')[0] + '@' + EMAIL_FIX[dom]; data.email = e.target.value; save(); check('email'); }; }
    }
  });
  root.addEventListener('focusin', (e) => { const pc = $('#paycard'); if (pc) pc.classList.toggle('is-flipped', e.target.id === 'cc-cvc'); });
  root.addEventListener('keydown', (e) => {
    if (e.target.id !== 'address' || !$('#suggest').classList.contains('is-on')) return;
    const opts = $$('#suggest [data-sug]');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; opts.forEach((o, i) => o.classList.toggle('is-hl', i === hl)); }
    if (e.key === 'Enter' && hl > -1) { e.preventDefault(); pickSuggestion(opts[hl]); }
    if (e.key === 'Escape') $('#suggest').classList.remove('is-on');
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'country') {
      data.country = t.value; data.region = ''; data.postal = ''; save();
      $('#addr-row').outerHTML = addressRow();
      $('#city').value = data.city;
      renderSummary();
    }
    if (t.id === 'region') { data.region = t.value; save(); check('region'); }
    if (t.id === 'news') { data.news = t.checked; save(); }
    if (t.name === 'ship') { data.ship = t.value; save(); renderSummary(); }
    if (t.id === 'wrap') { data.wrap = t.checked; save(); renderSummary(); }
    if (t.id === 'hidePrices') { data.hidePrices = t.checked; save(); }
    if (t.id === 'createAcct') { data.createAcct = t.checked; save(); $('#join-box').classList.toggle('is-on', t.checked); if (t.checked) setTimeout(() => $('#acct-pass').focus(), 50); renderSummary(); }
    if (t.id === 'usePoints') { data.usePoints = t.checked; save(); renderAll(); }
    if (t.id === 'billingSame') { data.billingSame = t.checked; save(); $('#billing').classList.toggle('hide', t.checked); }
    if (t.id === 'terms') { $('#terms-err').style.display = t.checked ? 'none' : 'block'; }
    if (t.id === 'bump-cb') {
      const k = bumpProduct();
      const idx = cart.items.findIndex((i) => i.id === k.id && i.addon);
      if (t.checked && idx < 0) { cart.add({ id: k.id, finish: 'polished', opts: {}, addon: true }); toast({ img: img(k.id), html: `<strong>${esc(k.name)}</strong> added for ${money2(k.addon)}`, sub: `Saved ${money2(k.price - k.addon)}`, timeout: 2600 }); }
      if (!t.checked && idx > -1) cart.remove(idx);
      renderSummary(); renderShipping();
    }
  });
  // card tilt & glare
  const pc = $('#paycard');
  pc.parentElement.addEventListener('pointermove', (e) => {
    if (pc.classList.contains('is-flipped')) return;
    const r = pc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    pc.style.setProperty('--cy', x * 16 + 'deg'); pc.style.setProperty('--cx', -y * 12 + 'deg');
    $$('.face', pc).forEach((f) => f.style.setProperty('--glare', x * 80 + '%'));
  });
  pc.parentElement.addEventListener('pointerleave', () => { pc.style.setProperty('--cy', '0deg'); pc.style.setProperty('--cx', '0deg'); });
}

/* ------------------------------------------------------------------ */
/* Express checkout & reserve timer                                    */
/* ------------------------------------------------------------------ */
function expressCheckout(method) {
  Object.assign(data, {
    email: data.email || 'alex.morgan@example.com', first: data.first || 'Alex', last: data.last || 'Morgan',
    address: data.address || '925 Sterling Blvd', city: data.city || 'Seattle', region: data.region || 'WA', postal: data.postal || '98101', country: data.address ? data.country : 'US',
    ship: 'express', pay: method,
  });
  ['email', 'first', 'last', 'address', 'city', 'postal'].forEach((id) => { const el = $('#' + id); if (el) el.value = data[id]; });
  $('#country').value = data.country; $('#addr-row').outerHTML = addressRow();
  maxStep = 4; save();
  toast({ icon: ICONS.check, html: '<strong>Express details loaded</strong>', sub: 'Review and place your order', dark: true, timeout: 3000 });
  goTo(4);
}
function reserveTimer() {
  let end = ss.get('reserve', 0);
  if (!end || end < Date.now()) { end = Date.now() + 10 * 60e3; ss.set('reserve', end); }
  const tick = () => {
    let ms = end - Date.now();
    if (ms <= 0) { end = Date.now() + 5 * 60e3; ss.set('reserve', end); ms = end - Date.now(); toast({ html: 'We’ve extended your reservation by <strong>5 minutes</strong>', dark: true }); }
    const el = $('#reserve-t'); if (!el) return;
    el.textContent = `${Math.floor(ms / 6e4)}:${String(Math.floor((ms % 6e4) / 1e3)).padStart(2, '0')}`;
    $('#reserve-arc').setAttribute('stroke-dashoffset', String(94.25 * (1 - ms / 600e3)));
  };
  tick(); setInterval(tick, 1000);
}

/* ------------------------------------------------------------------ */
/* Place order                                                         */
/* ------------------------------------------------------------------ */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function placeOrder() {
  if (!$('#terms').checked) { $('#terms-err').style.display = 'block'; $('[data-field="terms"]').animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300 }); return; }
  const ov = $('#processing'), li = $$('#proc-steps li');
  li.forEach((l) => (l.className = ''));
  ov.classList.add('is-on');
  const declined = data.pay === 'card' && card.number.replace(/\D/g, '') === '4000000000000002';
  for (let i = 0; i < li.length; i++) {
    li[i].className = 'is-on';
    await wait(750 + Math.random() * 400);
    if (declined && i === 1) {
      ov.classList.remove('is-on');
      maxStep = 4; goTo(3);
      const pe = $('#pay-error'); pe.classList.remove('hide'); pe.innerHTML = `<b>Your card was declined.</b>&nbsp;Please try another card — demo tip: use 4242 4242 4242 4242.`;
      $('[data-field="cc-number"]').classList.add('is-invalid');
      return;
    }
    li[i].className = 'is-done';
  }
  await wait(300);
  const t = totals();
  const order = {
    no: 'SS-' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 90 + 10),
    at: Date.now(), data: { ...data }, pay: data.pay === 'card' ? `${brand(card.number.replace(/\D/g, '')).label || 'Card'} •••• ${card.number.replace(/\D/g, '').slice(-4)}` : payLabel(),
    lines: [...t.lines.map((l) => ({ id: l.id, name: l.p.name, qty: l.qty, total: l.total, opts: optLine(l), engraving: l.engraving })), ...(t.freeGift ? [{ id: 'care-kit', name: 'Silver Care Kit (free gift)', qty: 1, total: 0, opts: 'Unlocked at ' + money2(FREE_GIFT) }] : [])],
    items: cart.items.filter((i) => !i.addon).map((i) => ({ id: i.id, finish: i.finish, opts: i.opts, qty: i.qty, engraving: i.engraving || '' })),
    totals: { merch: t.merch, discount: t.discount, points: t.pointsAmt, pointsUsed: t.pointsUsed, earn: t.earn, ship: t.shipCost, shipName: t.ship.name, eta: t.ship.eta.map((d) => +d), wrap: t.wrap, tax: t.tax, total: t.total, savings: savings(t) },
  };
  if (account.user) {
    if (t.pointsUsed) account.addPoints(-t.pointsUsed, `Redeemed on ${order.no}`);
    account.addPoints(t.earn, `Earned on ${order.no}`);
    account.user.orders.unshift(order); account.update({});
    order.member = true;
  }
  store.set('lastOrder', order);
  cart.clear();
  ['data', 'step', 'max', 'reserve'].forEach((k) => { try { sessionStorage.removeItem('co:' + k); } catch { /* ignore */ } });
  ov.classList.remove('is-on');
  confirmation(order);
}

/* ------------------------------------------------------------------ */
/* Confirmation                                                        */
/* ------------------------------------------------------------------ */
function confirmation(o) {
  const d = o.data;
  const eta = o.totals.eta.map((x) => new Date(x));
  const ship = dispatchDate(new Date(o.at));
  const u = account.user && o.member ? account.user : null;
  history.replaceState(null, '', 'checkout.html?order=' + o.no);
  const inOrder = new Set(o.lines.map((l) => l.id));
  const offer = ['luna-hoops', 'starlight-studs', 'twist-rope', 'cable-chain', 'orbit-beads'].map((x) => byId[x]).find((x) => !inOrder.has(x.id)) || byId['care-kit'];
  const offerPrice = Math.round(offer.price * 0.75 * 100) / 100;
  root.innerHTML = `<section class="confirm"><div class="wrap">
    <div class="confirm-hero">
      <div class="seal"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span></div>
      <p class="eyebrow">Order ${o.no}</p>
      <h1 class="display h1" style="font-size:clamp(44px,6vw,84px)">Thank you, <em class="serif-i">${esc(d.first || 'friend')}.</em></h1>
      <p class="lead" style="text-align:center">Your order is confirmed. A receipt is on its way to <b style="color:var(--ink)">${esc(d.email)}</b>. Our atelier is already hand-finishing your pieces.</p>
      ${o.totals.savings > 0 ? `<span class="tag tag-silver" style="height:32px;font-size:11px;padding:0 16px">You saved ${money2(o.totals.savings)} today</span>` : ''}
    </div>
    <div class="confirm-grid">
      <div style="display:grid;gap:28px">
        <div class="cbox"><h3 class="eyebrow" style="margin:0">Order status</h3>
          <ol class="timeline">
            <li class="is-done"><span class="d">${ICONS.check}</span><div><b>Order placed</b><small>${new Date(o.at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</small></div></li>
            <li class="is-now"><span class="d"></span><div><b>Hand-finishing &amp; quality check</b><small>${o.lines.some((l) => l.engraving) ? 'Your engraving is being cut by hand' : 'Polishing and packing in our silver-foil box'}</small></div></li>
            <li><span class="d"></span><div><b>Dispatched · ${esc(o.totals.shipName)}</b><small>Expected ${fmtDate(ship)} — tracking link by email</small></div></li>
            <li><span class="d"></span><div><b>Delivered</b><small>${range(...eta)}</small></div></li>
          </ol>
        </div>
        <div class="post-offer">
          <div class="flex between center"><span class="eyebrow" style="color:#a1a1a8">Just for you · one-click add</span><span style="font-variant-numeric:tabular-nums;font-weight:700" id="offer-t">10:00</span></div>
          <div class="po-item"><img src="${img(offer.id)}" alt=""><div><h3 class="display h3" style="margin:0">${esc(offer.name)}</h3><p class="muted" style="margin:6px 0 0">Add it to this order for <b style="color:#fff">${money2(offerPrice)}</b> <s>${money2(offer.price)}</s> — ships in the same box, no extra shipping.</p></div></div>
          <button class="btn btn-silver btn-lg btn-block" id="offer-add">Add to my order — 25% off</button>
        </div>
      </div>
      <div class="cbox">
        <h3 class="eyebrow" style="margin:0">Order summary</h3>
        <div class="sum-items" id="conf-items">${o.lines.map((l) => `<div class="sum-item"><div class="thumb"><img src="${img(l.id)}" alt=""><span class="q">${l.qty}</span></div><div><b>${esc(l.name)}</b><small>${esc(l.opts)}${l.engraving ? `<br>Engraved: “${esc(l.engraving)}”` : ''}</small></div><b style="font-variant-numeric:tabular-nums">${money2(l.total)}</b></div>`).join('')}</div>
        <div class="totals">
          <div class="sum-row"><span>Subtotal</span><span>${money2(o.totals.merch)}</span></div>
          ${o.totals.discount ? `<div class="sum-row discount"><span>Discounts</span><span>−${money2(o.totals.discount)}</span></div>` : ''}
          ${o.totals.points ? `<div class="sum-row discount"><span>Silver Points</span><span>−${money2(o.totals.points)}</span></div>` : ''}
          <div class="sum-row"><span>Shipping · ${esc(o.totals.shipName)}</span><span>${o.totals.ship ? money2(o.totals.ship) : 'Free'}</span></div>
          ${o.totals.wrap ? `<div class="sum-row"><span>Gift wrap</span><span>${money2(o.totals.wrap)}</span></div>` : ''}
          <div class="sum-row"><span>Tax</span><span>${money2(o.totals.tax)}</span></div>
          <div class="grand"><span style="font-weight:600">Paid</span><b id="conf-total">${money2(o.totals.total)}</b></div>
        </div>
        <div class="review-box" style="font-size:13px">
          <div style="grid-template-columns:90px 1fr"><span>Ship to</span><span>${esc(d.first)} ${esc(d.last)}<br>${esc(d.address)}, ${esc(d.city)} ${esc(d.postal)}<br>${TAX[d.country].name}</span></div>
          <div style="grid-template-columns:90px 1fr"><span>Payment</span><span>${o.pay}</span></div>
        </div>
        ${u ? `<div class="points-line">${ICONS.sparkle}<span><b>+${o.totals.earn} Silver Points</b> earned · balance ${u.points.toLocaleString()} (${money2(u.points * POINT_VALUE)})</span></div>` : `<form class="join-after" id="join-after" novalidate><b>Track this order &amp; earn ${o.totals.earn + WELCOME_POINTS} points</b><small>Create a password and we’ll save this order to a new Silver Club account for ${esc(d.email)}.</small><div class="promo-form"><div class="field" data-field="ja-pass"><input id="ja-pass" type="password" placeholder=" " autocomplete="new-password" minlength="8"><label for="ja-pass">Password (8+ characters)</label><span class="err" role="alert"></span></div><button class="btn btn-ink" type="submit">Join</button></div></form>`}
        <div class="flex gap-12 wrap-f"><a class="btn btn-ink" href="shop.html">Continue shopping</a>${u ? '<a class="btn btn-ghost" href="account.html#orders">View in my account</a>' : ''}</div>
        <p class="muted" style="font-size:12px;margin:0">This is a demo store. No payment was taken and nothing will be shipped.</p>
      </div>
    </div>
  </div></section>`;
  setTimeout(() => confetti({ count: 200 }), 300);
  setTimeout(() => confetti({ count: 120, x: 0.2, y: 0.5 }), 900);
  setTimeout(() => confetti({ count: 120, x: 0.8, y: 0.5 }), 1200);
  let left = 600;
  const iv = setInterval(() => { left--; const el = $('#offer-t'); if (!el) return clearInterval(iv); el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(iv); $('#offer-add').disabled = true; $('#offer-add').textContent = 'Offer expired'; } }, 1000);
  $('#offer-add').onclick = (e) => {
    const b = e.currentTarget; b.disabled = true; b.innerHTML = '<span class="spinner"></span>';
    setTimeout(() => {
      o.lines.push({ id: offer.id, name: offer.name, qty: 1, total: offerPrice, opts: 'Added after checkout · 25% off' });
      o.items = [...(o.items || []), { id: offer.id, finish: 'polished', opts: {}, qty: 1 }];
      o.totals.total = Math.round((o.totals.total + offerPrice * (1 + TAX[d.country].rate)) * 100) / 100;
      store.set('lastOrder', o);
      if (o.member && account.user) { const i = account.user.orders.findIndex((x) => x.no === o.no); if (i > -1) account.user.orders[i] = o; account.addPoints(Math.floor(offerPrice), `Earned on ${o.no}`); }
      $('#conf-items').insertAdjacentHTML('beforeend', `<div class="sum-item" style="animation:itemIn .6s var(--ease-out)"><div class="thumb"><img src="${img(offer.id)}" alt=""><span class="q">1</span></div><div><b>${esc(offer.name)}</b><small>Added after checkout · 25% off</small></div><b>${money2(offerPrice)}</b></div>`);
      $('#conf-total').textContent = money2(o.totals.total);
      b.innerHTML = `${ICONS.check} Added to order ${o.no}`;
      confetti({ count: 80, x: 0.3, y: 0.6 });
      toast({ img: img(offer.id), html: `<strong>${esc(offer.name)}</strong> added to your order`, sub: `Charged ${money2(offerPrice)} + tax to ${o.pay.replace(/<[^>]+>/g, ' ')} (demo)` });
    }, 900);
  };
  const ja = $('#join-after');
  if (ja) ja.onsubmit = async (e) => {
    e.preventDefault();
    const pw = $('#ja-pass').value, f = $('[data-field="ja-pass"]');
    const err = pw.length < 8 ? 'Use at least 8 characters' : account.exists(d.email) ? 'You already have an account — sign in from the account page' : '';
    f.classList.toggle('is-invalid', !!err); $('.err', f).textContent = err;
    if (err) return;
    await account.register({ first: d.first, last: d.last, email: d.email, password: pw, news: d.news, phone: d.phone });
    const u2 = account.user;
    u2.addresses.push({ country: d.country, first: d.first, last: d.last, address: d.address, apt: d.apt, city: d.city, region: d.region, postal: d.postal, phone: d.phone, default: true });
    o.member = true; u2.orders.unshift(o); account.addPoints(o.totals.earn, `Earned on ${o.no}`);
    store.set('lastOrder', o);
    confetti({ count: 100 });
    toast({ icon: ICONS.gift, html: `<strong>Welcome to the Silver Club!</strong> ${(o.totals.earn + WELCOME_POINTS).toLocaleString()} points are in your account.`, sub: 'This order is saved under Orders', dark: true });
    confirmation(o);
  };
  scrollTo({ top: 0 });
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */
if (!cart.items.length && !new URLSearchParams(location.search).has('order')) {
  root.innerHTML = `<div class="wrap"><div class="empty" style="padding:120px 0">
    <h1 class="display h2">Your bag is empty</h1><p class="muted">Add a few pieces first — or load a sample bag to try the checkout.</p>
    <div class="flex gap-12 wrap-f" style="justify-content:center"><a class="btn btn-ink btn-lg" href="shop.html">Continue shopping</a><button class="btn btn-silver btn-lg" id="demo-bag">Load a demo bag</button></div></div></div>`;
  $('#demo-bag').onclick = () => {
    cart.add({ id: 'halo-solitaire', finish: 'polished', opts: { size: '7' } });
    cart.add({ id: 'luna-hoops', finish: 'polished', opts: {} });
    cart.add({ id: 'infinity-pendant', finish: 'polished', opts: { length: '18"' }, engraving: 'Always' });
    location.reload();
  };
} else {
  init();
}

/* Revisit a just-placed order via ?order= */
if (new URLSearchParams(location.search).has('order') && !cart.items.length) {
  const o = store.get('lastOrder', null);
  if (o) confirmation(o); else location.href = 'shop.html';
}
// keep summary in sync if the cart changes in another tab
addEventListener('storage', (e) => { if (e.key === 'ss:cart' && $('#summary')) renderAll(); });
