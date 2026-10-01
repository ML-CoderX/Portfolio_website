import * as THREE from "three";

export interface BackgroundSceneOptions {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
}

export interface BackgroundSceneController {
  updateScroll: (scrollProgress: number, activeSectionIndex: number) => void;
  updatePointer: (x: number, y: number) => void;
  resize: (width: number, height: number) => void;
  destroy: () => void;
}

type Waypoint = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fogColor: number;
  accentColor: number;
};

const SECTION_WAYPOINTS: Waypoint[] = [
  { position: new THREE.Vector3(0, 1, 22), target: new THREE.Vector3(0, 0, -5), fogColor: 0x030508, accentColor: 0x486b8d },
  { position: new THREE.Vector3(-1.8, -6, 20), target: new THREE.Vector3(0, -6, -5), fogColor: 0x05070b, accentColor: 0x445e80 },
  { position: new THREE.Vector3(2.3, -13, 21), target: new THREE.Vector3(0, -13, -5), fogColor: 0x05060a, accentColor: 0x6d4b5b },
  { position: new THREE.Vector3(-2.2, -20, 22), target: new THREE.Vector3(0, -20, -6), fogColor: 0x070608, accentColor: 0x8d3d43 },
  { position: new THREE.Vector3(1.6, -28, 20), target: new THREE.Vector3(0, -28, -5), fogColor: 0x04070a, accentColor: 0x3f7085 },
  { position: new THREE.Vector3(-1.8, -35, 21), target: new THREE.Vector3(0, -35, -5), fogColor: 0x05070b, accentColor: 0x4c6689 },
  { position: new THREE.Vector3(1.2, -42, 22), target: new THREE.Vector3(0, -42, -6), fogColor: 0x070608, accentColor: 0x92424a },
  { position: new THREE.Vector3(0, -49, 23), target: new THREE.Vector3(0, -49, -6), fogColor: 0x020305, accentColor: 0x6b5560 },
];

function createGlowTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext("2d");

  if (context) {
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(255,255,255,0.82)");
    glow.addColorStop(0.18, "rgba(207,224,244,0.36)");
    glow.addColorStop(0.52, "rgba(125,158,190,0.08)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 128, 128);
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBackgroundScene(options: BackgroundSceneOptions): BackgroundSceneController {
  const { canvas, reducedMotion = false } = options;
  let width = canvas.clientWidth || window.innerWidth;
  let height = canvas.clientHeight || window.innerHeight;
  const isMobile = Math.min(width, height) < 768;

  const scene = new THREE.Scene();
  const fogColor = new THREE.Color(SECTION_WAYPOINTS[0].fogColor);
  scene.background = fogColor.clone();
  scene.fog = new THREE.FogExp2(fogColor, isMobile ? 0.032 : 0.024);

  const camera = new THREE.PerspectiveCamera(isMobile ? 52 : 46, width / height, 0.1, 90);
  camera.position.copy(SECTION_WAYPOINTS[0].position);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: !isMobile,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;

  scene.add(new THREE.HemisphereLight(0x657b96, 0x08090c, 1.6));

  const moonlight = new THREE.DirectionalLight(0x89a9cd, 1.75);
  moonlight.position.set(-8, 13, 16);
  scene.add(moonlight);

  const crimsonLight = new THREE.PointLight(0x9b353d, 7.2, 32, 2.1);
  crimsonLight.position.set(8, -18, 3);
  scene.add(crimsonLight);

  const roamingLight = new THREE.PointLight(0x638fbc, 6.2, 34, 2);
  roamingLight.position.set(-7, 2, 4);
  scene.add(roamingLight);

  const farLayer = new THREE.Group();
  const midgroundLayer = new THREE.Group();
  const foregroundLayer = new THREE.Group();
  scene.add(farLayer, midgroundLayer, foregroundLayer);

  const sharedSlateGeometry = new THREE.BoxGeometry(1, 1, 1);
  const sharedStoneGeometry = new THREE.IcosahedronGeometry(1, 1);
  const geometries: THREE.BufferGeometry[] = [sharedSlateGeometry, sharedStoneGeometry];
  const materials: THREE.Material[] = [];

  const makeStoneMaterial = (color: number) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: 0x050a11,
      emissiveIntensity: 0.45,
      roughness: 0.46,
      metalness: 0.62,
      flatShading: true,
    });
    materials.push(material);
    return material;
  };

  const obeliskMaterial = makeStoneMaterial(0x2a3d52);
  const darkerStoneMaterial = makeStoneMaterial(0x172231);
  const facetedMaterial = makeStoneMaterial(0x3a536b);
  const ridgeMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a2d40,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });
  const branchMaterial = new THREE.LineBasicMaterial({
    color: 0x1a2b3b,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  materials.push(ridgeMaterial, branchMaterial);

  const createRidge = (y: number, z: number, scale: number, opacity: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-22, -5);
    shape.lineTo(-22, -0.8);
    shape.lineTo(-15, 1.7);
    shape.lineTo(-10, -0.2);
    shape.lineTo(-4, 3.2);
    shape.lineTo(2, 0.8);
    shape.lineTo(8, 2.6);
    shape.lineTo(15, -0.1);
    shape.lineTo(22, 1.4);
    shape.lineTo(22, -5);
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.scale(scale, scale, 1);
    geometries.push(geometry);
    const material = ridgeMaterial.clone();
    material.opacity = opacity;
    materials.push(material);
    const ridge = new THREE.Mesh(geometry, material);
    ridge.position.set(0, y, z);
    farLayer.add(ridge);
  };

  [-1, -13, -25, -37, -49].forEach((y, index) => {
    createRidge(y, -22, 1.06, 0.44);
    createRidge(y - 1.4, -15, 0.9, 0.62 - index * 0.025);
  });

  const createBranch = (x: number, y: number, direction: number) => {
    const points = [
      new THREE.Vector3(x, y - 6, -4),
      new THREE.Vector3(x + direction * 1.1, y - 1.5, -3),
      new THREE.Vector3(x + direction * 3.6, y + 0.8, -3.2),
      new THREE.Vector3(x + direction * 5.8, y + 3.8, -4),
      new THREE.Vector3(x + direction * 3.6, y + 0.8, -3.2),
      new THREE.Vector3(x + direction * 5.7, y + 0.3, -3.6),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometries.push(geometry);
    foregroundLayer.add(new THREE.Line(geometry, branchMaterial));
  };

  createBranch(-13, 2, 1);
  createBranch(13, -16, -1);
  createBranch(-13, -30, 1);
  createBranch(13, -44, -1);

  const obelisks: THREE.Mesh[] = [];
  const makeObelisk = (x: number, y: number, z: number, scale: THREE.Vector3, tilt: number) => {
    const obelisk = new THREE.Mesh(sharedSlateGeometry, obeliskMaterial);
    obelisk.position.set(x, y, z);
    obelisk.scale.copy(scale);
    obelisk.rotation.set(tilt, tilt * 0.28, tilt * -0.16);
    midgroundLayer.add(obelisk);
    obelisks.push(obelisk);
  };

  makeObelisk(-10.5, -1, -13, new THREE.Vector3(2.4, 12, 1.2), -0.08);
  makeObelisk(10.8, -8, -17, new THREE.Vector3(1.8, 16, 1), 0.06);
  makeObelisk(-11.5, -21, -15, new THREE.Vector3(2.2, 13, 1.1), 0.1);
  makeObelisk(10.5, -34, -17, new THREE.Vector3(2.6, 15, 1.15), -0.07);
  makeObelisk(-8.5, -46, -14, new THREE.Vector3(1.8, 12, 1), 0.05);

  const slabs: THREE.Mesh[] = [];
  const slabPositions = [
    new THREE.Vector3(5.5, 1.5, -9),
    new THREE.Vector3(-5.5, -14, -8),
    new THREE.Vector3(5.8, -28, -9),
    new THREE.Vector3(-5.8, -42, -8),
  ];
  slabPositions.forEach((position, index) => {
    const slab = new THREE.Mesh(sharedSlateGeometry, darkerStoneMaterial);
    slab.position.copy(position);
    slab.scale.set(5.4, 0.36, 3.4);
    slab.rotation.set(index % 2 ? -0.16 : 0.12, index * 0.35, index % 2 ? -0.08 : 0.08);
    midgroundLayer.add(slab);
    slabs.push(slab);
  });

  const sculptures: THREE.Mesh[] = [];
  [
    { position: new THREE.Vector3(7.2, 2.4, -10), scale: 3.6 },
    { position: new THREE.Vector3(-7.5, -12, -11), scale: 3.1 },
    { position: new THREE.Vector3(7.8, -25, -10), scale: 3.9 },
    { position: new THREE.Vector3(-7, -39, -11), scale: 3.3 },
  ].forEach(({ position, scale }, index) => {
    const sculpture = new THREE.Mesh(sharedStoneGeometry, facetedMaterial);
    sculpture.position.copy(position);
    sculpture.scale.setScalar(scale);
    sculpture.rotation.set(index * 0.35, index * 0.72, index * -0.16);
    midgroundLayer.add(sculpture);
    sculptures.push(sculpture);
  });

  const glowTexture = createGlowTexture();
  const glowSprites: THREE.Sprite[] = [];
  const glowColors = [0x5f87ad, 0x8e3d44, 0x516f91, 0x8a3b42, 0x526e8c];
  glowColors.forEach((color, index) => {
    const material = new THREE.SpriteMaterial({
      map: glowTexture,
      color,
      transparent: true,
      opacity: isMobile ? 0.18 : 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    materials.push(material);
    const sprite = new THREE.Sprite(material);
    sprite.position.set(index % 2 ? -5.5 : 5.5, -index * 11 - 1, -8);
    sprite.scale.set(10, 10, 1);
    farLayer.add(sprite);
    glowSprites.push(sprite);
  });

  const moonMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xc0d3e5,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  });
  materials.push(moonMaterial);
  const moon = new THREE.Sprite(moonMaterial);
  moon.position.set(-7.8, 5.2, -10);
  moon.scale.set(6, 6, 1);
  farLayer.add(moon);

  const particleCount = isMobile ? 46 : 96;
  const dustPositions = new Float32Array(particleCount * 3);
  const dustOrigins = new Float32Array(particleCount * 3);
  const dustOffsets = new Float32Array(particleCount);
  for (let index = 0; index < particleCount; index += 1) {
    const offset = index * 3;
    dustOrigins[offset] = (Math.random() - 0.5) * 30;
    dustOrigins[offset + 1] = 5 - Math.random() * 58;
    dustOrigins[offset + 2] = -3 - Math.random() * 24;
    dustPositions[offset] = dustOrigins[offset];
    dustPositions[offset + 1] = dustOrigins[offset + 1];
    dustPositions[offset + 2] = dustOrigins[offset + 2];
    dustOffsets[index] = Math.random() * Math.PI * 2;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  geometries.push(dustGeometry);
  const dustMaterial = new THREE.PointsMaterial({
    color: 0xa9bed3,
    size: isMobile ? 0.14 : 0.1,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    sizeAttenuation: true,
  });
  materials.push(dustMaterial);
  foregroundLayer.add(new THREE.Points(dustGeometry, dustMaterial));

  const targetCameraPosition = SECTION_WAYPOINTS[0].position.clone();
  const targetLookAt = SECTION_WAYPOINTS[0].target.clone();
  const currentLookAt = SECTION_WAYPOINTS[0].target.clone();
  const targetFogColor = new THREE.Color(SECTION_WAYPOINTS[0].fogColor);
  const targetAccentColor = new THREE.Color(SECTION_WAYPOINTS[0].accentColor);
  const cameraTarget = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();

  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let destroyed = false;
  let paused = document.hidden;
  let lastFrame = performance.now();
  let animationFrame = 0;

  const render = (now: number) => {
    if (destroyed) return;

    const delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    if (!paused) {
      pointerX += (targetPointerX - pointerX) * Math.min(delta * 2, 0.06);
      pointerY += (targetPointerY - pointerY) * Math.min(delta * 2, 0.06);

      cameraTarget.copy(targetCameraPosition);
      lookTarget.copy(targetLookAt);
      if (!reducedMotion) {
        cameraTarget.x += pointerX * 0.55;
        cameraTarget.y += pointerY * 0.28;
        lookTarget.x += pointerX * 0.22;
        lookTarget.y += pointerY * 0.12;
      }

      const cameraEase = reducedMotion ? 0.12 : Math.min(delta * 1.7, 0.08);
      camera.position.lerp(cameraTarget, cameraEase);
      currentLookAt.lerp(lookTarget, cameraEase);
      camera.lookAt(currentLookAt);

      fogColor.lerp(targetFogColor, Math.min(delta * 1.2, 0.05));
      (scene.fog as THREE.FogExp2).color.copy(fogColor);
      scene.background = fogColor;
      roamingLight.color.lerp(targetAccentColor, Math.min(delta * 1.2, 0.05));

      farLayer.position.set(pointerX * 0.12, pointerY * 0.04, 0);
      midgroundLayer.position.set(pointerX * 0.3, pointerY * 0.1, 0);
      foregroundLayer.position.set(pointerX * 0.58, pointerY * 0.2, 0);

      if (!reducedMotion) {
        const time = now * 0.0001;
        sculptures.forEach((sculpture, index) => {
          sculpture.rotation.y += delta * (0.018 + index * 0.003);
          sculpture.rotation.x += delta * 0.006;
        });
        slabs.forEach((slab, index) => {
          slab.rotation.y += delta * (index % 2 ? -0.006 : 0.006);
        });
        obelisks.forEach((obelisk, index) => {
          obelisk.rotation.z += Math.sin(time + index) * delta * 0.002;
        });
        glowSprites.forEach((sprite, index) => {
          const scale = 10 + Math.sin(time * 3 + index) * 0.55;
          sprite.scale.set(scale, scale, 1);
        });
        moonMaterial.opacity = 0.52 + Math.sin(time * 2.1) * 0.035;

        const positions = dustGeometry.attributes.position.array as Float32Array;
        for (let index = 0; index < particleCount; index += 1) {
          const offset = index * 3;
          const phase = time * (2.2 + (index % 4) * 0.12) + dustOffsets[index];
          positions[offset] = dustOrigins[offset] + Math.sin(phase) * 0.36;
          positions[offset + 1] = dustOrigins[offset + 1] + Math.cos(phase * 0.72) * 0.42;
        }
        dustGeometry.attributes.position.needsUpdate = true;
      }

      crimsonLight.intensity = 6.5 + Math.sin(now * 0.00035) * 0.55;
      roamingLight.position.x = -7 + Math.sin(now * 0.00016) * 1.2;
      renderer.render(scene, camera);
    }

    animationFrame = requestAnimationFrame(render);
  };

  const handleVisibility = () => {
    paused = document.hidden;
    if (!paused) lastFrame = performance.now();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  animationFrame = requestAnimationFrame(render);

  return {
    updateScroll: (scrollProgress: number) => {
      const waypointProgress = Math.max(0, Math.min(1, scrollProgress)) * (SECTION_WAYPOINTS.length - 1);
      const baseIndex = Math.floor(waypointProgress);
      const nextIndex = Math.min(baseIndex + 1, SECTION_WAYPOINTS.length - 1);
      const fraction = waypointProgress - baseIndex;
      const currentWaypoint = SECTION_WAYPOINTS[baseIndex];
      const nextWaypoint = SECTION_WAYPOINTS[nextIndex];

      targetCameraPosition.lerpVectors(currentWaypoint.position, nextWaypoint.position, fraction);
      targetLookAt.lerpVectors(currentWaypoint.target, nextWaypoint.target, fraction);
      targetFogColor.lerpColors(
        new THREE.Color(currentWaypoint.fogColor),
        new THREE.Color(nextWaypoint.fogColor),
        fraction
      );
      targetAccentColor.lerpColors(
        new THREE.Color(currentWaypoint.accentColor),
        new THREE.Color(nextWaypoint.accentColor),
        fraction
      );
    },
    updatePointer: (x: number, y: number) => {
      targetPointerX = x;
      targetPointerY = y;
    },
    resize: (newWidth: number, newHeight: number) => {
      width = newWidth;
      height = newHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Math.min(width, height) < 768 ? 1 : 1.5));
      renderer.setSize(width, height, false);
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("visibilitychange", handleVisibility);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      glowTexture.dispose();
      renderer.dispose();
    },
  };
}
