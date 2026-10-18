/* Silver Shop — demo catalogue. All products, prices, reviews and stock levels are fictional. */

export const CATEGORIES = [
  { id: 'rings', name: 'Rings', blurb: 'Bands, signets and solitaires, hand-finished to a mirror.' },
  { id: 'necklaces', name: 'Necklaces', blurb: 'Chains and pendants that catch the light with every breath.' },
  { id: 'earrings', name: 'Earrings', blurb: 'Hoops, studs and drops, weightless to wear.' },
  { id: 'bracelets', name: 'Bracelets', blurb: 'Cuffs, bangles and beads built to be stacked.' },
  { id: 'men', name: 'For Him', blurb: 'Architectural pieces with quiet weight.' },
  { id: 'bullion', name: 'Bullion', blurb: 'Investment-grade .999 fine silver, minted for the vault.' },
  { id: 'home', name: 'Home', blurb: 'Heirloom silver for the table and the mantel.' },
  { id: 'care', name: 'Care', blurb: 'Keep every piece brilliant for a lifetime.' },
];

const RING_SIZES = ['5', '6', '7', '8', '9', '10', '11', '12'];
const LENGTHS = ['16"', '18"', '20"', '22"', '24"'];
const WRIST = ['S · 15cm', 'M · 17cm', 'L · 19cm'];

export const PRODUCTS = [
  {
    id: 'aura-band', name: 'Aura Band', category: 'rings', price: 89, compareAt: 119, rating: 4.9, reviews: 1284,
    badge: 'Bestseller', stock: 7, sold: 9412, flash: true, isNew: false,
    tagline: 'The comfort-fit band that started it all.',
    options: { size: RING_SIZES }, finishes: ['polished', 'brushed', 'oxidized'], engravable: true,
    description: 'A 6 mm comfort-fit band milled from a single billet of 925 sterling silver, then hand-polished in seven stages until it holds a reflection like still water. Domed outside, softly rounded inside — you will forget you are wearing it until someone asks where it is from.',
    specs: { Metal: '925 Sterling Silver', Width: '6 mm', Thickness: '1.8 mm', Weight: '≈ 6.2 g', Finish: 'Hand polished, e-coated' },
  },
  {
    id: 'orbit-signet', name: 'Orbit Signet', category: 'rings', price: 145, rating: 4.8, reviews: 642,
    badge: 'New', stock: 12, sold: 2310, isNew: true,
    tagline: 'A modern heirloom, engraved with your initial.',
    options: { size: RING_SIZES }, finishes: ['polished', 'brushed', 'oxidized'], engravable: true,
    description: 'Our signet reimagined with a softly sculpted shoulder that flows into a round 13 mm face. Each face is struck with our "S" seal — or leave it to us to hand-engrave your own initial.',
    specs: { Metal: '925 Sterling Silver', Face: '13 mm round', Weight: '≈ 11 g', Finish: 'Hand polished' },
  },
  {
    id: 'halo-solitaire', name: 'Halo Solitaire', category: 'rings', price: 189, compareAt: 249, rating: 4.9, reviews: 918,
    badge: '-24%', stock: 3, sold: 5120, flash: true,
    tagline: 'A brilliant-cut lab stone, held by six silver claws.',
    options: { size: RING_SIZES }, finishes: ['polished', 'brushed'], engravable: true,
    description: 'A 1 ct brilliant-cut lab-grown white sapphire, set high in a six-claw crown so light can reach it from every angle. The fine 2 mm band keeps the focus where it belongs.',
    specs: { Metal: '925 Sterling Silver, rhodium plated', Stone: '1.0 ct lab white sapphire', Band: '2 mm', Setting: 'Six-claw crown' },
  },
  {
    id: 'twist-rope', name: 'Twist Rope Ring', category: 'rings', price: 69, rating: 4.7, reviews: 433,
    stock: 22, sold: 3104,
    tagline: 'Three strands, braided by hand.',
    options: { size: RING_SIZES }, finishes: ['polished', 'oxidized'],
    description: 'Three sterling wires twisted together by hand, then soldered into a seamless loop. Stacks beautifully with the Aura Band.',
    specs: { Metal: '925 Sterling Silver', Width: '3 mm', Weight: '≈ 4 g' },
  },
  {
    id: 'cable-chain', name: 'Essential Cable Chain', category: 'necklaces', price: 79, rating: 4.8, reviews: 1530,
    badge: 'Bestseller', stock: 31, sold: 12044,
    tagline: 'The chain every pendant deserves.',
    options: { length: LENGTHS }, finishes: ['polished', 'oxidized'],
    description: 'A classic 2.2 mm cable chain with a solid lobster clasp. Strong enough to carry any pendant, refined enough to wear alone.',
    specs: { Metal: '925 Sterling Silver', Link: '2.2 mm cable', Clasp: 'Lobster, stamped 925' },
  },
  {
    id: 'infinity-pendant', name: 'Infinity Pendant', category: 'necklaces', price: 119, compareAt: 149, rating: 4.9, reviews: 802,
    badge: 'Gift favourite', stock: 5, sold: 6720, flash: true,
    tagline: 'A loop with no beginning and no end.',
    options: { length: LENGTHS }, finishes: ['polished', 'brushed'], engravable: true,
    description: 'A sculpted ribbon of silver turns back on itself to form the infinity sign, suspended on our supple snake chain. The back can carry up to 12 engraved characters.',
    specs: { Metal: '925 Sterling Silver', Pendant: '24 × 12 mm', Chain: '1.2 mm snake' },
  },
  {
    id: 'compass-medallion', name: 'Compass Medallion', category: 'necklaces', price: 159, rating: 4.8, reviews: 377,
    badge: 'New', stock: 14, sold: 1480, isNew: true,
    tagline: 'Find your way home.',
    options: { length: LENGTHS }, finishes: ['polished', 'brushed', 'oxidized'], engravable: true,
    description: 'An 8-point compass rose struck in relief on a 22 mm medallion, framed by a raised rim. Engrave coordinates on the back for the place that matters most.',
    specs: { Metal: '925 Sterling Silver', Medallion: '22 mm', Chain: '1.8 mm cable' },
  },
  {
    id: 'luna-hoops', name: 'Luna Hoops', category: 'earrings', price: 75, compareAt: 95, rating: 4.8, reviews: 1102,
    badge: 'Bestseller', stock: 9, sold: 8800, flash: true,
    tagline: 'Featherlight hoops with a hidden hinge.',
    finishes: ['polished', 'brushed'],
    description: 'Hollow-formed for featherlight wear, with a click-shut hinge you will never see. 25 mm across — the size that goes with everything.',
    specs: { Metal: '925 Sterling Silver', Diameter: '25 mm', Tube: '2.5 mm', Closure: 'Hinged click' },
  },
  {
    id: 'pearl-drop', name: 'Pearl Drop Earrings', category: 'earrings', price: 99, rating: 4.9, reviews: 521,
    stock: 11, sold: 2950,
    tagline: 'Freshwater pearls on silver hooks.',
    finishes: ['polished'],
    description: 'Lustrous 9 mm freshwater pearls, capped in silver and suspended from hand-bent French hooks. Each pearl is unique.',
    specs: { Metal: '925 Sterling Silver', Pearl: '9 mm freshwater', Drop: '28 mm' },
  },
  {
    id: 'starlight-studs', name: 'Starlight Studs', category: 'earrings', price: 65, rating: 4.7, reviews: 689,
    badge: 'Only a few left', stock: 4, sold: 4320,
    tagline: 'Everyday sparkle, four claws strong.',
    finishes: ['polished', 'brushed'],
    description: '6 mm brilliant-cut lab stones in a four-claw basket with secure butterfly backs. Your new everyday studs.',
    specs: { Metal: '925 Sterling Silver', Stone: '6 mm lab white sapphire', Backs: 'Butterfly' },
  },
  {
    id: 'atlas-cuff', name: 'Atlas Cuff', category: 'bracelets', price: 169, compareAt: 219, rating: 4.8, reviews: 296,
    badge: '-23%', stock: 6, sold: 1920, flash: true,
    tagline: 'Sculpted weight, open at the wrist.',
    options: { size: WRIST }, finishes: ['polished', 'brushed', 'oxidized'], engravable: true,
    description: 'A wide, sculptural cuff that swells at the centre and tapers at the ends. Gently adjustable to slip on and off with ease.',
    specs: { Metal: '925 Sterling Silver', Width: '9–24 mm', Weight: '≈ 34 g' },
  },
  {
    id: 'orbit-beads', name: 'Orbit Bead Bracelet', category: 'bracelets', price: 85, rating: 4.7, reviews: 344,
    stock: 18, sold: 2210,
    tagline: 'Twenty-six polished planets.',
    options: { size: WRIST }, finishes: ['polished', 'oxidized'],
    description: 'Hollow 6 mm sterling beads on a high-tension silk-wrapped core, finished with an engraved S tag.',
    specs: { Metal: '925 Sterling Silver', Bead: '6 mm', Core: 'Silk-wrapped stretch' },
  },
  {
    id: 'wave-bangle', name: 'Wave Bangle Duo', category: 'bracelets', price: 129, rating: 4.8, reviews: 212,
    badge: 'New', stock: 13, sold: 860, isNew: true,
    tagline: 'Two bangles that move like water.',
    options: { size: WRIST }, finishes: ['polished', 'brushed'],
    description: 'A pair of undulating bangles — one bold, one fine — designed to ripple against each other as you move.',
    specs: { Metal: '925 Sterling Silver', Wire: '3.5 mm & 2.5 mm', Set: '2 bangles' },
  },
  {
    id: 'monogram-cufflinks', name: 'Monogram Cufflinks', category: 'men', price: 135, rating: 4.9, reviews: 188,
    stock: 10, sold: 1240,
    tagline: 'A sharp cuff, signed.',
    finishes: ['polished', 'brushed', 'oxidized'], engravable: true,
    description: 'Round 16 mm faces with a raised rim and our struck S monogram, on solid toggle backs. Arrives in a lacquered gift box.',
    specs: { Metal: '925 Sterling Silver', Face: '16 mm', Back: 'Solid toggle' },
  },
  {
    id: 'eagle-coin', name: 'Silver Star 1 oz Coin', category: 'bullion', price: 42, rating: 4.9, reviews: 2210,
    badge: '.999 Fine', stock: 240, sold: 38110,
    tagline: 'One troy ounce of .999 fine silver.',
    options: { pack: ['1 coin', 'Tube of 20', 'Box of 100'] }, optionPrices: { pack: { 'Tube of 20': 799, 'Box of 100': 3890 } }, finishes: ['polished'],
    description: 'Our proprietary bullion round: one troy ounce of .999 fine silver with a reeded edge and an 8-point star in high relief. Ideal for stacking and gifting.',
    specs: { Purity: '.999 Fine Silver', Weight: '31.103 g', Diameter: '39 mm', Edge: 'Reeded' },
  },
  {
    id: 'cast-bar', name: '100 g Fine Silver Bar', category: 'bullion', price: 128, rating: 4.9, reviews: 864,
    stock: 85, sold: 9050,
    tagline: 'Serial-numbered, sealed, assayed.',
    finishes: ['polished'],
    description: 'A precision-minted 100 g bar of 999.9 fine silver, individually serial-numbered and shipped in a tamper-evident assay card.',
    specs: { Purity: '999.9 Fine Silver', Weight: '100 g', Size: '50 × 28 × 7 mm', Certificate: 'Included' },
  },
  {
    id: 'nocturne-candlestick', name: 'Nocturne Candlestick', category: 'home', price: 149, compareAt: 189, rating: 4.8, reviews: 156,
    stock: 8, sold: 740,
    tagline: 'Turned, not cast.',
    finishes: ['polished', 'brushed'],
    description: 'Spun and turned on the lathe from heavy-gauge silver-plated brass, with a weighted base and a candle cup that catches every drip.',
    specs: { Material: 'Sterling-plated brass', Height: '24 cm', Base: '12 cm weighted' },
  },
  {
    id: 'cascade-goblet', name: 'Cascade Goblet', category: 'home', price: 115, rating: 4.7, reviews: 98,
    stock: 15, sold: 520,
    tagline: 'For the toast that matters.',
    finishes: ['polished', 'brushed'], engravable: true,
    description: 'A tulip bowl on a knopped stem, inspired by 18th-century silver. Engrave two names and a date for the perfect wedding gift.',
    specs: { Material: 'Sterling-plated brass', Height: '19 cm', Capacity: '240 ml' },
  },
  {
    id: 'orb-vase', name: 'Orb Bud Vase', category: 'home', price: 89, rating: 4.8, reviews: 143,
    badge: 'New', stock: 19, sold: 410, isNew: true,
    tagline: 'One stem is enough.',
    finishes: ['polished', 'brushed', 'oxidized'],
    description: 'A perfect sphere with a slender neck, made to hold a single stem — and to reflect the whole room around it.',
    specs: { Material: 'Sterling-plated brass', Height: '16 cm', Body: '11 cm sphere' },
  },
  {
    id: 'care-kit', name: 'Silver Care Kit', category: 'care', price: 19, rating: 4.9, reviews: 3120,
    stock: 120, sold: 21400, addon: 9,
    tagline: 'Brilliance, restored in seconds.',
    finishes: ['polished'],
    description: 'Our non-abrasive polishing balm and a double-sided microfibre cloth in a silver tin. Removes tarnish in seconds and leaves an invisible anti-tarnish barrier.',
    specs: { Contains: 'Balm 50 ml, cloth 20 × 20 cm', Safe: 'For all silver finishes' },
  },
];

export const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export const img = (id, n = 1) => `assets/img/products/${id}-${n}.webp`;

/* Deterministic pseudo-random so demo reviews stay stable between visits. */
export function seeded(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ['Amelia R.', 'Jonas K.', 'Priya S.', 'Lucas M.', 'Sofia L.', 'Noah W.', 'Hannah B.', 'Mateo G.', 'Yuki T.', 'Olivia P.', 'Elias F.', 'Chloé D.', 'Aisha N.', 'Leo V.', 'Grace H.', 'Finn O.'];
const TITLES = ['Wear it every single day', 'Even better in person', 'The perfect gift', 'Heavier than I expected — in a good way', 'Mirror finish is unreal', 'Bought a second one', 'Exactly as pictured', 'Packaging was stunning', 'Compliments all week', 'Quality you can feel'];
const BODIES = [
  'I was nervous ordering jewelry online but the finish is flawless. It arrived in two days in the most beautiful box.',
  'Bought this as an anniversary gift and my partner has not taken it off since. The engraving is so crisp.',
  'Feels substantial and looks far more expensive than it was. The polish catches the light constantly.',
  'Sizing guide was spot on. Shower, gym, sleep — still shining after three months.',
  'Customer service helped me pick a size and even sent a free polishing cloth. Will be back for the matching piece.',
  'This is my third order. Consistent quality every time, and the free returns made it an easy decision.',
  'Gorgeous detail. You can tell it was finished by hand — no tool marks anywhere.',
  'I stack it with the Aura Band and the combination is perfect. Already eyeing the cuff.',
];
const CITIES = ['Lisbon', 'Berlin', 'Austin', 'London', 'Toronto', 'Melbourne', 'Paris', 'Copenhagen', 'Brooklyn', 'Zürich', 'Seattle', 'Milan', 'Vienna', 'Dublin'];

export function reviewsFor(p, count = 8) {
  const r = seeded(p.id);
  return Array.from({ length: count }, (_, i) => {
    const stars = r() < 0.82 ? 5 : r() < 0.7 ? 4 : 3;
    const days = Math.floor(r() * 120) + 1 + i * 3;
    return {
      name: NAMES[Math.floor(r() * NAMES.length)], city: CITIES[Math.floor(r() * CITIES.length)],
      stars, title: stars === 3 ? 'Beautiful, but smaller than I imagined' : TITLES[Math.floor(r() * TITLES.length)], body: stars === 3 ? 'The quality is lovely and the polish is perfect, it just reads a little more delicate in person than in the photos. Keeping it anyway.' : BODIES[Math.floor(r() * BODIES.length)],
      date: new Date(Date.now() - days * 864e5), helpful: Math.floor(r() * 60), verified: r() < 0.92,
      photo: r() < 0.3 ? img(p.id, 1 + Math.floor(r() * 3)) : null,
      size: p.options?.size ? (r() < 0.6 ? 'True to size' : 'Runs slightly small') : null,
    };
  });
}

export function ratingDistribution(p) {
  const r = seeded(p.id + 'dist');
  const five = 0.7 + r() * 0.18, four = (1 - five) * (0.6 + r() * 0.2), three = (1 - five - four) * 0.6, two = (1 - five - four - three) * 0.55;
  const one = Math.max(0, 1 - five - four - three - two);
  return [five, four, three, two, one].map((x) => Math.round(x * p.reviews));
}

export { CITIES };
