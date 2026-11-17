import React, { useEffect, useRef, useState } from 'react';
import { SmilePlus } from 'lucide-react';

export const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '✅', '👀', '💯', '🤔'];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onPick, align = 'left', className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Reaccionar"
        title="Reaccionar"
        aria-expanded={open}
        className={className}
      >
        <SmilePlus size={14} />
      </button>
      {open && (
        <div
          className={`absolute bottom-full z-20 mb-1 grid w-56 grid-cols-6 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onPick(emoji);
                setOpen(false);
              }}
              className="rounded-lg p-1 text-lg transition hover:bg-slate-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
