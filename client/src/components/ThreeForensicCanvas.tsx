import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeForensicCanvasProps {
  className?: string;
  intensity?: number;
}

export const ThreeForensicCanvas: React.FC<ThreeForensicCanvasProps> = ({
  className = '',
  intensity = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for everything
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central 3D Icosahedron Holographic Vault
    const vaultGeo = new THREE.IcosahedronGeometry(6.5, 1);
    const vaultMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35 * intensity,
    });
    const vaultMesh = new THREE.Mesh(vaultGeo, vaultMat);
    mainGroup.add(vaultMesh);

    // Inner Glowing Core Sphere
    const coreGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.25 * intensity,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 2. 3D Floating Forensic DNA Double Helix Strand
    const dnaGroup = new THREE.Group();
    const numPairs = 30;
    const radius = 9;
    const heightSpan = 20;

    const sphereGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const emeraldMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < numPairs; i++) {
      const t = (i / numPairs) * Math.PI * 4;
      const y = (i / numPairs) * heightSpan - heightSpan / 2;
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      // Node 1
      const s1 = new THREE.Mesh(sphereGeo, cyanMat);
      s1.position.set(x1, y, z1);
      dnaGroup.add(s1);

      // Node 2
      const s2 = new THREE.Mesh(sphereGeo, emeraldMat);
      s2.position.set(x2, y, z2);
      dnaGroup.add(s2);

      // Connecting Bar
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2),
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      dnaGroup.add(line);
    }
    dnaGroup.rotation.z = Math.PI / 6;
    mainGroup.add(dnaGroup);

    // 3. Floating 3D Cryptographic Particles & Hash Blocks
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 45;
      particlePositions[i + 1] = (Math.random() - 0.5) * 45;
      particlePositions[i + 2] = (Math.random() - 0.5) * 35;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // 4. Rotating 3D Hexagonal Rings / Orbital Security Halos
    const ringGeo1 = new THREE.RingGeometry(11, 11.2, 32);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(13.5, 13.7, 32);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    mainGroup.add(ring2);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX = (event.clientX - halfX) * 0.0008;
      mouseY = (event.clientY - halfY) * 0.0008;
    };

    window.addEventListener('mousemove', handleMouseMove);

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

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      mainGroup.rotation.y += 0.004;
      mainGroup.rotation.x = targetY;
      mainGroup.rotation.y += targetX * 0.2;

      vaultMesh.rotation.x += 0.005;
      vaultMesh.rotation.y += 0.007;

      coreMesh.rotation.x -= 0.004;
      coreMesh.rotation.y -= 0.006;

      dnaGroup.rotation.y += 0.008;

      ring1.rotation.z += 0.003;
      ring2.rotation.z -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      vaultGeo.dispose();
      vaultMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      sphereGeo.dispose();
      cyanMat.dispose();
      emeraldMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, [intensity]);

  return <div ref={mountRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
};
