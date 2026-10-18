# Silver Shop

A demo storefront for sterling silver jewelry, bullion and homeware, styled black on white with 3D silver effects. Everything is fictional: products, prices, reviews and stock. **No real orders or payments are processed.**

## Run it

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
