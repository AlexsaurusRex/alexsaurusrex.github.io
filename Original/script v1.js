// sample https://threejs.org/examples/css3d_sprites.html

// scene setup
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('bg-canvas').appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.z = 1000;

// wireframe material
const material = new THREE.MeshBasicMaterial({
  color: 0x4dd0b1,
  wireframe: true,
  transparent: true,
  opacity: 0.3
});

// create spheres
const spheres = [];
const count = 300;

for (let i = 0; i < count; i++) {
  const geometry = new THREE.SphereGeometry(15, 16, 16);
  const mesh = new THREE.Mesh(geometry, material);

  const x = Math.random() * 4000 - 2000;
  const y = Math.random() * 4000 - 2000;
  const z = Math.random() * 2000 - 1000;

  mesh.position.set(x, y, z);
  mesh.userData.baseX = x;
  mesh.userData.baseY = y;
  mesh.userData.baseZ = z;

  scene.add(mesh);
  spheres.push(mesh);
}

// formation targets
function getRandomPositions() {
  return spheres.map(() => ({
    x: Math.random() * 4000 - 2000,
    y: Math.random() * 4000 - 2000,
    z: Math.random() * 2000 - 1000
  }));
}

// Fibonacci sphere distribution
function getFibonacciSpherePositions(radius = 600) {
  const positions = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    positions.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius
    });
  }
  return positions;
}

function getGridCubePositions(size = 600, divisions = 6) {
  const positions = [];
  const step = size / divisions;

  for (let x = 0; x <= divisions; x++) {
    for (let y = 0; y <= divisions; y++) {
      for (let z = 0; z <= divisions; z++) {
        positions.push({
          x: (x * step) - size / 2,
          y: (y * step) - size / 2,
          z: ((z * step) - size / 2) * 0.2
        });
      }
    }
  }

  // instead of piling at center, distribute extras randomly within the cube
  while (positions.length < count) {
    positions.push({
      x: (Math.random() * size) - size / 2,
      y: (Math.random() * size) - size / 2,
      z: (Math.random() * size * 0.2) - size * 0.1
    });
  }

  return positions.slice(0, count);
}

// Torus knot formation
function getTorusPositions(radius = 400, tube = 100) {
  const positions = [];
  const tempGeometry = new THREE.TorusGeometry(radius, tube, 20, 100);
  const positionAttribute = tempGeometry.attributes.position;

  for (let i = 0; i < count; i++) {
    const index = Math.floor((i / count) * positionAttribute.count);
    positions.push({
      x: positionAttribute.getX(index),
      y: positionAttribute.getY(index),
      z: positionAttribute.getZ(index)
    });
  }

  tempGeometry.dispose();
  return positions;
}

// Burst formation
function getBurstPositions(radius = 600) {
  const positions = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.pow(Math.random(), 0.5) * radius;

    positions.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    });
  }

  return positions;
}

//Vortex formation
function getVortexPositions(radius = 400, height = 600) {
  const positions = [];

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 * 6;
    const r = radius * (1 - t);

    positions.push({
      x: Math.cos(angle) * r,
      y: (t * height) - height / 2,
      z: Math.sin(angle) * r
    });
  }

  return positions;
}

// transition to a formation
function transitionTo(positions) {
  spheres.forEach((sphere, i) => {
    gsap.to(sphere.userData, {
      baseX: positions[i].x,
      baseY: positions[i].y,
      baseZ: positions[i].z,
      duration: 1,
      ease: 'power2.inOut'
    });
  });
}

// Transition camera perspective
function transitionCamera(x, y, z) {
  gsap.to(camera.position, {
    x: x,
    y: y,
    z: z,
    duration: 1,
    ease: 'power2.inOut'
  });
}

// Section animation formations
const formations = {
  hero: getVortexPositions(),
  expertise: getFibonacciSpherePositions(),
  work: getGridCubePositions(),
  contact: getTorusPositions(), 
  dog: getRandomPositions()
};

// Camera positions for each section
const cameraPositions = {
  hero:      { x: 0,   y: 500,   z: 2000 },
  expertise: { x: 0,   y: 0,   z: 1200 },
  work:      { x: 0,   y: -500,   z: 2000 },
  contact:   { x: 0,   y: 0,   z: 2000 },
  dog:       { x: 0,   y: 0,   z: 1000 }
};

// intersection observer
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      if (formations[id]) {
        transitionTo(formations[id]);
        const cam = cameraPositions[id];
        transitionCamera(cam.x, cam.y, cam.z);
      }
    }
  });
}, { threshold: 0.2 });

sections.forEach(section => observer.observe(section));

// Animation
const driftOffsets = spheres.map(() => ({ x: 0, y: 0 }));

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.001;

  spheres.forEach((sphere, i) => {
    driftOffsets[i].x = Math.cos(time + i * 0.15) * 20;
    driftOffsets[i].y = Math.sin(time + i * 0.1) * 20;

    sphere.position.x = sphere.userData.baseX + driftOffsets[i].x;
    sphere.position.y = sphere.userData.baseY + driftOffsets[i].y;

    sphere.rotation.x += 0.002;
    sphere.rotation.y += 0.003;
    sphere.scale.setScalar(1 + Math.sin(time * 50 + i * 0.5) * 0.5);
  });

  renderer.render(scene, camera);
}

animate();

// handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});