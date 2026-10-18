/* Silver Shop — transactional emails.
 * Emails are built here as branded HTML and sent through EmailJS (free, works from a static site).
 * Every email is also kept in a local mailbox so customers can read it in their account,
 * which is also how the emails work before EmailJS is connected.
 */
import { EMAILJS } from './config.js';
import { byId } from './products.js';

const SITE = new URL('./', location.href).href;
export const mailEnabled = () => !!(EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId);

const LOG_KEY = 'ss:mail';
const readLog = () => { try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch { return []; } };
const writeLog = (l) => { try { localStorage.setItem(LOG_KEY, JSON.stringify(l.slice(0, 60))); } catch { /* storage full */ } };
export const mailbox = (email) => readLog().filter((m) => m.to === String(email || '').toLowerCase());

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const thumb = (id) => `${SITE}assets/img/email/${byId[id] ? id : 'care-kit'}.jpg`;
const link = (path) => SITE + path;

export function deviceName() {
  const ua = navigator.userAgent;
  const os = /iPad|Macintosh.*Mobile/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'a device';
  const br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'a browser';
  return `${br} on ${os}`;
}

/* ------------------------------------------------------------------ */
/* Layout: table-based HTML that renders in Gmail, Apple Mail, Outlook */
/* ------------------------------------------------------------------ */
const F = "font-family:Helvetica,Arial,sans-serif;";
const SERIF = "font-family:Georgia,'Times New Roman',serif;";
function button(label, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td style="background:#0a0a0b;border-radius:999px"><a href="${url}" style="${F}display:inline-block;padding:16px 30px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">${label}</a></td></tr></table>`;
}
function layout({ preheader, eyebrow, title, intro, body = '', cta }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f1f3">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f3"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden">
  <tr><td style="background:#0a0a0b;padding:26px 32px" align="center">
    <a href="${link('index.html')}" style="text-decoration:none;${SERIF}color:#f4f4f6;font-size:24px;letter-spacing:6px">SILVER <span style="font-style:italic;letter-spacing:1px;color:#b9b9c0">shop</span></a>
  </td></tr>
  <tr><td style="height:3px;background:#c9c9ce;line-height:3px;font-size:0">&nbsp;</td></tr>
  <tr><td style="padding:40px 36px 12px">
    <p style="${F}margin:0 0 12px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6b6b72">${esc(eyebrow)}</p>
    <h1 style="${SERIF}margin:0 0 16px;font-size:34px;line-height:1.1;font-weight:normal;color:#0a0a0b">${title}</h1>
    <p style="${F}margin:0;font-size:15px;line-height:1.65;color:#3d3d43">${intro}</p>
    ${body}
    ${cta ? button(cta.label, cta.url) : ''}
  </td></tr>
  <tr><td style="padding:28px 36px 34px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7"><tr>
      <td style="${F}padding-top:20px;font-size:12px;line-height:1.6;color:#8a8a92">Free 60-day returns · Lifetime warranty · Free insured shipping over $150<br>
      <a href="${link('account.html')}" style="color:#0a0a0b">Your account</a> · <a href="${link('shop.html')}" style="color:#0a0a0b">Shop</a> · <a href="${link('account.html#profile')}" style="color:#0a0a0b">Email preferences</a><br><br>
      Silver Shop is a demo store. No real orders, payments or shipments are made.</td>
    </tr></table>
  </td></tr>
</table></td></tr></table></body></html>`;
}
const box = (inner) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f6f6f7;border-radius:14px"><tr><td style="padding:18px 20px;${F}font-size:14px;line-height:1.6;color:#3d3d43">${inner}</td></tr></table>`;
const row = (k, v, strong) => `<tr><td style="${F}padding:6px 0;font-size:14px;color:#6b6b72">${k}</td><td align="right" style="${F}padding:6px 0;font-size:14px;color:#0a0a0b;${strong ? 'font-weight:bold;font-size:16px' : ''}">${v}</td></tr>`;
function itemsTable(lines) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-top:1px solid #e4e4e7">${lines.map((l) => `<tr>
    <td width="72" style="padding:14px 0;border-bottom:1px solid #f0f0f2"><img src="${thumb(l.id)}" width="60" height="60" alt="" style="display:block;border-radius:10px;background:#f4f4f5"></td>
    <td style="${F}padding:14px 12px;border-bottom:1px solid #f0f0f2;font-size:14px;color:#0a0a0b"><b>${esc(l.name)}</b>${l.qty > 1 ? ` × ${l.qty}` : ''}<br><span style="font-size:12px;color:#6b6b72">${esc(l.opts || '')}${l.engraving ? ` · Engraved “${esc(l.engraving)}”` : ''}</span></td>
    <td align="right" style="${F}padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#0a0a0b;white-space:nowrap">${l.total ? money(l.total) : 'Free'}</td></tr>`).join('')}</table>`;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */
const T = {
  welcome: (d) => ({
    subject: `Welcome to the Silver Club, ${d.first} — $12.50 is waiting`,
    html: layout({
      preheader: '250 Silver Points are in your account. Use them on your first order.', eyebrow: 'Silver Club', title: `Welcome, <i>${esc(d.first)}</i>.`,
      intro: `Your account is ready${d.google ? ' and linked to your Google account' : ''}. We’ve added <b>250 Silver Points ($12.50)</b> to spend on your first piece, and you’ll earn 5% back on every order from now on.`,
      body: box('<b>Your member perks</b><br>· $12.50 welcome credit, ready now<br>· 1 point for every $1 you spend<br>· A birthday gift every year<br>· Order tracking and one-tap reorders'),
      cta: { label: 'Spend my $12.50', url: link('shop.html?sort=best') },
    }),
  }),
  signin: (d) => ({
    subject: 'New sign-in to your Silver Shop account',
    html: layout({
      preheader: `Signed in with ${d.method} on ${d.device}.`, eyebrow: 'Security', title: 'New sign-in',
      intro: `Hi ${esc(d.first)}, your Silver Club account was just signed in to. If this was you, there’s nothing to do.`,
      body: box(`<table role="presentation" width="100%">${row('When', esc(d.when))}${row('Device', esc(d.device))}${row('Method', esc(d.method))}</table>`)
        + `<p style="${F}margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b6b72">Wasn’t you? Change your password from your account straight away.</p>`,
      cta: { label: 'Review my account', url: link('account.html#profile') },
    }),
  }),
  password: (d) => ({
    subject: 'Your Silver Shop password was changed',
    html: layout({
      preheader: 'Your password was just updated.', eyebrow: 'Security', title: 'Password updated',
      intro: `Hi ${esc(d.first)}, the password for your Silver Club account was ${d.added ? 'added' : 'changed'} on ${esc(d.when)} from ${esc(d.device)}.`,
      body: `<p style="${F}margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b6b72">If you didn’t do this, reset your password from the sign-in page.</p>`,
      cta: { label: 'Go to my account', url: link('account.html') },
    }),
  }),
  order: (o) => {
    const t = o.totals, d = o.data;
    return {
      subject: `Order confirmed: ${o.no} — thank you, ${d.first || 'friend'}`,
      html: layout({
        preheader: `Arriving ${day(t.eta[0])} – ${day(t.eta[1])}. Your pieces are being hand-finished now.`, eyebrow: `Order ${o.no}`, title: `Thank you, <i>${esc(d.first || 'friend')}</i>.`,
        intro: `Your order is confirmed and our atelier is already hand-finishing your pieces. Estimated delivery: <b>${day(t.eta[0])} – ${day(t.eta[1])}</b> (${esc(t.shipName)}).`,
        body: itemsTable(o.lines) + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
            ${row('Subtotal', money(t.merch))}${t.discount ? row('Discounts', '−' + money(t.discount)) : ''}${t.points ? row('Silver Points', '−' + money(t.points)) : ''}
            ${row('Shipping', t.ship ? money(t.ship) : 'Free')}${t.wrap ? row('Gift wrap', money(t.wrap)) : ''}${row('Tax', money(t.tax))}${row('Total paid', money(t.total), true)}</table>`
          + (t.savings > 0 ? box(`You saved <b>${money(t.savings)}</b> on this order.${t.earn && o.member ? ` You also earned <b>${t.earn} Silver Points</b>.` : ''}`) : '')
          + box(`<b>Shipping to</b><br>${esc(d.first)} ${esc(d.last)}<br>${esc(d.address)}${d.apt ? ', ' + esc(d.apt) : ''}<br>${esc(d.city)}${d.region ? ', ' + esc(d.region) : ''} ${esc(d.postal)}<br><br><b>Payment</b><br>${esc(String(o.pay).replace(/<[^>]+>/g, ' '))}`),
        cta: o.member ? { label: 'Track my order', url: link('account.html#orders') } : { label: 'Keep shopping', url: link('shop.html') },
      }),
    };
  },
  orderUpdate: ({ o, item, price }) => ({
    subject: `${item} added to order ${o.no}`,
    html: layout({
      preheader: 'It ships in the same box, no extra shipping.', eyebrow: `Order ${o.no}`, title: 'Added to your order',
      intro: `<b>${esc(item)}</b> was added to order ${esc(o.no)} for ${money(price)} (25% off). It ships in the same box at no extra shipping cost. New order total: <b>${money(o.totals.total)}</b>.`,
      cta: { label: 'View my order', url: link(o.member ? 'account.html#orders' : 'shop.html') },
    }),
  }),
  shipped: (o) => ({
    subject: `Your order ${o.no} is on its way`,
    html: layout({
      preheader: `Arriving ${day(o.totals.eta[0])} – ${day(o.totals.eta[1])}.`, eyebrow: `Order ${o.no}`, title: 'It’s on its way.',
      intro: `Good news, ${esc(o.data.first)}: your pieces passed their final polish and quality check and have left the atelier. Expected delivery: <b>${day(o.totals.eta[0])} – ${day(o.totals.eta[1])}</b>.`,
      body: itemsTable(o.lines.filter((l) => l.total)),
      cta: { label: 'Track delivery', url: link('account.html#orders') },
    }),
  }),
  newsletter: (d) => ({
    subject: 'Your 15% code is inside',
    html: layout({
      preheader: 'Use WELCOME15 for 15% off your first piece.', eyebrow: 'The Silver Letter', title: 'Here’s <i>15% off</i>.',
      intro: 'Thanks for joining The Silver Letter. You’ll be first to hear about new drops and private sales. Here is your code for 15% off your first order:',
      body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="${F}border:1px dashed #0a0a0b;border-radius:12px;padding:16px 26px;font-size:24px;font-weight:bold;letter-spacing:6px;color:#0a0a0b">${esc(d.code || 'WELCOME15')}</td></tr></table>`,
      cta: { label: 'Shop with 15% off', url: link('shop.html') },
    }),
  }),
  contact: (d) => ({
    subject: 'We’ve received your message',
    html: layout({
      preheader: 'A jeweler will reply within a few hours.', eyebrow: 'Atelier', title: 'Message received',
      intro: 'Thank you for writing to us. One of our jewelers will reply within a few hours, Monday to Saturday. Here’s a copy of your message:',
      body: box(esc(d.message).replace(/\n/g, '<br>')),
    }),
  }),
};

/** Build, log and (when EmailJS is connected) send an email. Resolves to the log entry. */
export async function sendMail(type, to, data) {
  to = String(to || '').trim().toLowerCase();
  if (!to || !T[type]) return null;
  const { subject, html } = T[type](data);
  const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type, to, subject, html, at: Date.now(), status: mailEnabled() ? 'sending' : 'preview' };
  const log = readLog(); log.unshift(entry); writeLog(log);
  if (!mailEnabled()) return entry;
  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id: EMAILJS.templateId, user_id: EMAILJS.publicKey, template_params: { to_email: to, subject, html, from_name: 'Silver Shop' } }),
    });
    entry.status = r.ok ? 'sent' : 'failed';
    if (!r.ok) console.warn('Email not sent:', r.status, await r.text());
  } catch (e) { entry.status = 'failed'; console.warn('Email not sent:', e); }
  const l2 = readLog(); const i = l2.findIndex((m) => m.id === entry.id); if (i > -1) { l2[i].status = entry.status; writeLog(l2); }
  return entry;
}
