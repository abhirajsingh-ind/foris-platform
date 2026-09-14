import React, { useEffect, useState, useRef } from 'react';

interface CyberDecryptTextProps {
  text: string;
  className?: string;
  speed?: number;
  triggerOnHover?: boolean;
}

const GLYPHS = '0123456789ABCDEF#%&*<>§ΔΩΨ';

export const CyberDecryptText: React.FC<CyberDecryptTextProps> = ({
  text,
  className = '',
  speed = 25,
  triggerOnHover = true,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const animRef = useRef<number | null>(null);

  const startDecryption = () => {
    if (!text) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = text.length;

    if (animRef.current) clearInterval(animRef.current);

    animRef.current = window.setInterval(() => {
      setDisplayText((_) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        if (animRef.current) clearInterval(animRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }

      iteration += 1 / 2;
    }, speed);
  };

  useEffect(() => {
    startDecryption();
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [text]);

  return (
    <span
      onMouseEnter={triggerOnHover ? startDecryption : undefined}
      className={`inline-block select-none transition-colors ${
        isScrambling ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''
      } ${className}`}
    >
      {displayText}
    </span>
  );
};
