import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = $("menu-toggle");
const nav = $("main-nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

const BOND_TYPES = ["x", "y", "z"];
const BOND_COLORS = { x: 0x75a9ff, y: 0xe8b878, z: 0x58e0d1 };

// Draw a finite, regular honeycomb patch. Every A site has three nearest
// neighbours in the bulk, one for each Kitaev bond family.
function createLattice(container, options = {}) {
  if (!container) return null;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(options.background ?? 0x0b1523);
  const camera = new THREE.OrthographicCamera(-7, 7, 5, -5, 0.1, 100);
  camera.position.set(0, 0, 20);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xb8d9ef, 1.2));
  const keyLight = new THREE.PointLight(0x62e8dc, 25, 30);
  keyLight.position.set(-2, 4, 8);
  scene.add(keyLight);

  const group = new THREE.Group();
  scene.add(group);
  const radius = options.radius ?? 2;
  const unitA = new THREE.Vector2(Math.sqrt(3) / 2, 1.5);
  const unitB = new THREE.Vector2(-Math.sqrt(3) / 2, 1.5);
  const basisOffset = new THREE.Vector2(0, 1);
  const cells = new Map();
  const bonds = { x: [], y: [], z: [] };
  const sites = [];

  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) > radius) continue;
      const a2 = unitA.clone().multiplyScalar(q).addScaledVector(unitB, r);
      a2.y -= 0.5;
      const b2 = a2.clone().add(basisOffset);
      const a = new THREE.Vector3(a2.x, a2.y, 0);
      const b = new THREE.Vector3(b2.x, b2.y, 0);
      cells.set(`${q},${r}`, { a, b });
      sites.push({ point: a, sublattice: "A" }, { point: b, sublattice: "B" });
    }
  }

  const getCell = (q, r) => cells.get(`${q},${r}`);
  const bondDefinitions = [
    { type: "z", dq: 0, dr: 0 },
    { type: "x", dq: -1, dr: 0 },
    { type: "y", dq: 0, dr: -1 }
  ];
  const bondsGroup = new THREE.Group();
  const pulsesGroup = new THREE.Group();
  group.add(bondsGroup, pulsesGroup);

  for (const [key, cell] of cells) {
    const [cellQ, cellR] = key.split(",").map(Number);
    for (const definition of bondDefinitions) {
      const neighbour = getCell(cellQ + definition.dq, cellR + definition.dr);
      if (!neighbour) continue;

      const start = cell.a;
      const end = neighbour.b;
      const direction = end.clone().sub(start);
      const length = direction.length();
      const material = new THREE.MeshStandardMaterial({
        color: BOND_COLORS[definition.type],
        emissive: BOND_COLORS[definition.type],
        emissiveIntensity: 0.24,
        roughness: 0.38,
        transparent: true,
        opacity: 0.86
      });
      const bond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, length, 8),
        material
      );
      bond.position.copy(start).add(end).multiplyScalar(0.5);
      bond.position.z = 0;
      bond.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
      );
      bondsGroup.add(bond);

      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: BOND_COLORS[definition.type],
        transparent: true,
        opacity: 0.72
      });
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 8),
        pulseMaterial
      );
      pulse.position.z = 0.075;
      pulsesGroup.add(pulse);
      bonds[definition.type].push({ mesh: bond, start, end, pulse });
    }
  }

  const siteGeometry = new THREE.SphereGeometry(0.09, 16, 12);
  const siteMaterials = {
    A: new THREE.MeshStandardMaterial({
      color: 0xf0f7ff, emissive: 0x263d55, roughness: 0.32
    }),
    B: new THREE.MeshStandardMaterial({
      color: 0x8ca9c8, emissive: 0x142b43, roughness: 0.38
    })
  };
  for (const site of sites) {
    const mesh = new THREE.Mesh(siteGeometry, siteMaterials[site.sublattice]);
    mesh.position.copy(site.point);
    mesh.position.z = 0.055;
    group.add(mesh);
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enablePan = Boolean(options.enablePan);
  controls.enableZoom = Boolean(options.enableZoom);
  if (options.enablePan) {
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  }
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minZoom = 0.65;
  controls.maxZoom = 2.5;
  controls.target.set(0, 0, 0);

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const halfHeight = radius * 1.5 + 1.8;
    const halfWidth = Math.max(radius * Math.sqrt(3) + 1.2, halfHeight * aspect);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  let frame;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animate(time) {
    frame = requestAnimationFrame(animate);
    const seconds = time * 0.001;
    for (const type of BOND_TYPES) {
      for (const [index, bond] of bonds[type].entries()) {
        const progress = reducedMotion
          ? 0.5
          : (seconds * 0.22 + index * 0.37 + BOND_TYPES.indexOf(type) / 3) % 1;
        bond.pulse.position.lerpVectors(bond.start, bond.end, progress);
        bond.pulse.position.z = 0.075;
      }
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate(0);

  return {
    setCouplings(values) {
      for (const type of BOND_TYPES) {
        const value = Math.max(0, Math.min(2, Number(values[type] ?? 1)));
        const strength = value / 2;
        for (const bond of bonds[type]) {
          bond.mesh.material.opacity = 0.16 + 0.72 * strength;
          const thickness = 0.7 + 0.3 * strength;
          bond.mesh.scale.set(thickness, 1, thickness);
          bond.pulse.visible = strength > 0.02;
        }
      }
    },
    reset() {
      controls.reset();
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      controls.update();
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    }
  };
}

const hero = createLattice($("hero-canvas"), {
  radius: 2,
  enableZoom: false,
  background: 0x080d18
});
const lab = createLattice($("lab-canvas"), {
  radius: 3,
  enableZoom: true,
  enablePan: true,
  background: 0x0b1523
});

function updateLab() {
  const values = {
    x: Number($("jx").value),
    y: Number($("jy").value),
    z: Number($("jz").value)
  };
  $("jx-out").value = values.x.toFixed(2);
  $("jy-out").value = values.y.toFixed(2);
  $("jz-out").value = values.z.toFixed(2);
  $("lab-state").textContent = `J = (${values.x.toFixed(2)}, ${values.y.toFixed(2)}, ${values.z.toFixed(2)})`;
  lab?.setCouplings(values);
}

["jx", "jy", "jz"].forEach(id => $(id).addEventListener("input", updateLab));
$("reset-lab").addEventListener("click", () => {
  $("jx").value = $("jy").value = $("jz").value = 1;
  updateLab();
  lab?.reset();
});
updateLab();

// Graceful note when WebGL is unavailable.
if (!window.WebGLRenderingContext) {
  document.querySelectorAll(".lab-canvas,.hero-canvas").forEach(el => {
    el.innerHTML = '<p style="padding:2rem;color:#9aabba">This interactive visualization requires WebGL in your browser.</p>';
  });
}
