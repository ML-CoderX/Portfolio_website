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

// Camera waypoints corresponding to Saad's actual sections
const SECTION_WAYPOINTS = [
  // 0: Hero
  { pos: new THREE.Vector3(0, 0, 22), target: new THREE.Vector3(0, 0, 0), fogColor: 0x03060c, lightColor: 0x38bdf8 },
  // 1: About
  { pos: new THREE.Vector3(-3.5, -4.5, 19), target: new THREE.Vector3(0.5, -4.5, 0), fogColor: 0x050811, lightColor: 0x818cf8 },
  // 2: Education
  { pos: new THREE.Vector3(3.5, -10.5, 18), target: new THREE.Vector3(-0.5, -10.5, 0), fogColor: 0x040810, lightColor: 0x6366f1 },
  // 3: Experience
  { pos: new THREE.Vector3(-2.8, -17.0, 20), target: new THREE.Vector3(0.5, -17.0, 0), fogColor: 0x060812, lightColor: 0xef4444 },
  // 4: Projects
  { pos: new THREE.Vector3(0, -24.0, 23), target: new THREE.Vector3(0, -24.0, 0), fogColor: 0x03060d, lightColor: 0x06b6d4 },
  // 5: Skills
  { pos: new THREE.Vector3(3.2, -31.5, 18), target: new THREE.Vector3(-0.5, -31.5, 0), fogColor: 0x040711, lightColor: 0x3b82f6 },
  // 6: Contact
  { pos: new THREE.Vector3(0, -39.0, 20), target: new THREE.Vector3(0, -39.0, 0), fogColor: 0x03050a, lightColor: 0x22c55e },
  // 7: Finale
  { pos: new THREE.Vector3(0, -47.0, 24), target: new THREE.Vector3(0, -47.0, 0), fogColor: 0x020408, lightColor: 0xef4444 },
];

export function createBackgroundScene(options: BackgroundSceneOptions): BackgroundSceneController {
  const { canvas, reducedMotion = false } = options;

  let width = canvas.clientWidth || window.innerWidth;
  let height = canvas.clientHeight || window.innerHeight;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030508);
  const currentFogColor = new THREE.Color(0x030508);
  scene.fog = new THREE.FogExp2(currentFogColor.getHex(), 0.022);

  // Camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120);
  camera.position.set(0, 0, 22);

  // Renderer
  const isMobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));

  // Lights
  const ambientLight = new THREE.AmbientLight(0x1a2638, 1.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
  keyLight.position.set(12, 18, 15);
  scene.add(keyLight);

  const pointerLight = new THREE.PointLight(0x38bdf8, 2.5, 35, 1.8);
  pointerLight.position.set(0, 0, 8);
  scene.add(pointerLight);

  // ==========================================
  // 1. NEURAL NODE NETWORK (Particles + Dynamic Connections)
  // ==========================================
  const particleCount = isMobile ? 140 : 280;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities: { x: number; y: number; z: number }[] = [];
  const particleYSpread = 55;

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 36;
    const y = -Math.random() * particleYSpread + 5;
    const z = (Math.random() - 0.5) * 22;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.005,
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  // Soft circle texture for particles
  const particleCanvas = document.createElement("canvas");
  particleCanvas.width = 64;
  particleCanvas.height = 64;
  const pCtx = particleCanvas.getContext("2d");
  if (pCtx) {
    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.25, "rgba(147, 197, 253, 0.8)");
    grad.addColorStop(0.65, "rgba(59, 130, 246, 0.2)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);
  }
  const particleTexture = new THREE.CanvasTexture(particleCanvas);

  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.45 : 0.65,
    map: particleTexture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Neural Connections (Constellation lines between nearby nodes)
  const maxLineConnections = isMobile ? 120 : 260;
  const linePositions = new Float32Array(maxLineConnections * 6);
  const lineColors = new Float32Array(maxLineConnections * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);

  // ==========================================
  // 2. ABSTRACT 3D GEOMETRIC STRUCTURES (Deep Space Artifacts)
  // ==========================================
  const polyGroup = new THREE.Group();
  scene.add(polyGroup);

  // Hero crystal core (Geodesic Icosahedron)
  const icosaGeo = new THREE.IcosahedronGeometry(3.2, 1);
  const icosaWire = new THREE.WireframeGeometry(icosaGeo);
  const icosaMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
  });
  const icosaMesh = new THREE.LineSegments(icosaWire, icosaMat);
  icosaMesh.position.set(7.5, 1.2, -6);
  polyGroup.add(icosaMesh);

  // Inner pulsing dodecahedron
  const innerGeo = new THREE.DodecahedronGeometry(1.6, 0);
  const innerWire = new THREE.WireframeGeometry(innerGeo);
  const innerMat = new THREE.LineBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const innerMesh = new THREE.LineSegments(innerWire, innerMat);
  innerMesh.position.copy(icosaMesh.position);
  polyGroup.add(innerMesh);

  // Second geometric structure for Projects section
  const octaGeo = new THREE.OctahedronGeometry(4.0, 1);
  const octaWire = new THREE.WireframeGeometry(octaGeo);
  const octaMat = new THREE.LineBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
  });
  const octaMesh = new THREE.LineSegments(octaWire, octaMat);
  octaMesh.position.set(-8, -25, -5);
  polyGroup.add(octaMesh);

  // Third subtle structure for Skills section
  const torusGeo = new THREE.TorusGeometry(3.5, 0.8, 8, 24);
  const torusWire = new THREE.WireframeGeometry(torusGeo);
  const torusMat = new THREE.LineBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });
  const torusMesh = new THREE.LineSegments(torusWire, torusMat);
  torusMesh.position.set(7, -33, -4);
  torusMesh.rotation.x = Math.PI / 3;
  polyGroup.add(torusMesh);

  // ==========================================
  // 3. PERSPECTIVE DIGITAL GRID / FLOW TERRAIN
  // ==========================================
  const gridWidth = 70;
  const gridHeight = 80;
  const gridSegW = 40;
  const gridSegH = 40;
  const terrainGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegW, gridSegH);
  terrainGeo.rotateX(-Math.PI / 2.3);

  // Apply subtle digital wave curvature to the grid vertices
  const terrainPos = terrainGeo.attributes.position;
  for (let i = 0; i < terrainPos.count; i++) {
    const x = terrainPos.getX(i);
    const z = terrainPos.getZ(i);
    const y = Math.sin(x * 0.15) * Math.cos(z * 0.1) * 1.5 - (z * 0.05);
    terrainPos.setY(i, y);
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshBasicMaterial({
    color: 0x1e293b,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.position.set(0, -14, -12);
  scene.add(terrainMesh);

  // ==========================================
  // 4. FLOATING DATA SPARKS (Subtle rising embers)
  // ==========================================
  const sparkCount = isMobile ? 60 : 130;
  const sparkPositions = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3] = (Math.random() - 0.5) * 30;
    sparkPositions[i * 3 + 1] = -Math.random() * particleYSpread;
    sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 0.35,
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparkPoints);

  // ==========================================
  // STATE & SMOOTH INTERPOLATION RIG
  // ==========================================
  const targetCamPos = new THREE.Vector3().copy(SECTION_WAYPOINTS[0].pos);
  const targetCamLook = new THREE.Vector3().copy(SECTION_WAYPOINTS[0].target);
  const currentCamLook = new THREE.Vector3().copy(SECTION_WAYPOINTS[0].target);

  const targetLightColor = new THREE.Color(SECTION_WAYPOINTS[0].lightColor);
  const targetFogColor = new THREE.Color(SECTION_WAYPOINTS[0].fogColor);

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  let isDestroyed = false;
  let isPaused = false;
  let lastTime = performance.now();

  // Animation Loop
  function tick(now: number) {
    if (isDestroyed) return;

    if (!isPaused) {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // Damp mouse coordinates
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      if (!reducedMotion) {
        // Smooth camera lerp (spring damp)
        const lerpFactor = Math.min(dt * 3.2, 0.18);
        camera.position.lerp(
          new THREE.Vector3(
            targetCamPos.x + mouseX * 0.8,
            targetCamPos.y + mouseY * 0.4,
            targetCamPos.z
          ),
          lerpFactor
        );

        currentCamLook.lerp(
          new THREE.Vector3(
            targetCamLook.x + mouseX * 0.4,
            targetCamLook.y + mouseY * 0.2,
            targetCamLook.z
          ),
          lerpFactor
        );
        camera.lookAt(currentCamLook);

        // Subtle slow rotation of geometric objects
        icosaMesh.rotation.x += dt * 0.12;
        icosaMesh.rotation.y += dt * 0.18;
        innerMesh.rotation.x -= dt * 0.2;
        innerMesh.rotation.y += dt * 0.15;

        octaMesh.rotation.y += dt * 0.09;
        octaMesh.rotation.z += dt * 0.06;

        torusMesh.rotation.z += dt * 0.08;

        // Wave motion on digital terrain
        terrainMesh.position.z = -12 + Math.sin(now * 0.0005) * 0.8;

        // Move pointer light smoothly to follow cursor in front of camera
        pointerLight.position.set(
          camera.position.x + mouseX * 3,
          camera.position.y + mouseY * 2,
          camera.position.z - 6
        );

        // Smooth color interpolation for atmosphere
        pointerLight.color.lerp(targetLightColor, dt * 2.0);
        keyLight.color.lerp(targetLightColor, dt * 2.0);
        currentFogColor.lerp(targetFogColor, dt * 2.0);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.copy(currentFogColor);
        }

        // Animate particles (gentle drift)
        const positions = particleGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const vel = particleVelocities[i];

          positions[idx] += vel.x;
          positions[idx + 1] += vel.y;
          positions[idx + 2] += vel.z;

          // Boundary bounce
          if (Math.abs(positions[idx]) > 18) vel.x *= -1;
          if (positions[idx + 1] > 6) positions[idx + 1] = -particleYSpread;
          if (positions[idx + 1] < -particleYSpread) positions[idx + 1] = 6;
          if (Math.abs(positions[idx + 2]) > 12) vel.z *= -1;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // Animate rising data sparks
        const sparkPosArr = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          const yIdx = i * 3 + 1;
          sparkPosArr[yIdx] += dt * 0.65;
          if (sparkPosArr[yIdx] > 6) {
            sparkPosArr[yIdx] = -particleYSpread;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;

        // Dynamic Neural Network Interconnections
        // Connect nearby nodes within distance threshold
        let lineVertexIndex = 0;
        let lineCount = 0;
        const connectionDist = isMobile ? 3.4 : 4.6;
        const linePosArr = lineGeometry.attributes.position.array as Float32Array;
        const lineColArr = lineGeometry.attributes.color.array as Float32Array;

        for (let i = 0; i < particleCount && lineCount < maxLineConnections; i++) {
          const x1 = positions[i * 3];
          const y1 = positions[i * 3 + 1];
          const z1 = positions[i * 3 + 2];

          // Check against camera distance to only connect visible cluster
          if (Math.abs(y1 - camera.position.y) > 16) continue;

          for (let j = i + 1; j < particleCount && lineCount < maxLineConnections; j++) {
            const x2 = positions[j * 3];
            const y2 = positions[j * 3 + 1];
            const z2 = positions[j * 3 + 2];

            const dx = x1 - x2;
            const dy = y1 - y2;
            const dz = z1 - z2;
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < connectionDist * connectionDist) {
              const alpha = Math.max(0, 1 - Math.sqrt(distSq) / connectionDist);

              linePosArr[lineVertexIndex] = x1;
              linePosArr[lineVertexIndex + 1] = y1;
              linePosArr[lineVertexIndex + 2] = z1;

              lineColArr[lineVertexIndex] = 0.22 * alpha;
              lineColArr[lineVertexIndex + 1] = 0.74 * alpha;
              lineColArr[lineVertexIndex + 2] = 0.97 * alpha;

              linePosArr[lineVertexIndex + 3] = x2;
              linePosArr[lineVertexIndex + 4] = y2;
              linePosArr[lineVertexIndex + 5] = z2;

              lineColArr[lineVertexIndex + 3] = 0.51 * alpha;
              lineColArr[lineVertexIndex + 4] = 0.55 * alpha;
              lineColArr[lineVertexIndex + 5] = 0.97 * alpha;

              lineVertexIndex += 6;
              lineCount++;
            }
          }
        }
        lineGeometry.setDrawRange(0, lineCount * 2);
        lineGeometry.attributes.position.needsUpdate = true;
        lineGeometry.attributes.color.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(tick);
  }

  // Start tick
  requestAnimationFrame(tick);

  // Tab visibility listener
  const handleVisibility = () => {
    isPaused = document.hidden;
    if (!isPaused) {
      lastTime = performance.now();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);

  return {
    updateScroll: (scrollProgress: number, activeSectionIndex: number) => {
      const totalWaypoints = SECTION_WAYPOINTS.length;
      const clampedIndex = Math.max(0, Math.min(activeSectionIndex, totalWaypoints - 1));

      // Calculate smooth interpolation between current section waypoint and next
      const progressNormalized = scrollProgress * (totalWaypoints - 1);
      const baseIdx = Math.floor(progressNormalized);
      const frac = progressNormalized - baseIdx;

      const currentWp = SECTION_WAYPOINTS[Math.min(baseIdx, totalWaypoints - 1)];
      const nextWp = SECTION_WAYPOINTS[Math.min(baseIdx + 1, totalWaypoints - 1)];

      targetCamPos.lerpVectors(currentWp.pos, nextWp.pos, frac);
      targetCamLook.lerpVectors(currentWp.target, nextWp.target, frac);

      targetLightColor.lerpColors(
        new THREE.Color(currentWp.lightColor),
        new THREE.Color(nextWp.lightColor),
        frac
      );

      targetFogColor.lerpColors(
        new THREE.Color(currentWp.fogColor),
        new THREE.Color(nextWp.fogColor),
        frac
      );
    },

    updatePointer: (normX: number, normY: number) => {
      targetMouseX = normX;
      targetMouseY = normY;
    },

    resize: (newW: number, newH: number) => {
      width = newW;
      height = newH;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },

    destroy: () => {
      isDestroyed = true;
      document.removeEventListener("visibilitychange", handleVisibility);

      // Clean disposal
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();

      lineGeometry.dispose();
      lineMaterial.dispose();

      icosaGeo.dispose();
      icosaWire.dispose();
      icosaMat.dispose();

      innerGeo.dispose();
      innerWire.dispose();
      innerMat.dispose();

      octaGeo.dispose();
      octaWire.dispose();
      octaMat.dispose();

      torusGeo.dispose();
      torusWire.dispose();
      torusMat.dispose();

      terrainGeo.dispose();
      terrainMat.dispose();

      sparkGeo.dispose();
      sparkMat.dispose();

      renderer.dispose();
    },
  };
}
