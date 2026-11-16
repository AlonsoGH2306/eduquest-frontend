import React from 'react';
import { MessageReaction } from '../../types';

interface ReactionBarProps {
  reactions: MessageReaction[];
  currentUserId?: number;
  mine: boolean;
  onToggle: (emoji: string) => void;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, currentUserId, mine, onToggle }) => {
  if (reactions.length === 0) return null;
  return (
    <div className={`mt-1 flex flex-wrap gap-1 ${mine ? 'justify-end' : ''}`}>
      {reactions.map((reaction) => {
        const reacted = currentUserId !== undefined && reaction.userIds.includes(currentUserId);
        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onToggle(reaction.emoji)}
            aria-pressed={reacted}
            aria-label={`${reaction.emoji} ${reaction.count}`}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
              reacted
                ? 'border-indigo-300 bg-indigo-50 font-semibold text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        );
      })}
    </div>
  );
};
