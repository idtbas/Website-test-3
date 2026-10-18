/* Interactive 3D product viewer: drag to orbit (with inertia), scroll / pinch to zoom, idle auto-rotate. */
import * as THREE from 'three';
import { buildModel, createStudio, frame, setFinish, VIEWS } from './models.js';

export function createViewer(host, id, finish = 'polished') {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const { scene } = createStudio(renderer);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.01, 100);
  const model = buildModel(id, finish);
  scene.add(model);

  const [az0, el0] = (VIEWS[id] || VIEWS.default)[0];
  const { target, dist } = frame(camera, model, az0, el0, 1);
  let az = THREE.MathUtils.degToRad(az0), el = THREE.MathUtils.degToRad(el0), r = dist;
  let vAz = 0, vEl = 0, drag = null, idle = 0, running = true;
  const pointers = new Map();

  const place = () => {
    el = THREE.MathUtils.clamp(el, 0.02, 1.45);
    r = THREE.MathUtils.clamp(r, dist * 0.45, dist * 1.6);
    camera.position.set(target.x + r * Math.cos(el) * Math.sin(az), target.y + r * Math.sin(el), target.z + r * Math.cos(el) * Math.cos(az));
    camera.lookAt(target);
  };
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host); resize();

  const el2 = renderer.domElement;
  el2.style.touchAction = 'none';
  el2.addEventListener('pointerdown', (e) => { pointers.set(e.pointerId, e); el2.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; idle = 0; host.dispatchEvent(new Event('interact')); });
  el2.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pointers.set(e.pointerId, e);
      const [c, d] = [...pointers.values()];
      const d1 = Math.hypot(c.clientX - d.clientX, c.clientY - d.clientY);
      r *= d0 / d1; return;
    }
    pointers.set(e.pointerId, e);
    vAz = -(e.clientX - drag.x) * 0.008; vEl = (e.clientY - drag.y) * 0.006;
    az += vAz; el += vEl; drag = { x: e.clientX, y: e.clientY };
  });
  const up = (e) => { pointers.delete(e.pointerId); if (!pointers.size) drag = null; };
  el2.addEventListener('pointerup', up); el2.addEventListener('pointercancel', up);
  el2.addEventListener('wheel', (e) => { e.preventDefault(); r *= 1 + e.deltaY * 0.001; idle = 0; }, { passive: false });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
  const loop = () => {
    if (!running) return;
    requestAnimationFrame(loop);
    if (!visible || host.closest('.stage:not(.is-3d)')) return;
    if (!drag) {
      vAz *= 0.94; vEl *= 0.9; az += vAz; el += vEl;
      if (++idle > 120) az += 0.004;
    }
    place();
    renderer.render(scene, camera);
  };
  place(); loop();

  return {
    setFinish: (f) => setFinish(model, f),
    reset: () => { az = THREE.MathUtils.degToRad(az0); el = THREE.MathUtils.degToRad(el0); r = dist; },
    dispose: () => { running = false; renderer.dispose(); },
  };
}
