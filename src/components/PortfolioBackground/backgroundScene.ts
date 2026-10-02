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

type EnvironmentState = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fogColor: number;
  fogDensity: number;
  lightColor: number;
  exposure: number;
  particleOpacity: number;
};

type LayerPlane = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.Material>;
  basePosition: THREE.Vector3;
  parallax: number;
  drift: number;
  phase: number;
};

const ENVIRONMENT_STATES: EnvironmentState[] = [
  { position: new THREE.Vector3(0, 1.5, 25), target: new THREE.Vector3(0, 0.4, -13), fogColor: 0x050b12, fogDensity: 0.009, lightColor: 0xa9d1e6, exposure: 0.96, particleOpacity: 0.38 },
  { position: new THREE.Vector3(-1.1, -6.5, 23), target: new THREE.Vector3(0, -6.2, -12), fogColor: 0x07101a, fogDensity: 0.012, lightColor: 0x92bed7, exposure: 0.92, particleOpacity: 0.44 },
  { position: new THREE.Vector3(1.4, -14, 24), target: new THREE.Vector3(0, -14.2, -13), fogColor: 0x0a121b, fogDensity: 0.014, lightColor: 0xa2c0d1, exposure: 0.88, particleOpacity: 0.5 },
  { position: new THREE.Vector3(-1.6, -22, 23), target: new THREE.Vector3(0, -22.4, -13), fogColor: 0x0a1119, fogDensity: 0.016, lightColor: 0x8faec4, exposure: 0.86, particleOpacity: 0.54 },
  { position: new THREE.Vector3(1.2, -30, 24), target: new THREE.Vector3(0, -30.4, -13), fogColor: 0x06101a, fogDensity: 0.013, lightColor: 0x9ccfdb, exposure: 0.96, particleOpacity: 0.58 },
  { position: new THREE.Vector3(-1.1, -38, 23), target: new THREE.Vector3(0, -38.4, -13), fogColor: 0x07101a, fogDensity: 0.012, lightColor: 0xa6c8dc, exposure: 0.92, particleOpacity: 0.48 },
  { position: new THREE.Vector3(0.6, -46, 25), target: new THREE.Vector3(0, -46.4, -13), fogColor: 0x040a11, fogDensity: 0.01, lightColor: 0xb4d3e1, exposure: 0.9, particleOpacity: 0.36 },
];

const ASSET_PATHS = {
  mountain: "/cinematic/data-center-mountain.webp",
} as const;

function createGlowTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext("2d");
  if (context) {
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(231, 243, 255, 0.82)");
    glow.addColorStop(0.2, "rgba(143, 187, 220, 0.2)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
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
  let isMobile = Math.min(width, height) < 768;
  const textureLoader = new THREE.TextureLoader();
  const scene = new THREE.Scene();
  const currentFogColor = new THREE.Color(ENVIRONMENT_STATES[0].fogColor);
  scene.background = currentFogColor.clone();
  scene.fog = new THREE.FogExp2(currentFogColor, ENVIRONMENT_STATES[0].fogDensity);

  const camera = new THREE.PerspectiveCamera(isMobile ? 55 : 47, width / height, 0.1, 100);
  camera.position.copy(ENVIRONMENT_STATES[0].position);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: !isMobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = ENVIRONMENT_STATES[0].exposure;

  const ambient = new THREE.HemisphereLight(0x9bc4dc, 0x071017, 2.2);
  const keyLight = new THREE.DirectionalLight(0xc2e1f0, 4.4);
  keyLight.position.set(-10, 15, 18);
  const travelingLight = new THREE.PointLight(0x75bde2, 24, 55, 2);
  travelingLight.position.set(-3, 2, 6);
  scene.add(ambient, keyLight, travelingLight);

  const farLayer = new THREE.Group();
  const distantLayer = new THREE.Group();
  const midLayer = new THREE.Group();
  const foregroundLayer = new THREE.Group();
  const closeLayer = new THREE.Group();
  scene.add(farLayer, distantLayer, midLayer, foregroundLayer, closeLayer);
  const groups = [farLayer, distantLayer, midLayer, foregroundLayer, closeLayer];
  const planes: LayerPlane[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const assetTextures = Object.fromEntries(
    Object.entries(ASSET_PATHS).map(([name, path]) => {
      const texture = textureLoader.load(path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      textures.push(texture);
      return [name, texture];
    }),
  ) as Record<keyof typeof ASSET_PATHS, THREE.Texture>;

  const addPlane = (layer: THREE.Group, texture: THREE.Texture, position: THREE.Vector3, scale: [number, number], opacity: number, parallax: number, drift = 0, flip = false) => {
    const geometry = new THREE.PlaneGeometry(scale[0], scale[1]);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      color: 0x9ec7dc,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.x = flip ? -1 : 1;
    layer.add(mesh);
    geometries.push(geometry);
    materials.push(material);
    planes.push({ mesh, basePosition: position.clone(), parallax, drift, phase: Math.random() * Math.PI * 2 });
  };

  const sceneBands = [1, -7, -15, -23, -31, -39, -47];
  sceneBands.forEach((y, index) => {
    const offset = index % 2 === 0 ? 1 : -1;
    addPlane(farLayer, assetTextures.mountain, new THREE.Vector3(offset * 1.4, y + 1.6, -31), [48, 23], 0.58, 0.05);
  });

  const monolithGeometry = new THREE.BoxGeometry(1, 1, 1);
  const monolithMaterial = new THREE.MeshStandardMaterial({ color: 0x1f4157, emissive: 0x071722, emissiveIntensity: 0.7, roughness: 0.48, metalness: 0.76, transparent: true, opacity: 0.82 });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x8ec7e8, transparent: true, opacity: 0.38, depthWrite: false });
  const moduleMaterial = new THREE.MeshBasicMaterial({ color: 0x4ea6d4, transparent: true, opacity: 0.42, depthWrite: false });
  geometries.push(monolithGeometry);
  materials.push(monolithMaterial, edgeMaterial, moduleMaterial);
  sceneBands.forEach((y, index) => {
    [-10, -6.5, 7.5, 11].forEach((x, monolithIndex) => {
      const height = 3.5 + ((index + monolithIndex) % 3) * 1.8;
      const monolith = new THREE.Mesh(monolithGeometry, monolithMaterial);
      monolith.position.set(x, y - 1.5 + height / 2, -14 - (monolithIndex % 2) * 2);
      monolith.scale.set(1.8, height, 1.4);
      midLayer.add(monolith);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(monolithGeometry), edgeMaterial);
      edges.position.copy(monolith.position);
      edges.scale.copy(monolith.scale);
      midLayer.add(edges);
      geometries.push(edges.geometry);

      for (let row = 0; row < 4; row += 1) {
        const module = new THREE.Mesh(monolithGeometry, moduleMaterial);
        module.position.set(x, y - 0.3 + row * 1.15, -12.55 - (monolithIndex % 2) * 2);
        module.scale.set(1.2, 0.16, 0.04);
        midLayer.add(module);
      }
    });
  });

  const foregroundGeometry = new THREE.CylinderGeometry(0.07, 0.16, 13, 8);
  const foregroundMaterial = new THREE.MeshStandardMaterial({ color: 0x376b88, emissive: 0x0e2b3d, emissiveIntensity: 1.1, roughness: 0.36, metalness: 0.7, transparent: true, opacity: 0.72 });
  geometries.push(foregroundGeometry);
  materials.push(foregroundMaterial);
  sceneBands.forEach((y, index) => {
    [-15, 15].forEach((x, pillarIndex) => {
      const pillar = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
      pillar.position.set(x, y - 1.5, -3 + pillarIndex * 0.6);
      pillar.rotation.z = pillarIndex ? -0.16 : 0.16;
      closeLayer.add(pillar);
    });
  });

  const glowTexture = createGlowTexture();
  textures.push(glowTexture);
  const glowSprites: THREE.Sprite[] = [];
  sceneBands.forEach((y, index) => {
    const material = new THREE.SpriteMaterial({ map: glowTexture, color: index % 2 ? 0x78a6c5 : 0xc4d9e6, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(index % 2 ? 7 : -7, y + 2, -12);
    sprite.scale.set(11, 11, 1);
    distantLayer.add(sprite);
    glowSprites.push(sprite);
    materials.push(material);
  });

  const particleCount = isMobile ? 70 : 170;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleOrigins = new Float32Array(particleCount * 3);
  const particlePhases = new Float32Array(particleCount);
  for (let index = 0; index < particleCount; index += 1) {
    const pointer = index * 3;
    particleOrigins[pointer] = (Math.random() - 0.5) * 38;
    particleOrigins[pointer + 1] = 7 - Math.random() * 62;
    particleOrigins[pointer + 2] = -4 - Math.random() * 24;
    particlePositions[pointer] = particleOrigins[pointer];
    particlePositions[pointer + 1] = particleOrigins[pointer + 1];
    particlePositions[pointer + 2] = particleOrigins[pointer + 2];
    particlePhases[index] = Math.random() * Math.PI * 2;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.PointsMaterial({ color: 0xc2d7e7, size: isMobile ? 0.12 : 0.095, transparent: true, opacity: ENVIRONMENT_STATES[0].particleOpacity, depthWrite: false, sizeAttenuation: true });
  scene.add(new THREE.Points(particleGeometry, particleMaterial));
  geometries.push(particleGeometry);
  materials.push(particleMaterial);

  const targetCameraPosition = ENVIRONMENT_STATES[0].position.clone();
  const targetLookAt = ENVIRONMENT_STATES[0].target.clone();
  const currentLookAt = ENVIRONMENT_STATES[0].target.clone();
  const targetFogColor = new THREE.Color(ENVIRONMENT_STATES[0].fogColor);
  const targetLightColor = new THREE.Color(ENVIRONMENT_STATES[0].lightColor);
  let targetFogDensity = ENVIRONMENT_STATES[0].fogDensity;
  let targetExposure = ENVIRONMENT_STATES[0].exposure;
  let targetParticleOpacity = ENVIRONMENT_STATES[0].particleOpacity;
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
      pointerX += (targetPointerX - pointerX) * Math.min(delta * 2.2, 0.07);
      pointerY += (targetPointerY - pointerY) * Math.min(delta * 2.2, 0.07);
      cameraTarget.copy(targetCameraPosition);
      lookTarget.copy(targetLookAt);
      if (!reducedMotion) {
        cameraTarget.x += pointerX * 0.5;
        cameraTarget.y += pointerY * 0.22;
        lookTarget.x += pointerX * 0.2;
        lookTarget.y += pointerY * 0.1;
      }
      const ease = reducedMotion ? 0.12 : Math.min(delta * 1.7, 0.08);
      camera.position.lerp(cameraTarget, ease);
      currentLookAt.lerp(lookTarget, ease);
      camera.lookAt(currentLookAt);
      currentFogColor.lerp(targetFogColor, Math.min(delta * 1.2, 0.06));
      (scene.fog as THREE.FogExp2).color.copy(currentFogColor);
      (scene.fog as THREE.FogExp2).density += (targetFogDensity - (scene.fog as THREE.FogExp2).density) * Math.min(delta * 1.2, 0.06);
      scene.background = currentFogColor;
      travelingLight.color.lerp(targetLightColor, Math.min(delta * 1.2, 0.06));
      renderer.toneMappingExposure += (targetExposure - renderer.toneMappingExposure) * Math.min(delta * 1.2, 0.06);
      particleMaterial.opacity += (targetParticleOpacity - particleMaterial.opacity) * Math.min(delta * 1.2, 0.06);
      groups.forEach((group, index) => group.position.set(pointerX * [0.12, 0.24, 0.42, 0.68, 0.9][index], pointerY * [0.04, 0.08, 0.14, 0.22, 0.3][index], 0));
      if (!reducedMotion) {
        const time = now * 0.0001;
        planes.forEach((plane) => {
          plane.mesh.position.x = plane.basePosition.x + pointerX * plane.parallax * 0.55;
          plane.mesh.position.y = plane.basePosition.y + Math.sin(time * 8 + plane.phase) * plane.drift;
        });
        glowSprites.forEach((sprite, index) => {
          const scale = 11 + Math.sin(time * 7 + index) * 0.5;
          sprite.scale.set(scale, scale, 1);
        });
        const positions = particleGeometry.attributes.position.array as Float32Array;
        for (let index = 0; index < particleCount; index += 1) {
          const pointer = index * 3;
          const phase = time * (10 + (index % 5)) + particlePhases[index];
          positions[pointer] = particleOrigins[pointer] + Math.sin(phase) * 0.34 + pointerX * 0.12;
          positions[pointer + 1] = particleOrigins[pointer + 1] + Math.cos(phase * 0.72) * 0.38 + pointerY * 0.08;
        }
        particleGeometry.attributes.position.needsUpdate = true;
        travelingLight.position.x = -3 + Math.sin(time * 1.8) * 1.4;
        travelingLight.intensity = 10 + Math.sin(time * 4) * 0.5;
      }
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
    updateScroll: (scrollProgress: number, activeSectionIndex: number) => {
      const normalized = Math.max(0, Math.min(1, scrollProgress));
      const scaled = normalized * (ENVIRONMENT_STATES.length - 1);
      const baseIndex = Math.min(Math.floor(scaled), ENVIRONMENT_STATES.length - 1);
      const nextIndex = Math.min(baseIndex + 1, ENVIRONMENT_STATES.length - 1);
      const blend = scaled - baseIndex;
      const current = ENVIRONMENT_STATES[baseIndex];
      const next = ENVIRONMENT_STATES[nextIndex];
      targetCameraPosition.lerpVectors(current.position, next.position, blend);
      targetLookAt.lerpVectors(current.target, next.target, blend);
      targetFogColor.lerpColors(new THREE.Color(current.fogColor), new THREE.Color(next.fogColor), blend);
      targetLightColor.lerpColors(new THREE.Color(current.lightColor), new THREE.Color(next.lightColor), blend);
      targetFogDensity = THREE.MathUtils.lerp(current.fogDensity, next.fogDensity, blend);
      targetExposure = THREE.MathUtils.lerp(current.exposure, next.exposure, blend);
      targetParticleOpacity = THREE.MathUtils.lerp(current.particleOpacity, next.particleOpacity, blend) + Math.min(activeSectionIndex, 6) * 0.002;
    },
    updatePointer: (x: number, y: number) => {
      targetPointerX = x;
      targetPointerY = y;
    },
    resize: (newWidth: number, newHeight: number) => {
      width = newWidth;
      height = newHeight;
      isMobile = Math.min(width, height) < 768;
      camera.aspect = width / height;
      camera.fov = isMobile ? 55 : 47;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
      renderer.setSize(width, height, false);
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("visibilitychange", handleVisibility);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    },
  };
}
