# Silver Shop

A demo storefront for sterling silver jewelry, bullion and homeware, styled black on white with 3D silver effects. Everything is fictional: products, prices, reviews and stock. **No real orders or payments are processed.**

## Live site (GitHub Pages)

The site is plain static files with relative paths, so GitHub Pages serves it as-is. There is no build step, and `.nojekyll` tells Pages to skip Jekyll.

To publish: open the repository's **Settings → Pages**. Under *Build and deployment*, set **Source** to *Deploy from a branch*, choose the branch `claude/silver-shop-website-wm8xpn` and the folder `/ (root)`, then click **Save**. After about a minute the site is live at:

**https://idtbas.github.io/Website-test-3/**

Every push to that branch redeploys automatically. `404.html` handles mistyped links.

## Continue with Google (free)

The account page and checkout can show Google's official **Continue with Google** button. Members sign in with their Gmail account: no password to make, name and email filled in, and the $12.50 welcome credit applied. It uses Google Identity Services, which costs nothing. The button stays hidden until you add a client ID:

1. Go to https://console.cloud.google.com and create a project (any name).
2. **APIs & Services → OAuth consent screen**: choose *External*, enter an app name and support email, save, then **Publish app**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**. Under **Authorized JavaScript origins** add `https://idtbas.github.io` (and `http://localhost:8080` for local testing).
4. Copy the Client ID (it ends in `.apps.googleusercontent.com`) into `assets/js/config.js`.

A client ID is meant to be public, so it's safe in the repo. Accounts are still kept in each visitor's browser and the sign-in token is checked in the browser, not on a server. That's fine for a demo, but a real shop would verify it on a backend.

## Run it locally

It's a static site with no build step. Serve the folder with any static server:

```bash
npx http-server -c-1 .     # or: python3 -m http.server
```

Then open http://localhost:8080. It needs a web server because ES modules don't load over `file://`.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | Live WebGL hero (interlocked silver rings you can drag), flash sale with countdown and "% claimed" meters, category bento, bestseller rail, Stack & Save promo, scroll-driven 925 story, reviews marquee, bullion ticker |
| `shop.html` | Collection page with category, price range, finish, rating and availability filters, sorting, grid density, active filter chips, and a promo tile. Filters sync to the URL (`?cat=rings`, `?sale=1`, `?sort=new`) |
| `product.html?id=…` | Gallery with hover zoom, interactive 3D viewer that previews each finish in real time, size and length pickers, size guide, engraving with live preview, low-stock and "viewing now" signals, dispatch cutoff timer, delivery estimate, "Complete the set" bundle, filterable reviews (you can write one), related and recently viewed products, sticky add-to-bag bar |
| `account.html` | Silver Club: create an account (password strength, show/hide, birthday), sign in, reset password. Member dashboard with a silver membership card, points balance and tier progress, orders with tracking and "Buy again", saved pieces, address book and profile settings |
| `checkout.html` | 4-step checkout (information → shipping → payment → review): cart reservation timer, express checkout, email typo correction, address autocomplete, per-country address formats and tax, delivery dates per shipping method, one-click order bump, gift wrap and message, 3D silver card preview with Luhn validation and card-type detection, Pay in 4 schedule, promo codes, animated totals, processing sequence, confirmation with order timeline and a timed one-click add-on offer |

Shared on every page: rotating announcement bar with a live spot-price ticker and sale timer, mega menu, search overlay (press `/`), cart and wishlist drawer with a free-shipping meter, Stack & Save hints and upsells, quick view, an add-to-bag animation that flies the item into the bag, social-proof toasts, and an exit-intent popup that reveals a discount code.

## Demo codes

| Code | Effect |
| --- | --- |
| `SILVER10` | 10% off (bullion excluded) |
| `WELCOME15` | 15% off your first order (from the popup or the newsletter signup) |
| `FREESHIP` | Free express shipping |
| `VIP20` | 20% off orders over $250 |

**Stack & Save** applies on its own: 10% off two pieces of jewelry, 15% off three or more.

**Rewards:** free insured shipping from $150 and a free Silver Care Kit from $250, shown as a two-step meter in the bag. When you're close, the bag suggests the one piece that gets you over the line.

**Silver Club (accounts):** joining gives 250 points ($12.50) to spend straight away. Members earn 1 point per $1 (5% back) and can redeem points at checkout. You can join from the account page, from the "Save my details" box at checkout, or after ordering, which attaches the order to the new account. Accounts are stored only in your browser (passwords are salted and SHA-256 hashed), so it's a working demo, not a real login system.

**On phones** there is a bottom tab bar, a compact "Added to bag" sheet, bottom-sheet bag, filters and quick view (drag down to close), a swipeable product gallery, a sticky add-to-bag bar, and a sticky continue button in checkout.

Test cards: `4242 4242 4242 4242` is approved, `4000 0000 0000 0002` is declined. Use any future expiry date and any CVC.

## 3D models and product photos

Every product is a procedural three.js model in `assets/js/models.js`, lit by a custom white-studio environment. The same models drive the homepage hero, the product 3D viewer, and the product photos in `assets/img/products/`.

To re-render the photos after changing a model:

```bash
npx http-server -p 8080 . &              # serve the repo root
node tools/render-products.mjs           # all products
node tools/render-products.mjs aura-band # or only some
```

`tools/contact-sheet.html` shows every render on one page.

## Structure

```
assets/css/styles.css    design system: tokens, buttons, cards, drawer, modal, forms, footer
assets/css/pages.css     page-specific styles
assets/js/app.js         cart and pricing engine, header/footer/drawer, search, quick view, toasts, effects
assets/js/products.js    catalogue and seeded reviews
assets/js/models.js      procedural 3D silver models and studio lighting
assets/js/viewer.js      interactive product viewer
assets/js/{home,shop,product,checkout}.js
assets/vendor/three      three.js r169 (MIT)
assets/fonts             Inter and Cormorant Garamond (SIL OFL), self-hosted
```
