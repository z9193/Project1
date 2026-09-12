import * as THREE from 'three';
import { projects } from './projects.js';

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function makeAsteroidGeometry() {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const scale = 0.72 + Math.random() * 0.55;
    position.setXYZ(
      i,
      position.getX(i) * scale,
      position.getY(i) * scale,
      position.getZ(i) * scale
    );
  }
  geometry.computeVertexNormals();
  return new THREE.EdgesGeometry(geometry);
}

function makeCoverTexture(project) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = project.accent;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 18; i += 1) {
    ctx.strokeStyle = project.color;
    ctx.globalAlpha = 0.12 + Math.random() * 0.25;
    ctx.lineWidth = 2 + Math.random() * 8;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 40 + Math.random() * 280;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = project.color;
  ctx.fillRect(48, 48, canvas.width - 96, 18);

  ctx.font = '28px "Press Start 2P", monospace';
  ctx.fillStyle = project.color;
  wrapText(ctx, project.title.toUpperCase(), 72, 220, canvas.width - 144, 48);

  ctx.font = '22px "Press Start 2P", monospace';
  ctx.fillText(project.year, 72, canvas.height - 90);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

export function createWorld(canvas, handlers) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x161616, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x161616, 0.046);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0.4, 14);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0x3ad7c8, 1.1);
  key.position.set(6, 8, 10);
  scene.add(key);

  const asteroidGroup = new THREE.Group();
  scene.add(asteroidGroup);
  const asteroidMat = new THREE.LineBasicMaterial({ color: 0xdedede, transparent: true, opacity: 0.85 });
  const asteroids = [];

  for (let i = 0; i < 28; i += 1) {
    const mesh = new THREE.LineSegments(makeAsteroidGeometry(), asteroidMat);
    const scale = randomInRange(0.35, 2.4);
    mesh.scale.setScalar(scale);
    mesh.position.set(randomInRange(-18, 18), randomInRange(-10, 10), randomInRange(-22, 8));
    mesh.userData = {
      spin: new THREE.Vector3(randomInRange(-0.4, 0.4), randomInRange(-0.6, 0.6), randomInRange(-0.3, 0.3))
    };
    asteroidGroup.add(mesh);
    asteroids.push(mesh);
  }

  const galleryGroup = new THREE.Group();
  scene.add(galleryGroup);
  const frames = [];

  projects.forEach((project, index) => {
    const angle = (index / projects.length) * Math.PI * 2;
    const radius = 7.4;
    const texture = makeCoverTexture(project);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.08,
      emissive: new THREE.Color(project.color),
      emissiveIntensity: 0.08
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.75), material);
    mesh.position.set(Math.cos(angle) * radius, Math.sin(index * 1.7) * 1.6, Math.sin(angle) * radius - 2);
    mesh.lookAt(0, 0, 8);
    mesh.userData.projectId = project.id;
    galleryGroup.add(mesh);
    frames.push(mesh);

    const rim = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.28, 2.83)),
      new THREE.LineBasicMaterial({ color: project.color })
    );
    rim.position.copy(mesh.position);
    rim.quaternion.copy(mesh.quaternion);
    galleryGroup.add(rim);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);
  const clock = new THREE.Clock();
  let started = false;
  let hoveredId = null;
  let selectedId = null;
  let running = true;
  const mouse = { x: 0, y: 0 };

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouse.x = pointer.x;
    mouse.y = pointer.y;
  }

  function pick() {
    if (!started) return null;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(frames);
    return hits[0]?.object ?? null;
  }

  function onClick() {
    const object = pick();
    if (object) handlers.onSelect?.(object.userData.projectId);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    const dt = 0.016;

    asteroids.forEach((rock) => {
      rock.rotation.x += rock.userData.spin.x * dt;
      rock.rotation.y += rock.userData.spin.y * dt;
      rock.position.x += Math.sin(t * 0.12 + rock.position.y) * 0.003;
    });

    galleryGroup.visible = started;
    if (started) {
      galleryGroup.rotation.y = t * 0.05;
      const targetX = mouse.x * 1.6;
      const targetY = 0.35 + mouse.y * 0.9;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, -1);

      const object = pick();
      const nextId = object?.userData.projectId ?? null;
      if (nextId !== hoveredId) {
        hoveredId = nextId;
        handlers.onHover?.(hoveredId);
      }

      frames.forEach((frame) => {
        const active = frame.userData.projectId === hoveredId || frame.userData.projectId === selectedId;
        frame.scale.setScalar(active ? 1.12 : 1);
        frame.material.emissiveIntensity = active ? 0.28 : 0.08;
      });
    } else {
      camera.position.set(Math.sin(t * 0.15) * 0.4, 0.2, 14);
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }

  tick();

  return {
    start() {
      started = true;
    },
    setSelected(id) {
      selectedId = id;
    },
    destroy() {
      running = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
