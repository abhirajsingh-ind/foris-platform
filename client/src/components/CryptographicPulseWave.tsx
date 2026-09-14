import React, { useEffect, useState } from 'react';

export const CryptographicPulseWave: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [bars, setBars] = useState<number[]>([40, 65, 30, 85, 50, 95, 35, 70, 45, 80, 60, 90]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => Math.floor(Math.random() * 65) + 25)
      );
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 bg-slate-950/60 border border-cyan-500/20 rounded-xl backdrop-blur-xs select-none ${className}`}
      title="Cryptographic Hash Heartbeat & Network Pulse"
    >
      <div className="flex items-end gap-[2.5px] h-4 w-14">
        {bars.map((height, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full transition-all duration-200"
            style={{
              height: `${height}%`,
              backgroundColor:
                i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#10b981' : '#a855f7',
              boxShadow:
                i % 3 === 0
                  ? '0 0 4px #06b6d4'
                  : i % 3 === 1
                    ? '0 0 4px #10b981'
                    : '0 0 4px #a855f7',
            }}
          />
        ))}
      </div>
      <div className="flex flex-col text-[8px] font-mono leading-tight">
        <span className="text-cyan-400 font-bold flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping inline-block" />
          HASH PULSE
        </span>
        <span className="text-slate-500">256-BIT LIVE</span>
      </div>
    </div>
  );
};
