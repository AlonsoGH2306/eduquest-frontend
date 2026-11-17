import React from 'react';
import { findPackSticker } from '../../utils/stickers';

interface StickerViewProps {
  value: string;
  size?: number;
  animated?: boolean;
}

export const StickerView: React.FC<StickerViewProps> = ({ value, size = 120, animated = true }) => {
  const pack = findPackSticker(value);
  if (pack) {
    return (
      <div
        role="img"
        aria-label={`Sticker: ${pack.label}`}
        style={{ width: size, height: size, backgroundImage: `linear-gradient(135deg, ${pack.colors[0]}, ${pack.colors[1]})` }}
        className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-3xl p-2 text-center shadow-sm"
      >
        <span
          style={{ fontSize: size * 0.42 }}
          className={`inline-block leading-none drop-shadow ${animated ? `sticker-anim sticker-${pack.animation}` : ''}`}
        >
          {pack.emoji}
        </span>
        <span style={{ fontSize: Math.max(10, size * 0.11) }} className="leading-tight font-black text-white drop-shadow">
          {pack.label}
        </span>
      </div>
    );
  }
  return (
    <img
      src={value}
      alt="Sticker"
      loading="lazy"
      style={{ width: size, height: size }}
      className="shrink-0 rounded-2xl object-contain"
    />
  );
};
