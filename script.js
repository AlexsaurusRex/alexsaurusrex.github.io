// Scene setup
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('bg-canvas').appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.z = 1000;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Wireframe material
const material = new THREE.MeshBasicMaterial({
  color: 0x4dd0b1,
  wireframe: true,
  transparent: true,
  opacity: 0.3
});

// Create spheres, seeded to hero formation
const spheres = [];
const count = 300;

for (let i = 0; i < count; i++) {
  const geometry = new THREE.SphereGeometry(15, 16, 16);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(
    FORMATIONS.hero[i].x,
    FORMATIONS.hero[i].y,
    FORMATIONS.hero[i].z
  );

  scene.add(mesh);
  spheres.push(mesh);
}

// Section order — must match DOM order
const SECTION_KEYS = ['hero', 'expertise', 'work', 'contact', 'dog'];

// Camera positions for each section
const CAMERA_POSITIONS = [
  { x: 0, y: 300,  z: 2200 },  // hero
  { x: 0, y: -1000, z: 5000 },  // expertise
  { x: 0, y: -600, z: 3000 },  // work
  { x: 0, y: 0,    z: 750 },  // contact
  { x: 0, y: 0,    z: 3000 }   // dog
];


// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Get scroll progress as section index + fraction
function getScrollState() {
  const nav = document.querySelector('nav');
  const offset = nav ? nav.offsetHeight : 0;
  const scrollY = Math.max(0, window.scrollY - offset);
  const sectionHeight = window.innerHeight;
  const totalSections = SECTION_KEYS.length;

  const raw = scrollY / sectionHeight;
  const index = Math.min(Math.floor(raw), totalSections - 2);
  const t = Math.min(Math.max(raw - index, 0), 1);

  return { index, t };
}

const driftOffsets = spheres.map(() => ({ x: 0, y: 0 }));

let time = 0;

function getFormationPos(sectionKey, formation, i) {
  const p = formation[i];
  if (sectionKey === 'work') {
    return { x: p.x, y: p.z, z: -p.y };
  }
  return p;
}

function animate() {
  requestAnimationFrame(animate);
  time += 0.001;

  const { index, t } = getScrollState();

  const fromFormation = FORMATIONS[SECTION_KEYS[index]];
  const toFormation = FORMATIONS[SECTION_KEYS[index + 1]];
  const fromCam = CAMERA_POSITIONS[index];
  const toCam = CAMERA_POSITIONS[index + 1];

  // Interpolate camera
  camera.position.x = lerp(fromCam.x, toCam.x, t);
  camera.position.y = lerp(fromCam.y, toCam.y, t);
  camera.position.z = lerp(fromCam.z, toCam.z, t);

  const flipSections = ['hero'];

  spheres.forEach((sphere, i) => {
    const fromPos = getFormationPos(SECTION_KEYS[index],     fromFormation, i);
    const toPos   = getFormationPos(SECTION_KEYS[index + 1], toFormation,   i);

    const fromY = flipSections.includes(SECTION_KEYS[index])     ? -fromPos.y : fromPos.y;
    const toY   = flipSections.includes(SECTION_KEYS[index + 1]) ? -toPos.y   : toPos.y;

    const baseX = lerp(fromPos.x, toPos.x, t);
    const baseY = lerp(fromY, toY, t);
    const baseZ = lerp(fromPos.z, toPos.z, t);

    driftOffsets[i].x = Math.cos(time + i * 0.15) * 20;
    driftOffsets[i].y = Math.sin(time + i * 0.1) * 20;

    sphere.position.x = baseX + driftOffsets[i].x;
    sphere.position.y = baseY + driftOffsets[i].y;
    sphere.position.z = baseZ;

    sphere.rotation.x += 0.002;
    sphere.rotation.y += 0.003;
    sphere.scale.setScalar(1 + Math.sin(time * 50 + i * 0.5) * 0.5);
  });

  renderer.render(scene, camera);
}

//Vortex "drain" position
function getFormationPos(sectionKey, formation, i) {
  const p = formation[i];
  if (sectionKey === 'work') {
    // Rotate 45° around X axis
    const cos45 = -Math.SQRT1_2; // 0.707...
    const sin45 = -Math.SQRT1_2;
    return {
      x: p.x,
      y: p.y * cos45 - p.z * sin45,
      z: p.y * sin45 + p.z * cos45
    };
  }
  return p;
}

animate();

// Smooth nav scrolling
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const targetY = targetSection.offsetTop;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 500; // ms — adjust this to taste
    let startTime = null;

    function scrollStep(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease in-out
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) requestAnimationFrame(scrollStep);
    }

// Smooth button scrolling
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = btn.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const targetY = targetSection.offsetTop;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 300; // ms — adjust this to taste
    let startTime = null;

    function scrollStep(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) requestAnimationFrame(scrollStep);
    }

    requestAnimationFrame(scrollStep);
  });
});

    requestAnimationFrame(scrollStep);
  });
});