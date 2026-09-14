import React from 'react';

interface BorderBeamProps {
  className?: string;
  rx?: string;
  colorScheme?: 'cyan' | 'emerald' | 'purple' | 'amber';
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  rx = '16',
  colorScheme = 'cyan',
}) => {
  const gradientId = `beam-grad-${colorScheme}`;

  const colors = {
    cyan: { start: '#06b6d4', mid: '#38bdf8', end: '#10b981' },
    emerald: { start: '#10b981', mid: '#34d399', end: '#06b6d4' },
    purple: { start: '#d946ef', mid: '#8b5cf6', end: '#06b6d4' },
    amber: { start: '#f59e0b', mid: '#fbbf24', end: '#ef4444' },
  }[colorScheme];

  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10 ${className}`}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} stopOpacity="1" />
            <stop offset="50%" stopColor={colors.mid} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.end} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx={rx}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.75"
          strokeDasharray="90 310"
          className="animate-borderTrace"
        />
      </svg>
    </div>
  );
};
