import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, size = 16 }) => (
  <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : undefined} aria-label={`${value} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= Math.round(value);
      const icon = <Star size={size} className={filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />;
      return onChange ? (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className="rounded p-0.5 transition hover:scale-110"
        >
          {icon}
        </button>
      ) : (
        <span key={star}>{icon}</span>
      );
    })}
  </div>
);
