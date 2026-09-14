import React, { useEffect, useState, useRef } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface CyberHUDCursorProps {
  enabled: boolean;
}

export const CyberHUDCursor: React.FC<CyberHUDCursorProps> = ({ enabled }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFinePointer, setIsFinePointer] = useState(true);

  const posRef = useRef({ x: -100, y: -100 });
  const targetPosRef = useRef({ x: -100, y: -100 });
  const rippleCountRef = useRef(0);

  useEffect(() => {
    // Check if pointer is fine (desktop mouse)
    const media = window.matchMedia('(pointer: fine)');
    setIsFinePointer(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!enabled || !isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };
      setCoords({ x: Math.round(e.clientX), y: Math.round(e.clientY) });

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, .interactive-cyber')
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      const id = ++rippleCountRef.current;
      setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Smooth lerp animation frame
    let animId: number;
    const lerp = () => {
      const ease = 0.22;
      posRef.current.x += (targetPosRef.current.x - posRef.current.x) * ease;
      posRef.current.y += (targetPosRef.current.y - posRef.current.y) * ease;
      setPos({ x: posRef.current.x, y: posRef.current.y });
      animId = requestAnimationFrame(lerp);
    };

    animId = requestAnimationFrame(lerp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, isFinePointer]);

  if (!enabled || !isFinePointer) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border border-cyan-400/80 animate-ping pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          style={{
            left: ripple.x - 24,
            top: ripple.y - 24,
            width: 48,
            height: 48,
            animationDuration: '650ms',
          }}
        />
      ))}

      {/* Main Reticle */}
      <div
        className="absolute transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          left: -16,
          top: -16,
        }}
      >
        {/* Core Dot */}
        <div
          className={`w-2 h-2 rounded-full absolute left-[12px] top-[12px] transition-all duration-150 ${
            isClicked
              ? 'bg-emerald-400 scale-150 shadow-[0_0_12px_#10b981]'
              : isHovered
                ? 'bg-cyan-400 scale-125 shadow-[0_0_10px_#06b6d4]'
                : 'bg-cyan-400/80 shadow-[0_0_6px_#06b6d4]'
          }`}
        />

        {/* Outer Rotating Crosshair Dial */}
        <div
          className={`w-8 h-8 rounded-full border border-dashed transition-all duration-300 ${
            isHovered
              ? 'scale-125 border-emerald-400/90 rotate-45 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'border-cyan-400/40 rotate-0 animate-[spin_8s_linear_infinite]'
          }`}
        />

        {/* Precision Targeting Brackets (visible when hovered) */}
        {isHovered && (
          <div className="absolute inset-[-6px] pointer-events-none animate-fadeIn">
            {/* Top Left */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
            {/* Top Right */}
            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
            {/* Bottom Left */}
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
            {/* Bottom Right */}
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
          </div>
        )}

        {/* Monospace HUD Telemetry Coordinates */}
        <div className="absolute left-8 top-[-4px] whitespace-nowrap font-mono text-[9px] text-cyan-400/70 tracking-widest bg-slate-950/70 px-1 py-0.5 rounded border border-cyan-500/20 pointer-events-none backdrop-blur-xs select-none">
          {coords.x}:{coords.y}
        </div>
      </div>
    </div>
  );
};
