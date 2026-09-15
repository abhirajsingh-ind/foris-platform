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

    // 1. Scene, Camera, and Low-Power Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 22);

    // Use low-power mode and clamp pixelRatio to 1.0 to prevent laptop GPU overheating
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
      precision: 'mediump',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Color Palette based on accent
    const getThemeColors = (themeAccent: string) => {
      switch (themeAccent) {
        case 'cobalt':
          return { primary: 0x3b82f6, secondary: 0x06b6d4, tertiary: 0x6366f1, spark: 0x93c5fd };
        case 'amber':
          return { primary: 0xf59e0b, secondary: 0xd97706, tertiary: 0xfbbf24, spark: 0xfef08a };
        case 'violet':
          return { primary: 0x8b5cf6, secondary: 0xa855f7, tertiary: 0xec4899, spark: 0xe9d5ff };
        case 'emerald':
        default:
          return { primary: 0x10b981, secondary: 0x06b6d4, tertiary: 0x14b8a6, spark: 0xa7f3d0 };
      }
    };

    const colors = getThemeColors(accent);

    // Root Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ==========================================
    // 2. CENTRAL FORENSIC QUANTUM OCTAHEDRON
    // ==========================================
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Geometric Outer Cage (Crisp Edges)
    const octaGeo = new THREE.OctahedronGeometry(4.2, 0);
    const octaEdges = new THREE.EdgesGeometry(octaGeo);
    const octaMat = new THREE.LineBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.65 * intensity,
    });
    const octaLines = new THREE.LineSegments(octaEdges, octaMat);
    coreGroup.add(octaLines);

    // Inner Diamond Nexus (Counter-rotating)
    const innerGeo = new THREE.OctahedronGeometry(2.1, 0);
    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: colors.secondary,
      transparent: true,
      opacity: 0.8 * intensity,
    });
    const innerLines = new THREE.LineSegments(innerEdges, innerMat);
    coreGroup.add(innerLines);

    // Center Core Spark Point
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const sparkMat = new THREE.PointsMaterial({
      color: colors.spark,
      size: 1.6,
      transparent: true,
      opacity: 0.9 * intensity,
    });
    const sparkPoint = new THREE.Points(sparkGeo, sparkMat);
    coreGroup.add(sparkPoint);

    // ==========================================
    // 3. CONCENTRIC ORBITAL GIMBAL RINGS
    // ==========================================
    // Ring 1 (Inner Gimbal)
    const ring1Geo = new THREE.RingGeometry(6.6, 6.72, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: colors.secondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45 * intensity,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    masterGroup.add(ring1Mesh);

    // Ring 2 (Outer Gimbal)
    const ring2Geo = new THREE.RingGeometry(8.9, 9.02, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: colors.tertiary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35 * intensity,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.y = Math.PI / 4;
    masterGroup.add(ring2Mesh);

    // Ring 3 (Equatorial Horizon Ring)
    const ring3Geo = new THREE.RingGeometry(11.2, 11.3, 56);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: colors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25 * intensity,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.x = Math.PI / 2;
    masterGroup.add(ring3Mesh);

    // ==========================================
    // 4. STATIC AMBIENT STAR-POINTS (ZERO CPU UPDATES)
    // ==========================================
    // 40 static points allocated ONCE. Rotated as a single GPU matrix.
    const pointCount = 40;
    const pointPositions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount * 3; i += 3) {
      pointPositions[i] = (Math.random() - 0.5) * 36;
      pointPositions[i + 1] = (Math.random() - 0.5) * 24;
      pointPositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: colors.secondary,
      size: 0.28,
      transparent: true,
      opacity: 0.45 * intensity,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    masterGroup.add(starPoints);

    // ==========================================
    // 5. SMOOTH MOUSE PARALLAX
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
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // 6. FRAME-THROTTLED & CRASH-PROOF ANIMATION LOOP
    // ==========================================
    let animId: number;
    let isRunning = true;
    let lastFrameTime = 0;
    const targetInterval = 1000 / 45; // Smooth 45 FPS target: saves battery, 0 GPU heat

    const animate = (currentTime: number) => {
      if (!isRunning) return;
      animId = requestAnimationFrame(animate);

      // Frame interval throttle
      const delta = currentTime - lastFrameTime;
      if (delta < targetInterval) return;
      lastFrameTime = currentTime - (delta % targetInterval);

      // Smooth mouse lerp (0 CPU cost)
      targetRotX += (mouseY * 0.18 - targetRotX) * 0.05;
      targetRotY += (mouseX * 0.25 - targetRotY) * 0.05;

      masterGroup.rotation.x = targetRotX;
      masterGroup.rotation.y = targetRotY;

      // Gentle, hypnotic geometric rotations (pure GPU matrix transforms, ZERO vertex updates)
      octaLines.rotation.y += 0.005;
      octaLines.rotation.x += 0.003;

      innerLines.rotation.y -= 0.008;
      innerLines.rotation.z += 0.005;

      ring1Mesh.rotation.z += 0.004;
      ring2Mesh.rotation.z -= 0.003;
      ring3Mesh.rotation.z += 0.002;

      starPoints.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Tab Inactivity Pause (Freezes 100% of WebGL when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animId);
      } else {
        if (!isRunning) {
          isRunning = true;
          lastFrameTime = performance.now();
          animId = requestAnimationFrame(animate);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ==========================================
    // 7. COMPLETE MEMORY CLEANUP & DISPOSAL
    // ==========================================
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      octaGeo.dispose();
      octaEdges.dispose();
      octaMat.dispose();
      innerGeo.dispose();
      innerEdges.dispose();
      innerMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [intensity, accent]);

  return <div ref={mountRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} />;
};
