import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeForensicCanvasProps {
  className?: string;
  intensity?: number;
  accent?: 'emerald' | 'cobalt' | 'amber' | 'violet';
}

export const ThreeForensicCanvas: React.FC<ThreeForensicCanvasProps> = ({
  className = '',
  intensity = 1.0,
  accent = 'emerald',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // Color Theme Palette
    const getThemeColors = (themeAccent: string) => {
      switch (themeAccent) {
        case 'cobalt':
          return {
            primary: 0x3b82f6,
            secondary: 0x06b6d4,
            tertiary: 0x6366f1,
            laser: 0x38bdf8,
            grid: 0x1d4ed8,
          };
        case 'amber':
          return {
            primary: 0xf59e0b,
            secondary: 0xd97706,
            tertiary: 0xfbbf24,
            laser: 0xfde047,
            grid: 0xb45309,
          };
        case 'violet':
          return {
            primary: 0x8b5cf6,
            secondary: 0xa855f7,
            tertiary: 0xec4899,
            laser: 0xc084fc,
            grid: 0x6d28d9,
          };
        case 'emerald':
        default:
          return {
            primary: 0x10b981,
            secondary: 0x06b6d4,
            tertiary: 0x14b8a6,
            laser: 0x34d399,
            grid: 0x047857,
          };
      }
    };

    const colors = getThemeColors(accent);

    // Root Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ==========================================
    // 2. CENTRAL QUANTUM FORENSIC VAULT (HYPER-STRUCTURE)
    // ==========================================
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Inner Glowing Core (High Density Wireframe Sphere)
    const innerCoreGeo = new THREE.SphereGeometry(2.4, 20, 20);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: colors.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.45 * intensity,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCoreMesh);

    // Radiant Point Spark at the Center
    const radiantGeo = new THREE.BufferGeometry();
    radiantGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const radiantMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.9 * intensity,
    });
    const radiantPoint = new THREE.Points(radiantGeo, radiantMat);
    coreGroup.add(radiantPoint);

    // Middle Faceted Dodecahedron Cage with Glowing Edges
    const dodecaGeo = new THREE.DodecahedronGeometry(4.2, 0);
    const dodecaEdges = new THREE.EdgesGeometry(dodecaGeo);
    const dodecaMat = new THREE.LineBasicMaterial({
      color: colors.secondary,
      transparent: true,
      opacity: 0.65 * intensity,
    });
    const dodecaLines = new THREE.LineSegments(dodecaEdges, dodecaMat);
    coreGroup.add(dodecaLines);

    // Outer Geodesic Icosahedron Shield
    const icosaGeo = new THREE.IcosahedronGeometry(6.4, 1);
    const icosaEdges = new THREE.EdgesGeometry(icosaGeo);
    const icosaMat = new THREE.LineBasicMaterial({
      color: colors.tertiary,
      transparent: true,
      opacity: 0.35 * intensity,
    });
    const icosaLines = new THREE.LineSegments(icosaEdges, icosaMat);
    coreGroup.add(icosaLines);

    // Translucent glass hull
    const hullMat = new THREE.MeshBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.05 * intensity,
      wireframe: false,
    });
    const hullMesh = new THREE.Mesh(icosaGeo, hullMat);
    coreGroup.add(hullMesh);

    // ==========================================
    // 3. GYROSCOPIC ORBITAL TELEMETRY RINGS
    // ==========================================
    const ringsGroup = new THREE.Group();
    masterGroup.add(ringsGroup);

    // Ring 1: Inclined Alpha Ring
    const ring1Geo = new THREE.RingGeometry(8.6, 8.75, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: colors.secondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4 * intensity,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    ringsGroup.add(ring1Mesh);

    // Ring 2: Polar Beta Ring
    const ring2Geo = new THREE.RingGeometry(10.5, 10.65, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: colors.tertiary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35 * intensity,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.y = Math.PI / 3;
    ringsGroup.add(ring2Mesh);

    // Ring 3: Equator Coordinate Ring with Tick Marks
    const ring3Geo = new THREE.RingGeometry(12.6, 12.78, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: colors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45 * intensity,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.x = Math.PI / 2;
    ringsGroup.add(ring3Mesh);

    // ==========================================
    // 4. ORBITING HEXAGONAL EVIDENCE SATELLITES (5 NODES)
    // ==========================================
    const satellitesGroup = new THREE.Group();
    ringsGroup.add(satellitesGroup);

    const satelliteCount = 5;
    const satelliteRadius = 12.7;
    const satelliteMeshes: THREE.Mesh[] = [];
    const satGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6);
    const satMat = new THREE.MeshBasicMaterial({
      color: colors.laser,
      wireframe: true,
      transparent: true,
      opacity: 0.8 * intensity,
    });

    const satCoreGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const satCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < satelliteCount; i++) {
      const angle = (i / satelliteCount) * Math.PI * 2;
      const sGroup = new THREE.Group();
      sGroup.position.set(Math.cos(angle) * satelliteRadius, 0, Math.sin(angle) * satelliteRadius);

      const sMesh = new THREE.Mesh(satGeo, satMat);
      sMesh.rotation.x = Math.PI / 2;
      sGroup.add(sMesh);

      const sCore = new THREE.Mesh(satCoreGeo, satCoreMat);
      sGroup.add(sCore);

      satellitesGroup.add(sGroup);
      satelliteMeshes.push(sMesh);
    }

    // ==========================================
    // 5. VERTICAL FORENSIC LASER SCANNER PLANE
    // ==========================================
    const scannerGroup = new THREE.Group();
    masterGroup.add(scannerGroup);

    // Glowing laser scanner disc
    const scannerDiscGeo = new THREE.RingGeometry(0.2, 8.8, 48);
    const scannerDiscMat = new THREE.MeshBasicMaterial({
      color: colors.laser,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18 * intensity,
    });
    const scannerDisc = new THREE.Mesh(scannerDiscGeo, scannerDiscMat);
    scannerDisc.rotation.x = Math.PI / 2;
    scannerGroup.add(scannerDisc);

    // Outer laser boundary rim
    const scannerRimGeo = new THREE.RingGeometry(8.75, 8.95, 48);
    const scannerRimMat = new THREE.MeshBasicMaterial({
      color: colors.laser,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75 * intensity,
    });
    const scannerRim = new THREE.Mesh(scannerRimGeo, scannerRimMat);
    scannerRim.rotation.x = Math.PI / 2;
    scannerGroup.add(scannerRim);

    // Crosshairs on the scanner
    const crossPoints = [
      new THREE.Vector3(-8.8, 0, 0),
      new THREE.Vector3(8.8, 0, 0),
      new THREE.Vector3(0, 0, -8.8),
      new THREE.Vector3(0, 0, 8.8),
    ];
    const crossGeo = new THREE.BufferGeometry().setFromPoints(crossPoints);
    const crossMat = new THREE.LineBasicMaterial({
      color: colors.laser,
      transparent: true,
      opacity: 0.4 * intensity,
    });
    const crosshair = new THREE.LineSegments(crossGeo, crossMat);
    scannerGroup.add(crosshair);

    // ==========================================
    // 6. DYNAMIC 3D NEURAL PLEXUS CONSTELLATION
    // ==========================================
    const plexusNodeCount = 85;
    const maxConnections = 240;
    const maxDistance = 6.8;

    interface PlexusNode {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
    }

    const plexusNodes: PlexusNode[] = [];
    const nodePositions = new Float32Array(plexusNodeCount * 3);

    for (let i = 0; i < plexusNodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 18
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.018,
        (Math.random() - 0.5) * 0.018,
        (Math.random() - 0.5) * 0.015
      );
      plexusNodes.push({ position: pos, velocity: vel });

      nodePositions[i * 3] = pos.x;
      nodePositions[i * 3 + 1] = pos.y;
      nodePositions[i * 3 + 2] = pos.z;
    }

    // Nodes visual representation (Points)
    const nodePointsGeo = new THREE.BufferGeometry();
    nodePointsGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodePointsMat = new THREE.PointsMaterial({
      color: colors.laser,
      size: 0.32,
      transparent: true,
      opacity: 0.85 * intensity,
    });
    const nodePointsMesh = new THREE.Points(nodePointsGeo, nodePointsMat);
    masterGroup.add(nodePointsMesh);

    // Dynamic Connections LineSegments Buffer
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55 * intensity,
      blending: THREE.AdditiveBlending,
    });
    const plexusLinesMesh = new THREE.LineSegments(linesGeo, linesMat);
    masterGroup.add(plexusLinesMesh);

    // ==========================================
    // 7. UNDULATING 3D CYBER WAVE GRID TERRAIN
    // ==========================================
    const gridCols = 32;
    const gridRows = 24;
    const gridWidth = 70;
    const gridDepth = 45;
    const gridGeo = new THREE.PlaneGeometry(gridWidth, gridDepth, gridCols, gridRows);
    gridGeo.rotateX(-Math.PI / 2);
    gridGeo.translate(0, -11.5, 2);

    const gridMat = new THREE.MeshBasicMaterial({
      color: colors.grid,
      wireframe: true,
      transparent: true,
      opacity: 0.22 * intensity,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    masterGroup.add(gridMesh);

    const gridPosAttr = gridGeo.attributes.position as THREE.BufferAttribute;
    const originalGridY = new Float32Array(gridPosAttr.count);
    for (let i = 0; i < gridPosAttr.count; i++) {
      originalGridY[i] = gridPosAttr.getY(i);
    }

    // ==========================================
    // 8. AMBIENT SHIMMERING CRYPTOGRAPHIC PARTICLES
    // ==========================================
    const ambientCount = 140;
    const ambientPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount * 3; i += 3) {
      ambientPositions[i] = (Math.random() - 0.5) * 55;
      ambientPositions[i + 1] = (Math.random() - 0.5) * 40;
      ambientPositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    const ambientGeo = new THREE.BufferGeometry();
    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    const ambientMat = new THREE.PointsMaterial({
      color: colors.secondary,
      size: 0.22,
      transparent: true,
      opacity: 0.5 * intensity,
    });
    const ambientParticles = new THREE.Points(ambientGeo, ambientMat);
    masterGroup.add(ambientParticles);

    // ==========================================
    // 9. MOUSE PARALLAX & CURSOR GRAVITY PHYSICS
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX = (event.clientX - halfX) / halfX;
      mouseY = (event.clientY - halfY) / halfY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // 10. ANIMATION MASTER LOOP
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const baseCol = new THREE.Color(colors.laser);
    const dimCol = new THREE.Color(colors.primary);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse easing with spring damping
      targetRotX += (mouseY * 0.25 - targetRotX) * 0.04;
      targetRotY += (mouseX * 0.45 - targetRotY) * 0.04;

      masterGroup.rotation.x = targetRotX;
      masterGroup.rotation.y = targetRotY + elapsedTime * 0.03;

      // 1. Quantum Core Dynamics
      innerCoreMesh.rotation.x += 0.008;
      innerCoreMesh.rotation.y += 0.012;
      const coreScale = 1 + Math.sin(elapsedTime * 2.5) * 0.08;
      innerCoreMesh.scale.set(coreScale, coreScale, coreScale);

      dodecaLines.rotation.x -= 0.006;
      dodecaLines.rotation.y -= 0.009;

      icosaLines.rotation.y += 0.004;
      icosaLines.rotation.z += 0.002;
      hullMesh.rotation.copy(icosaLines.rotation);

      // 2. Gyroscopic Telemetry Rings
      ring1Mesh.rotation.z += 0.005;
      ring2Mesh.rotation.z -= 0.004;
      ring3Mesh.rotation.z += 0.003;
      satellitesGroup.rotation.y -= 0.006;

      for (let i = 0; i < satelliteMeshes.length; i++) {
        satelliteMeshes[i].rotation.y += 0.03;
      }

      // 3. Vertical Forensic Optical Laser Scanner Sweep
      const scannerY = Math.sin(elapsedTime * 1.8) * 7.5;
      scannerGroup.position.y = scannerY;
      const pulseIntensity = 0.55 + Math.sin(elapsedTime * 4.0) * 0.25;
      scannerRimMat.opacity = pulseIntensity * intensity;
      scannerDiscMat.opacity = (pulseIntensity * 0.25) * intensity;

      // 4. Undulating Cyber Wave Grid
      for (let i = 0; i < gridPosAttr.count; i++) {
        const vx = gridPosAttr.getX(i);
        const vz = gridPosAttr.getZ(i);
        const wave =
          Math.sin(vx * 0.22 + elapsedTime * 2.0) * 0.9 +
          Math.cos(vz * 0.22 + elapsedTime * 1.6) * 0.7;
        gridPosAttr.setY(i, originalGridY[i] + wave);
      }
      gridPosAttr.needsUpdate = true;

      // 5. Neural Plexus Constellation Physics & Dynamic Laser Links
      let connectionCount = 0;
      const nodePosArr = nodePointsGeo.attributes.position.array as Float32Array;

      // Update Node Positions
      for (let i = 0; i < plexusNodeCount; i++) {
        const node = plexusNodes[i];
        node.position.add(node.velocity);

        // Gentle boundary bounce
        if (Math.abs(node.position.x) > 18) node.velocity.x *= -1;
        if (Math.abs(node.position.y) > 11) node.velocity.y *= -1;
        if (Math.abs(node.position.z) > 10) node.velocity.z *= -1;

        nodePosArr[i * 3] = node.position.x;
        nodePosArr[i * 3 + 1] = node.position.y;
        nodePosArr[i * 3 + 2] = node.position.z;
      }
      nodePointsGeo.attributes.position.needsUpdate = true;

      // Calculate Interconnecting Plexus Beams
      for (let i = 0; i < plexusNodeCount; i++) {
        for (let j = i + 1; j < plexusNodeCount; j++) {
          if (connectionCount >= maxConnections) break;

          const dx = plexusNodes[i].position.x - plexusNodes[j].position.x;
          const dy = plexusNodes[i].position.y - plexusNodes[j].position.y;
          const dz = plexusNodes[i].position.z - plexusNodes[j].position.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < maxDistance * maxDistance) {
            const dist = Math.sqrt(distSq);
            const alpha = Math.max(0, 1 - dist / maxDistance);

            const idx = connectionCount * 6;
            linePositions[idx] = plexusNodes[i].position.x;
            linePositions[idx + 1] = plexusNodes[i].position.y;
            linePositions[idx + 2] = plexusNodes[i].position.z;
            linePositions[idx + 3] = plexusNodes[j].position.x;
            linePositions[idx + 4] = plexusNodes[j].position.y;
            linePositions[idx + 5] = plexusNodes[j].position.z;

            // Interpolate color brightness with distance
            const c = dimCol.clone().lerp(baseCol, alpha);
            lineColors[idx] = c.r * alpha;
            lineColors[idx + 1] = c.g * alpha;
            lineColors[idx + 2] = c.b * alpha;
            lineColors[idx + 3] = c.r * alpha;
            lineColors[idx + 4] = c.g * alpha;
            lineColors[idx + 5] = c.b * alpha;

            connectionCount++;
          }
        }
      }

      linesGeo.setDrawRange(0, connectionCount * 2);
      linesGeo.attributes.position.needsUpdate = true;
      linesGeo.attributes.color.needsUpdate = true;

      // 6. Ambient Shimmering Particles drift
      ambientParticles.rotation.y = elapsedTime * 0.02;
      ambientParticles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // 11. COMPLETE CLEANUP & MEMORY DISPOSAL
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      radiantGeo.dispose();
      radiantMat.dispose();
      dodecaGeo.dispose();
      dodecaEdges.dispose();
      dodecaMat.dispose();
      icosaGeo.dispose();
      icosaEdges.dispose();
      icosaMat.dispose();
      hullMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satGeo.dispose();
      satMat.dispose();
      satCoreGeo.dispose();
      satCoreMat.dispose();
      scannerDiscGeo.dispose();
      scannerDiscMat.dispose();
      scannerRimGeo.dispose();
      scannerRimMat.dispose();
      crossGeo.dispose();
      crossMat.dispose();
      nodePointsGeo.dispose();
      nodePointsMat.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      ambientGeo.dispose();
      ambientMat.dispose();
    };
  }, [intensity, accent]);

  return <div ref={mountRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} />;
};
