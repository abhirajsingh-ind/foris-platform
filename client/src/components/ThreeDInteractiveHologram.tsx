import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Dna, ShieldCheck, Crosshair, RefreshCw, Eye, Sparkles } from 'lucide-react';

type HologramMode = 'dna' | 'vault' | 'ballistics';

export const ThreeDInteractiveHologram: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<HologramMode>('vault');
  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(true);
  const [telemetry, setTelemetry] = useState({ rotY: 0, fps: 60, status: 'LOCKED & SEALED' });

  // Refs for animation loop
  const modeRef = useRef<HologramMode>(mode);
  const isRotatingRef = useRef(isRotating);
  const sceneGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 26;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    sceneGroupRef.current = mainGroup;

    // Build the 3 models
    const dnaGroup = new THREE.Group();
    const vaultGroup = new THREE.Group();
    const ballisticsGroup = new THREE.Group();

    mainGroup.add(dnaGroup);
    mainGroup.add(vaultGroup);
    mainGroup.add(ballisticsGroup);

    // ==================== 1. DNA HELIX ====================
    const numPairs = 28;
    const radius = 6.5;
    const heightSpan = 18;
    const sphereGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const emeraldMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const fuchsiaMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
    const linkMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });

    for (let i = 0; i < numPairs; i++) {
      const t = (i / numPairs) * Math.PI * 4;
      const y = (i / numPairs) * heightSpan - heightSpan / 2;
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      const m1 = new THREE.Mesh(sphereGeo, i % 2 === 0 ? cyanMat : fuchsiaMat);
      m1.position.set(x1, y, z1);
      dnaGroup.add(m1);

      const m2 = new THREE.Mesh(sphereGeo, emeraldMat);
      m2.position.set(x2, y, z2);
      dnaGroup.add(m2);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2),
      ]);
      const line = new THREE.Line(lineGeo, linkMat);
      dnaGroup.add(line);
    }
    dnaGroup.rotation.z = Math.PI / 8;

    // ==================== 2. CRYPTOGRAPHIC VAULT ====================
    const vaultGeo = new THREE.IcosahedronGeometry(7, 1);
    const vaultMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const vaultMesh = new THREE.Mesh(vaultGeo, vaultMat);
    vaultGroup.add(vaultMesh);

    const innerGeo = new THREE.OctahedronGeometry(4, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    vaultGroup.add(innerMesh);

    // Orbiting rings
    const ringGeo = new THREE.RingGeometry(9.5, 9.8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 3;
    vaultGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh2.rotation.y = Math.PI / 4;
    vaultGroup.add(ringMesh2);

    // ==================== 3. BALLISTICS GYROSCOPE ====================
    const coneGeo = new THREE.ConeGeometry(3.5, 9, 16);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI / 2;
    ballisticsGroup.add(coneMesh);

    const gyroRingGeo = new THREE.TorusGeometry(8, 0.15, 12, 48);
    const gyroRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const gyroRing1 = new THREE.Mesh(gyroRingGeo, gyroRingMat);
    const gyroRing2 = new THREE.Mesh(gyroRingGeo, gyroRingMat);
    gyroRing2.rotation.x = Math.PI / 2;
    ballisticsGroup.add(gyroRing1);
    ballisticsGroup.add(gyroRing2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(24, 16, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -9;
    scene.add(gridHelper);

    // Mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      mainGroup.rotation.y += deltaX * 0.01;
      mainGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      // Model visibility based on current mode
      dnaGroup.visible = modeRef.current === 'dna';
      vaultGroup.visible = modeRef.current === 'vault';
      ballisticsGroup.visible = modeRef.current === 'ballistics';

      if (isRotatingRef.current && !isDragging) {
        mainGroup.rotation.y += 0.01;

        if (vaultGroup.visible) {
          vaultMesh.rotation.x += 0.006;
          vaultMesh.rotation.y += 0.009;
          innerMesh.rotation.x -= 0.01;
          ringMesh1.rotation.z += 0.008;
          ringMesh2.rotation.z -= 0.006;
        }

        if (dnaGroup.visible) {
          dnaGroup.rotation.y += 0.012;
        }

        if (ballisticsGroup.visible) {
          coneMesh.rotation.z += 0.02;
          gyroRing1.rotation.x += 0.01;
          gyroRing2.rotation.y += 0.015;
        }
      }

      // FPS Telemetry
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        setTelemetry({
          rotY: Math.round(((mainGroup.rotation.y % (Math.PI * 2)) / (Math.PI * 2)) * 360),
          fps: frameCount,
          status: 'HASH VERIFIED',
        });
        frameCount = 0;
        lastTime = currentTime;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      vaultGeo.dispose();
      vaultMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      sphereGeo.dispose();
      cyanMat.dispose();
      emeraldMat.dispose();
      fuchsiaMat.dispose();
      linkMat.dispose();
      coneGeo.dispose();
      coneMat.dispose();
      gyroRingGeo.dispose();
      gyroRingMat.dispose();
      gridHelper.dispose();
    };
  }, []);

  return (
    <div className={`relative bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-3 flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-md ${className}`}>
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between z-20 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white font-mono uppercase tracking-wider">
            3D Evidence Hologram
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => setMode('vault')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              mode === 'vault'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Vault
          </button>
          <button
            onClick={() => setMode('dna')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              mode === 'dna'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3 h-3" />
            DNA STR
          </button>
          <button
            onClick={() => setMode('ballistics')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              mode === 'ballistics'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            Ballistics
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-48 cursor-grab active:cursor-grabbing relative z-10 flex items-center justify-center select-none"
        title="Click and drag to rotate 3D Evidence Model"
      />

      {/* Bottom Telemetry & Quick Action Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 z-20">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            ROT: {telemetry.rotY}°
          </span>
          <span className="text-slate-500">{telemetry.fps} FPS</span>
          <span className="text-emerald-400 font-semibold">{telemetry.status}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1 rounded transition-colors ${
              isRotating ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-500 hover:text-white'
            }`}
            title={isRotating ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
