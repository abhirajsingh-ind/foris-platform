import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

export const CyberBackgroundMesh: React.FC<{ intensity?: number }> = ({ intensity = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    let mouse = {
      x: -1000,
      y: -1000,
      radius: 160,
    };

    const isLight = theme === 'light';
    const numParticles = Math.min(Math.floor((width * height) / 14000), 100);

    const colors = isLight
      ? ['#0284c7', '#059669', '#7c3aed', '#0369a1']
      : ['#06b6d4', '#10b981', '#a855f7', '#38bdf8', '#d946ef'];

    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      const baseAlpha = (Math.random() * 0.4 + 0.2) * (isLight ? 0.35 : 0.65) * intensity;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.8 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const connectionDist = 120;
    const maxMouseDist = 150;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cyber scanlines
      const step = 48;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = isLight
        ? 'rgba(15, 23, 42, 0.015)'
        : 'rgba(56, 189, 248, 0.02)';

      ctx.beginPath();
      for (let x = 0; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse proximity interaction (gentle attraction / brightening)
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < maxMouseDist) {
          const force = (1 - distMouse / maxMouseDist) * 0.08;
          p.x += dxMouse * force * 0.1;
          p.y += dyMouse * force * 0.1;
          p.alpha = Math.min(1.0, p.baseAlpha + (1 - distMouse / maxMouseDist) * 0.6);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = distMouse < maxMouseDist ? 8 : 2;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections between close nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const lineAlpha =
              (1 - dist / connectionDist) *
              (isLight ? 0.08 : 0.18) *
              ((p.alpha + p2.alpha) / 2) *
              intensity;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-700"
      style={{ willChange: 'transform' }}
    />
  );
};
