/* Silver Shop — procedural 3D silver models.
 * Shared by the live hero, the product 3D viewer and the product-photo renderer (tools/render.html).
 */
import * as THREE from 'three';

const TAU = Math.PI * 2;
const V2 = (x, y) => new THREE.Vector2(x, y);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

/** A photographic "white studio" lighting environment: soft boxes and black flags
 *  give polished silver its crisp black-and-white reflections. */
export function createStudioEnvironment(renderer) {
  const scene = new THREE.Scene();

  const dome = new THREE.SphereGeometry(40, 64, 32);
  const col = [];
  const p = dome.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) / 40 + 1) / 2;
    const g = 0.2 + 0.85 * THREE.MathUtils.smoothstep(t, 0.3, 0.8);
    col.push(g, g, g * 1.01);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const box = (w, h, intensity, pos, look) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.copy(pos);
    mesh.lookAt(look || V3(0, 0, 0));
    scene.add(mesh);
  };
  box(26, 9, 5.5, V3(0, 22, 4));        // overhead soft box
  box(5, 26, 4.0, V3(-22, 6, 6));       // left strip
  box(5, 26, 3.2, V3(22, 6, -4));       // right strip
  box(12, 6, 2.2, V3(8, 6, 22));        // front fill
  box(3, 18, 6.0, V3(-10, 8, -20));     // rim light
  const flag = (w, h, pos) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
    mesh.position.copy(pos); mesh.lookAt(0, 0, 0); scene.add(mesh);
  };
  flag(9, 26, V3(18, 4, 14));          // black card: gives silver its contrast
  flag(6, 16, V3(-18, 2, -14));

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  return tex;
}

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

export const FINISHES = {
  polished: { label: 'Mirror Polished', color: 0xf1f1f3, roughness: 0.06 },
  brushed: { label: 'Satin Brushed', color: 0xe6e6e9, roughness: 0.3 },
  oxidized: { label: 'Oxidized', color: 0x77777d, roughness: 0.24 },
};

export function silver(finish = 'polished', extra = {}) {
  const f = FINISHES[finish] || FINISHES.polished;
  return new THREE.MeshPhysicalMaterial({
    color: f.color, metalness: 1, roughness: f.roughness,
    clearcoat: finish === 'polished' ? 0.4 : 0, clearcoatRoughness: 0.05,
    envMapIntensity: 1.15, ...extra,
  });
}

export function setFinish(root, finish) {
  const f = FINISHES[finish] || FINISHES.polished;
  root.traverse((o) => {
    if (!o.material) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m.userData.silver) return;
      m.color.setHex(f.color);
      m.roughness = f.roughness;
      m.clearcoat = finish === 'polished' ? 0.4 : 0;
      m.needsUpdate = true;
    });
  });
}

function S(finish, extra) { const m = silver(finish, extra); m.userData.silver = true; return m; }

const gemMaterial = () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0.35, roughness: 0, ior: 2.42, specularIntensity: 1,
  clearcoat: 1, iridescence: 0.5, iridescenceIOR: 2.0, envMapIntensity: 2.2, flatShading: true,
});
const pearlMaterial = () => new THREE.MeshPhysicalMaterial({
  color: 0xf6f1ea, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12,
  sheen: 1, sheenColor: 0xffe8f0, sheenRoughness: 0.4, iridescence: 0.35, iridescenceIOR: 1.6,
});

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

/** Closed superellipse cross-section (counter-clockwise). */
function superellipse(a, b, n = 4, count = 48) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * TAU;
    const c = Math.cos(t), s = Math.sin(t);
    pts.push(V2(a * Math.sign(c) * Math.abs(c) ** (2 / n), b * Math.sign(s) * Math.abs(s) ** (2 / n)));
  }
  return pts;
}
const circle = (r, count = 24) => superellipse(r, r, 2, count);

/** Sweep a closed 2D profile along a path. Open paths should taper to zero scale (rounded ends). */
function sweep(profile, path, { segments = 256, closed = true, up = V3(0, 1, 0), scale = null } = {}) {
  const n = profile.length;
  const rows = closed ? segments : segments + 1;
  const pos = [], uv = [], idx = [];
  const T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3();
  const eps = 1e-4;
  for (let i = 0; i < rows; i++) {
    const t = i / segments;
    const P = path(t);
    const a = path(closed ? (t + eps) % 1 : Math.min(1, t + eps));
    const b = path(closed ? (t - eps + 1) % 1 : Math.max(0, t - eps));
    T.subVectors(a, b).normalize();
    B.copy(up).addScaledVector(T, -up.dot(T)).normalize();
    N.crossVectors(B, T).normalize();
    const sc = scale ? scale(t) : [1, 1];
    for (let j = 0; j < n; j++) {
      const q = profile[j];
      pos.push(P.x + N.x * q.x * sc[0] + B.x * q.y * sc[1], P.y + N.y * q.x * sc[0] + B.y * q.y * sc[1], P.z + N.z * q.x * sc[0] + B.z * q.y * sc[1]);
      uv.push(t, j / n);
    }
  }
  const segs = closed ? rows : rows - 1;
  for (let i = 0; i < segs; i++) {
    const i2 = (i + 1) % rows;
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      const a = i * n + j, b = i2 * n + j, c = i2 * n + j2, d = i * n + j2;
      idx.push(a, d, b, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const ringPath = (R, wobble = null) => (t) => {
  const a = t * TAU;
  return V3(R * Math.cos(a), wobble ? wobble(a) : 0, R * Math.sin(a));
};
const taper = (len) => (t) => {
  const d = Math.min(t, 1 - t);
  const s = d >= len ? 1 : Math.sqrt(Math.max(0, 1 - ((len - d) / len) ** 2));
  return [s, s];
};

function lathe(points, segments = 128) {
  const g = new THREE.LatheGeometry(points.map(([x, y]) => V2(Math.max(x, 0.0001), y)), segments);
  return g;
}

/** Brilliant-cut stone (faceted lathe). */
function brilliant(size = 0.3) {
  const pts = [[0, -0.43], [0.5, -0.01], [0.5, 0.02], [0.29, 0.17], [0, 0.17]].map(([x, y]) => V2(Math.max(x * size * 2, 0.0001), y * size * 2));
  const g = new THREE.LatheGeometry(pts, 16).toNonIndexed();
  g.computeVertexNormals();
  return new THREE.Mesh(g, gemMaterial());
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

function blurred(ctx, px, fn) { ctx.save(); ctx.filter = `blur(${px}px)`; fn(); ctx.restore(); }

function arcText(ctx, text, cx, cy, r, startAngle, font) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = [...text];
  const total = chars.reduce((s, ch) => s + ctx.measureText(ch).width, 0);
  let a = startAngle - total / r / 2;
  for (const ch of chars) {
    const w = ctx.measureText(ch).width;
    a += w / r / 2;
    ctx.save();
    ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    a += w / r / 2;
  }
  ctx.restore();
}

function compassStar(ctx, cx, cy, R, points = 8) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    const r = i % 2 === 0 ? (i % 4 === 0 ? R : R * 0.62) : R * 0.16;
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

/** Bump map for coins / medallions / cufflink faces. */
function faceBump(kind) {
  return canvasTexture(1024, 1024, (ctx, w) => {
    const c = w / 2;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, w);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(c, c, c * 0.995, 0, TAU); ctx.arc(c, c, c * 0.9, 0, TAU, true); ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(c, c, c * 0.9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    if (kind === 'coin') {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(c, c, c * 0.68, 0, TAU); ctx.stroke();
      arcText(ctx, 'SILVER SHOP  •  ONE OUNCE  •  FINE SILVER .999  •', c, c, c * 0.79, -Math.PI / 2, '600 54px serif');
      blurred(ctx, 3, () => compassStar(ctx, c, c, c * 0.52, 8));
      ctx.font = '700 64px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
      ctx.fillText('2026', c, c + 8);
    } else if (kind === 'compass') {
      blurred(ctx, 2, () => compassStar(ctx, c, c, c * 0.78, 8));
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(c, c, c * 0.3, 0, TAU); ctx.stroke();
    } else if (kind === 'monogram') {
      ctx.font = 'italic 600 640px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      blurred(ctx, 3, () => ctx.fillText('S', c, c + 30));
    } else if (kind === 'lid') {
      ctx.textAlign = 'center';
      ctx.font = '600 92px serif'; ctx.fillText('SILVER', c, c - 40);
      ctx.font = '500 64px sans-serif'; ctx.fillText('CARE  •  KIT', c, c + 60);
      ctx.fillRect(c - 180, c + 4, 360, 6);
    }
  });
}

function stripes(count, w = 2048) {
  return canvasTexture(w, 32, (ctx) => {
    for (let i = 0; i < count; i++) {
      const x = (i / count) * w;
      const g = ctx.createLinearGradient(x, 0, x + w / count, 0);
      g.addColorStop(0, '#000'); g.addColorStop(0.5, '#fff'); g.addColorStop(1, '#000');
      ctx.fillStyle = g; ctx.fillRect(x, 0, w / count + 1, 32);
    }
  });
}

/** Disc with planar-UV faces (CylinderGeometry caps) so faces can carry a stamped bump map. */
function disc(radius, height, finish, faceKind, edgeReeds = 0) {
  const g = new THREE.CylinderGeometry(radius, radius, height, 160, 1);
  const face = S(finish, { bumpMap: faceBump(faceKind), bumpScale: 2.2 });
  const side = edgeReeds ? S(finish, { bumpMap: stripes(edgeReeds), bumpScale: 1.6 }) : S(finish);
  return new THREE.Mesh(g, [side, face, face]);
}

function tube(points, r, finish, closed = false, tension = 0.5) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => V3(...p)), closed, 'catmullrom', tension);
  return new THREE.Mesh(sweep(circle(r, 20), (t) => curve.getPointAt(t), { segments: 200, closed, scale: closed ? null : taper(0.012) }), S(finish));
}

/* ------------------------------------------------------------------ */
/* Chains                                                              */
/* ------------------------------------------------------------------ */

const teardrop = (w = 1, h = 1.25) => (t) => {
  const a = t * TAU;
  let d = a; if (d > Math.PI) d -= TAU;
  const r = 1 + 0.32 * Math.exp(-(d * d) / 0.18);
  return V3(Math.sin(a) * w * r, 0, Math.cos(a) * h * r * 0.8 - 0.15);
};

function cableChain(path, finish, { links = 130, len = 0.075, wire = 0.0115 } = {}) {
  const link = sweep(circle(wire, 12), (t) => {
    const a = t * TAU; const L = len * 0.5, R = len * 0.32;
    const x = Math.cos(a) * R + Math.sign(Math.cos(a)) * (L - R) * 0.9;
    return V3(x, 0, Math.sin(a) * R);
  }, { segments: 40, up: V3(0, 1, 0) });
  const mesh = new THREE.InstancedMesh(link, S(finish), links);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), roll = new THREE.Quaternion();
  const X = V3(1, 0, 0);
  for (let i = 0; i < links; i++) {
    const t = i / links;
    const P = path(t);
    const Tn = path((t + 0.001) % 1).sub(path((t - 0.001 + 1) % 1)).normalize();
    q.setFromUnitVectors(X, Tn);
    roll.setFromAxisAngle(X, i % 2 ? Math.PI / 2 : 0);
    q.multiply(roll);
    m.compose(P, q, V3(1, 1, 1));
    mesh.setMatrixAt(i, m);
  }
  return mesh;
}

function snakeChain(path, finish, r = 0.022) {
  const tex = stripes(32, 512); tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(24, 1);
  return new THREE.Mesh(sweep(circle(r, 16), path, { segments: 700 }), S(finish, { bumpMap: tex, bumpScale: 1.2 }));
}

function bail(finish, r = 0.06) {
  const g = new THREE.TorusGeometry(r, r * 0.22, 16, 48);
  return new THREE.Mesh(g, S(finish));
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

function band(finish, { R = 0.92, thick = 0.075, width = 0.2, n = 4 } = {}) {
  return new THREE.Mesh(sweep(superellipse(thick, width, n, 48), ringPath(R), { segments: 220 }), S(finish));
}

const BUILDERS = {
  'aura-band'(finish) {
    const g = new THREE.Group();
    const ring = band(finish, { thick: 0.08, width: 0.24 });
    ring.rotation.x = Math.PI / 2; ring.position.y = 1.0;
    g.add(ring);
    return g;
  },

  'orbit-signet'(finish) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(sweep(superellipse(0.07, 0.17, 4, 48), ringPath(0.9), {
      segments: 220, scale: (t) => { const k = 1 + 0.9 * Math.exp(-(((t - 0.75) * 4.5) ** 2)); return [k, k * 0.95]; },
    }), S(finish));
    ring.rotation.x = Math.PI / 2;
    const face = disc(0.34, 0.1, finish, 'monogram');
    face.position.y = 0.99;
    g.add(ring, face);
    g.position.y = 0.97;
    return g;
  },

  'halo-solitaire'(finish) {
    const g = new THREE.Group();
    const ring = band(finish, { R: 0.9, thick: 0.05, width: 0.09, n: 2.6 });
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    const head = new THREE.Group();
    const stone = brilliant(0.26);
    stone.position.y = 0.2;
    head.add(stone);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      head.add(tube([[Math.cos(a) * 0.08, -0.02, Math.sin(a) * 0.08], [Math.cos(a) * 0.24, 0.16, Math.sin(a) * 0.24], [Math.cos(a) * 0.2, 0.3, Math.sin(a) * 0.2]], 0.018, finish));
    }
    const collet = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 16, 64), S(finish));
    collet.rotation.x = Math.PI / 2; collet.position.y = 0.04;
    head.add(collet);
    head.position.y = 0.92;
    g.add(head);
    g.position.y = 0.95;
    return g;
  },

  'twist-rope'(finish) {
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const ph = (k / 3) * TAU;
      const path = (t) => {
        const a = t * TAU, tw = a * 14 + ph, R = 0.92 + 0.045 * Math.cos(tw);
        return V3(R * Math.cos(a), 0.045 * Math.sin(tw), R * Math.sin(a));
      };
      const m = new THREE.Mesh(sweep(circle(0.048, 18), path, { segments: 900 }), S(finish));
      g.add(m);
    }
    g.rotation.x = Math.PI / 2; g.position.y = 1.0;
    const wrap = new THREE.Group(); wrap.add(g);
    return wrap;
  },

  'cable-chain'(finish) {
    const g = new THREE.Group();
    const path = teardrop(1, 1.3);
    g.add(cableChain(path, finish, { links: 150 }));
    const clasp = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 12, 40), S(finish));
    clasp.rotation.x = Math.PI / 2; clasp.position.copy(path(0.5)).add(V3(0, 0.012, 0));
    g.add(clasp);
    g.position.y = 0.02;
    return g;
  },

  'infinity-pendant'(finish) {
    const g = new THREE.Group();
    const path = teardrop(1, 1.25);
    g.add(snakeChain(path, finish, 0.018));
    const lem = (t) => {
      const a = t * TAU, d = 1 + Math.sin(a) ** 2;
      return V3((0.36 * Math.cos(a)) / d, 0.035 * Math.sin(a), (0.36 * Math.sin(a) * Math.cos(a)) / d);
    };
    const inf = new THREE.Mesh(sweep(superellipse(0.05, 0.025, 3, 32), lem, { segments: 300 }), S(finish));
    const bottom = path(0);
    inf.position.copy(bottom).add(V3(0, 0.05, 0.22));
    g.add(inf);
    const b = bail(finish, 0.035); b.position.copy(bottom).add(V3(0, 0.03, 0.03)); b.rotation.y = Math.PI / 2;
    g.add(b);
    g.position.y = 0.03;
    return g;
  },

  'compass-medallion'(finish) {
    const g = new THREE.Group();
    const path = teardrop(0.95, 1.2);
    g.add(cableChain(path, finish, { links: 170, len: 0.06, wire: 0.009 }));
    const med = disc(0.34, 0.05, finish, 'compass');
    const bottom = path(0);
    med.position.copy(bottom).add(V3(0, 0.035, 0.4));
    g.add(med);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 20, 120), S(finish));
    rim.rotation.x = Math.PI / 2; rim.position.copy(med.position);
    g.add(rim);
    const b = bail(finish, 0.045); b.position.copy(bottom).add(V3(0, 0.03, 0.04)); b.rotation.y = Math.PI / 2;
    g.add(b);
    g.position.y = 0.0;
    return g;
  },

  'luna-hoops'(finish) {
    const g = new THREE.Group();
    const geo = new THREE.TorusGeometry(0.62, 0.06, 32, 160, TAU * 0.965);
    const a = new THREE.Mesh(geo, S(finish));
    a.position.set(-0.32, 0.68, 0); a.rotation.set(0, 0.35, 1.9);
    const b = new THREE.Mesh(geo, S(finish));
    b.position.set(0.42, 0.06, 0.25); b.rotation.set(Math.PI / 2, 0, 0.6);
    g.add(a, b);
    return g;
  },

  'pearl-drop'(finish) {
    const g = new THREE.Group();
    const one = () => {
      const e = new THREE.Group();
      e.add(tube([[0, 0.36, 0], [0.02, 0.6, 0], [0.16, 0.78, 0], [0.32, 0.7, 0], [0.34, 0.5, 0], [0.3, 0.32, 0]], 0.016, finish));
      const cap = new THREE.Mesh(lathe([[0, 0.38], [0.05, 0.37], [0.09, 0.32], [0.1, 0.28], [0.0, 0.29]], 64), S(finish));
      e.add(cap);
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 64, 48), pearlMaterial());
      pearl.position.y = 0.14;
      e.add(pearl);
      return e;
    };
    const a = one(); a.position.set(-0.28, 0.0, 0); a.rotation.set(0, 0.2, 0.08);
    const b = one(); b.position.set(0.32, -0.02, 0.15); b.rotation.set(0, -0.5, -0.12);
    a.position.y = 0.01; b.position.y = 0.01;
    g.add(a, b);
    g.scale.setScalar(1.6);
    return g;
  },

  'starlight-studs'(finish) {
    const g = new THREE.Group();
    const one = () => {
      const s = new THREE.Group();
      const st = brilliant(0.22); s.add(st);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + Math.PI / 4;
        s.add(tube([[Math.cos(a) * 0.05, -0.16, Math.sin(a) * 0.05], [Math.cos(a) * 0.2, -0.04, Math.sin(a) * 0.2], [Math.cos(a) * 0.19, 0.06, Math.sin(a) * 0.19]], 0.02, finish));
      }
      const basket = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 12, 48), S(finish));
      basket.rotation.x = Math.PI / 2; basket.position.y = -0.08; s.add(basket);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 16), S(finish));
      post.position.y = -0.36; s.add(post);
      return s;
    };
    const a = one(); a.rotation.set(0.25, 0, 0.1); a.position.set(-0.3, 0.6, 0);
    const b = one(); b.rotation.set(-Math.PI / 2 + 0.35, 0, 0.9); b.position.set(0.36, 0.2, 0.2);
    g.add(a, b);
    g.scale.setScalar(1.5);
    return g;
  },

  'atlas-cuff'(finish) {
    const g = new THREE.Group();
    const start = 0.62, span = 0.84;
    const path = (t) => { const a = (start + t * span) * TAU; return V3(1.0 * Math.cos(a), 0, 0.82 * Math.sin(a)); };
    const geo = sweep(superellipse(0.05, 0.36, 5, 56), path, {
      segments: 260, closed: false,
      scale: (t) => { const [s] = taper(0.035)(t); const w = 0.62 + 0.38 * Math.sin(t * Math.PI); return [Math.max(s, 0.001) ** 0.6 * 1, s * w]; },
    });
    const m = new THREE.Mesh(geo, S(finish));
    m.rotation.x = 0.0;
    g.add(m);
    g.rotation.z = Math.PI / 2 * 0; g.position.y = 0.36;
    return g;
  },

  'orbit-beads'(finish) {
    const g = new THREE.Group();
    const n = 26, R = 0.95;
    const geo = new THREE.SphereGeometry(0.105, 48, 32);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const m = new THREE.Mesh(geo, S(finish));
      m.position.set(R * Math.cos(a), 0.105, R * Math.sin(a));
      g.add(m);
    }
    const tag = disc(0.14, 0.03, finish, 'monogram');
    tag.position.set(R + 0.2, 0.02, 0); g.add(tag);
    const jr = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 12, 40), S(finish));
    jr.position.set(R + 0.07, 0.02, 0); jr.rotation.x = Math.PI / 2; g.add(jr);
    return g;
  },

  'wave-bangle'(finish) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(sweep(superellipse(0.07, 0.07, 2.4, 28), ringPath(1.0, (a) => 0.09 * Math.sin(a * 3)), { segments: 300 }), S(finish));
    m.rotation.x = 0.22; m.position.y = 0.32;
    const m2 = new THREE.Mesh(sweep(superellipse(0.05, 0.05, 2, 24), ringPath(0.98, (a) => 0.07 * Math.sin(a * 3 + Math.PI)), { segments: 300 }), S(finish));
    m2.rotation.x = -0.35; m2.rotation.z = 0.2; m2.position.set(0.25, 0.3, 0.1);
    g.add(m, m2);
    return g;
  },

  'monogram-cufflinks'(finish) {
    const g = new THREE.Group();
    const one = () => {
      const c = new THREE.Group();
      const face = disc(0.32, 0.07, finish, 'monogram');
      c.add(face);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.022, 16, 96), S(finish));
      rim.rotation.x = Math.PI / 2; c.add(rim);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 20), S(finish));
      post.position.y = -0.2; c.add(post);
      const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.32, 8, 24), S(finish));
      bar.rotation.z = Math.PI / 2; bar.position.y = -0.38; c.add(bar);
      return c;
    };
    const a = one(); a.position.set(-0.36, 0.43, 0); a.rotation.set(-0.15, 0, 0);
    const b = one(); b.position.set(0.42, 0.08, 0.3); b.rotation.set(Math.PI / 2 - 0.1, 0, 0.6);
    g.add(a, b);
    return g;
  },

  'eagle-coin'(finish) {
    const g = new THREE.Group();
    const c = disc(1, 0.11, finish, 'coin', 180);
    c.position.y = 0.92; c.rotation.x = Math.PI / 2 - 0.12;
    const c2 = disc(1, 0.11, finish, 'coin', 180);
    c2.position.set(0.9, 0.056, 0.5); c2.rotation.y = 0.6;
    g.add(c, c2);
    return g;
  },

  'cast-bar'(finish) {
    const g = new THREE.Group();
    const W = 1.7, H = 0.95, r = 0.12;
    const s = new THREE.Shape();
    s.moveTo(-W / 2 + r, -H / 2); s.lineTo(W / 2 - r, -H / 2); s.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + r);
    s.lineTo(W / 2, H / 2 - r); s.quadraticCurveTo(W / 2, H / 2, W / 2 - r, H / 2); s.lineTo(-W / 2 + r, H / 2);
    s.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - r); s.lineTo(-W / 2, -H / 2 + r); s.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + r, -H / 2);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 8, curveSegments: 24 });
    const tex = canvasTexture(1024, 576, (ctx, w, h) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeRect(46, 40, w - 92, h - 80);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '600 70px serif'; ctx.fillText('SILVER SHOP', w / 2, 150);
      ctx.font = '700 150px serif'; ctx.fillText('100 g', w / 2, 320);
      ctx.font = '500 44px sans-serif'; ctx.fillText('FINE SILVER  999.9', w / 2, 410);
      ctx.font = '400 34px monospace'; ctx.fillText('Nº  SS 0 2 6 4 1 8', w / 2, 480);
    });
    tex.repeat.set(1 / W, 1 / H); tex.offset.set(0.5, 0.5);
    const top = S(finish, { bumpMap: tex, bumpScale: 2 });
    const bar = new THREE.Mesh(geo, [top, S(finish)]);
    bar.rotation.x = -Math.PI / 2; bar.position.y = 0.06;
    g.add(bar);
    const bar2 = new THREE.Mesh(geo, [S(finish, { bumpMap: tex, bumpScale: 2 }), S(finish)]);
    bar2.rotation.set(-Math.PI / 2, 0, 0.22); bar2.position.set(0.25, 0.34, -0.55);
    g.add(bar2);
    return g;
  },

  'nocturne-candlestick'(finish) {
    const g = new THREE.Group();
    const prof = [[0, 0], [0.62, 0], [0.64, 0.03], [0.6, 0.07], [0.42, 0.12], [0.2, 0.2], [0.13, 0.34], [0.11, 0.6], [0.16, 0.72], [0.11, 0.84], [0.09, 1.4], [0.15, 1.5], [0.1, 1.58], [0.1, 1.9], [0.36, 2.02], [0.4, 2.06], [0.36, 2.09], [0.15, 2.08], [0.15, 2.0], [0, 2.0]];
    g.add(new THREE.Mesh(lathe(smoothProfile(prof), 160), S(finish)));
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.3, 48), new THREE.MeshPhysicalMaterial({ color: 0xfbfaf6, roughness: 0.55, sheen: 0.5 }));
    candle.position.y = 2.0 + 0.65; g.add(candle);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    wick.position.y = 3.34; g.add(wick);
    return g;
  },

  'cascade-goblet'(finish) {
    const g = new THREE.Group();
    const prof = [[0, 0], [0.5, 0], [0.52, 0.03], [0.48, 0.06], [0.2, 0.12], [0.07, 0.25], [0.06, 0.7], [0.1, 0.8], [0.06, 0.88], [0.12, 1.0], [0.38, 1.18], [0.52, 1.5], [0.56, 1.95], [0.58, 2.0], [0.555, 2.0], [0.53, 1.95], [0.49, 1.52], [0.35, 1.22], [0.0, 1.08]];
    g.add(new THREE.Mesh(lathe(smoothProfile(prof), 160), S(finish)));
    return g;
  },

  'orb-vase'(finish) {
    const g = new THREE.Group();
    const prof = [[0, 0], [0.22, 0], [0.24, 0.02]];
    for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + (i / 24) * Math.PI * 0.86; prof.push([Math.cos(a) * 0.62, 0.64 + Math.sin(a) * 0.62]); }
    prof.push([0.1, 1.38], [0.09, 1.6], [0.13, 1.7], [0.14, 1.73], [0.11, 1.73], [0.07, 1.62], [0.07, 1.4], [0, 1.3]);
    const m = new THREE.Mesh(lathe(smoothProfile(prof.map(([x, y]) => [Math.max(x, 0), y])), 160), S(finish));
    g.add(m);
    const stem = tube([[0, 1.5, 0], [0.03, 2.0, 0.02], [0.12, 2.5, 0.05], [0.28, 2.85, 0.08]], 0.012, finish);
    stem.material = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.6 });
    g.add(stem);
    return g;
  },

  'care-kit'(finish) {
    const g = new THREE.Group();
    const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.32, 128), S('brushed'));
    tin.position.y = 0.16; g.add(tin);
    const lid = disc(0.645, 0.12, finish, 'lid');
    lid.position.y = 0.36; g.add(lid);
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1, 40, 40), new THREE.MeshPhysicalMaterial({ color: 0x141414, roughness: 0.95, sheen: 1, sheenColor: 0x555555, side: THREE.DoubleSide }));
    const p = cloth.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, 0.025 * Math.sin(p.getX(i) * 9) * Math.cos(p.getY(i) * 7));
    cloth.geometry.computeVertexNormals();
    cloth.rotation.x = -Math.PI / 2; cloth.rotation.z = 0.5; cloth.position.set(0.55, 0.01, 0.35); g.add(cloth);
    tin.position.x = -0.1; lid.position.x = -0.1;
    return g;
  },
};

function smoothProfile(pts) {
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => V2(x, y)));
  return curve.getSpacedPoints(Math.max(120, pts.length * 12)).map((v) => [v.x, v.y]);
}

/* Camera views per product: [azimuth°, elevation°, zoom]. */
export const VIEWS = {
  default: [[28, 14, 1], [-38, 42, 1.08], [70, 4, 1.25]],
  'aura-band': [[22, 10, 1], [-30, 44, 1.05], [80, 2, 1.35]],
  'orbit-signet': [[18, 16, 1], [-34, 50, 1.05], [0, 80, 1.2]],
  'halo-solitaire': [[24, 14, 1], [-40, 34, 1.05], [10, 62, 1.6]],
  'twist-rope': [[24, 12, 1], [-36, 46, 1.05], [80, 4, 1.4]],
  'cable-chain': [[0, 56, 1.12], [30, 34, 1.05], [5, 22, 2.2]],
  'infinity-pendant': [[0, 54, 1], [24, 30, 1.05], [0, 34, 2.4]],
  'compass-medallion': [[0, 56, 1], [-24, 34, 1.05], [0, 48, 2.3]],
  'luna-hoops': [[16, 14, 1], [-36, 40, 1.05], [70, 16, 1.4]],
  'pearl-drop': [[10, 12, 1], [-40, 30, 1.05], [40, 10, 1.5]],
  'starlight-studs': [[12, 18, 1], [-36, 38, 1.05], [10, 36, 1.7]],
  'atlas-cuff': [[180, 18, 1], [140, 44, 1.05], [215, 8, 1.3]],
  'orbit-beads': [[0, 40, 1], [30, 60, 1.05], [80, 18, 1.8]],
  'wave-bangle': [[10, 28, 1], [-36, 52, 1.05], [70, 10, 1.3]],
  'monogram-cufflinks': [[12, 18, 1], [-34, 44, 1.05], [0, 30, 1.6]],
  'eagle-coin': [[10, 12, 1], [-34, 40, 1.05], [0, 18, 1.5]],
  'cast-bar': [[16, 40, 1], [-30, 58, 1.05], [10, 30, 1.5]],
  'nocturne-candlestick': [[20, 8, 1], [-30, 26, 1.05], [10, 10, 1.6]],
  'cascade-goblet': [[20, 8, 1], [-30, 30, 1.05], [10, 50, 1.4]],
  'orb-vase': [[20, 8, 1], [-30, 26, 1.05], [10, 14, 1.4]],
  'care-kit': [[14, 36, 1], [-30, 52, 1.05], [0, 70, 1.4]],
};

export function buildModel(id, finish = 'polished') {
  const build = BUILDERS[id];
  if (!build) throw new Error('Unknown model ' + id);
  const root = new THREE.Group();
  const m = build(finish);
  root.add(m);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  return root;
}

export const MODEL_IDS = Object.keys(BUILDERS);

/** Frame a camera on an object. */
export function frame(camera, object, az = 25, el = 15, zoom = 1, padding = 1.12) {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (sphere.radius * padding) / Math.sin(fov / 2) / zoom;
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  const target = sphere.center.clone();
  camera.position.set(target.x + dist * Math.cos(e) * Math.sin(a), target.y + dist * Math.sin(e), target.z + dist * Math.cos(e) * Math.cos(a));
  camera.lookAt(target);
  camera.near = dist / 50; camera.far = dist * 50;
  camera.updateProjectionMatrix();
  return { target, dist, box };
}

/** Standard studio: renderer settings, env, soft shadow catcher. */
export function createStudio(renderer, { shadow = true } = {}) {
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (shadow) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap; }
  const scene = new THREE.Scene();
  scene.environment = createStudioEnvironment(renderer);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(1.5, 8, 2.5);
  if (shadow) {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 14; key.shadow.blurSamples = 24;
    key.shadow.bias = -0.0005;
    const c = key.shadow.camera; c.left = -4; c.right = 4; c.top = 4; c.bottom = -4; c.near = 0.5; c.far = 20;
  }
  scene.add(key);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  return { scene, key, ground };
}
