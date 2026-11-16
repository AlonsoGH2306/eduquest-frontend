import React, { useId } from 'react';

export type LumiMood = 'happy' | 'sleepy' | 'off' | 'focus' | 'cheer';

interface LumiProps {
  mood?: LumiMood;
  size?: number;
  label?: string;
  animated?: boolean;
  className?: string;
}

const BODY = '#2c2f66';
const LIGHT = '#ffd25e';

const Eyes: React.FC<{ mood: LumiMood }> = ({ mood }) => {
  if (mood === 'sleepy' || mood === 'off') {
    return (
      <g stroke="#0f1020" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M70 94 q10 7 20 0" />
        <path d="M110 94 q10 7 20 0" />
      </g>
    );
  }
  if (mood === 'cheer') {
    return (
      <g stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 96 q10 -12 20 0" />
        <path d="M110 96 q10 -12 20 0" />
      </g>
    );
  }
  const pupil = mood === 'focus' ? 0 : 3;
  return (
    <g>
      <ellipse cx="80" cy="92" rx="12" ry="15" fill="#ffffff" />
      <ellipse cx="120" cy="92" rx="12" ry="15" fill="#ffffff" />
      <circle cx={80 + pupil} cy="96" r="7" fill="#0f1020" />
      <circle cx={120 + pupil} cy="96" r="7" fill="#0f1020" />
      <circle cx={83 + pupil} cy="92" r="2.5" fill="#ffffff" />
      <circle cx={123 + pupil} cy="92" r="2.5" fill="#ffffff" />
    </g>
  );
};

const Mouth: React.FC<{ mood: LumiMood }> = ({ mood }) => {
  if (mood === 'off') return <path d="M92 118 q8 -6 16 0" stroke="#0f1020" strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (mood === 'sleepy') return <ellipse cx="100" cy="118" rx="5" ry="6" fill="#0f1020" />;
  if (mood === 'cheer') return <path d="M86 112 q14 18 28 0 z" fill="#0f1020" />;
  if (mood === 'focus') return <path d="M92 116 h16" stroke="#0f1020" strokeWidth="4" strokeLinecap="round" />;
  return <path d="M90 114 q10 9 20 0" stroke="#0f1020" strokeWidth="4" fill="none" strokeLinecap="round" />;
};

export const Lumi: React.FC<LumiProps> = ({ mood = 'happy', size = 120, label, animated = true, className = '' }) => {
  const gradientId = `lumi-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const lit = mood !== 'off';
  const tail = lit ? LIGHT : '#6b6f99';
  return (
    <span
      className={`relative inline-flex shrink-0 ${animated && lit ? 'eq-bob' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {lit && (
        <span
          aria-hidden="true"
          className={`absolute rounded-full ${animated ? 'eq-glow' : ''}`}
          style={{
            left: '18%',
            top: '50%',
            width: '64%',
            height: '64%',
            background: 'radial-gradient(circle, rgb(255 210 94 / 0.55) 0%, rgb(255 210 94 / 0) 70%)',
          }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className="relative"
      >
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#5a5fc0" />
            <stop offset="100%" stopColor={BODY} />
          </radialGradient>
        </defs>
        <ellipse cx="62" cy="88" rx="40" ry="24" fill="#bfe8ff" opacity="0.5" transform="rotate(-28 62 88)" />
        <ellipse cx="138" cy="88" rx="40" ry="24" fill="#bfe8ff" opacity="0.5" transform="rotate(28 138 88)" />
        <path d="M82 52 C 74 30, 62 22, 52 20" stroke={BODY} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M118 52 C 126 30, 138 22, 148 20" stroke={BODY} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="52" cy="20" r="8" fill={tail} />
        <circle cx="148" cy="20" r="8" fill={tail} />
        <ellipse cx="100" cy="150" rx="40" ry="34" fill={tail} />
        {lit && <ellipse cx="100" cy="146" rx="26" ry="20" fill="#fff1c2" />}
        <circle cx="100" cy="92" r="50" fill={`url(#${gradientId})`} />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        {mood !== 'off' && (
          <>
            <circle cx="66" cy="112" r="6" fill="#ff6fb5" opacity="0.55" />
            <circle cx="134" cy="112" r="6" fill="#ff6fb5" opacity="0.55" />
          </>
        )}
        {mood === 'sleepy' && (
          <text x="150" y="60" fill="#c8cbe6" fontSize="22" fontWeight="800" fontFamily="Figtree, sans-serif">
            z
          </text>
        )}
      </svg>
    </span>
  );
};
