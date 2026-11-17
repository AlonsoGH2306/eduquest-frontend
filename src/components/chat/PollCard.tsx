import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Check } from 'lucide-react';
import { Poll } from '../../types';
import { extractErrorMessage } from '../../utils/errors';

interface PollCardProps {
  poll: Poll;
  currentUserId?: number;
  onVote: (pollId: number, optionId: number | null) => Promise<void>;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, currentUserId, onVote }) => {
  const [busy, setBusy] = useState(false);
  const myOption = poll.options.find((option) => currentUserId !== undefined && option.voterIds.includes(currentUserId));

  const vote = async (optionId: number) => {
    setBusy(true);
    try {
      await onVote(poll.id, myOption?.id === optionId ? null : optionId);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-72 max-w-full rounded-3xl border border-slate-200 bg-white p-3">
      <p className="flex items-start gap-2 text-sm font-semibold text-slate-900">
        <BarChart3 size={16} className="mt-0.5 shrink-0 text-indigo-600" /> {poll.question}
      </p>
      <ul className="mt-2 space-y-1.5">
        {poll.options.map((option) => {
          const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
          const chosen = myOption?.id === option.id;
          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => void vote(option.id)}
                aria-pressed={chosen}
                className={`relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-xs transition disabled:opacity-60 ${
                  chosen ? 'border-indigo-400' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <span
                  aria-hidden
                  style={{ width: `${percent}%` }}
                  className={`absolute inset-y-0 left-0 ${chosen ? 'bg-indigo-100' : 'bg-slate-100'}`}
                />
                <span className="relative flex items-center gap-2">
                  {chosen && <Check size={12} className="text-indigo-600" />}
                  <span className="flex-1 font-medium text-slate-800">{option.text}</span>
                  <span className="font-semibold text-slate-500">{percent}%</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">
        {poll.totalVotes === 1 ? '1 voto' : `${poll.totalVotes} votos`}
        {myOption ? ' · toca tu opción para quitar el voto' : ''}
      </p>
    </div>
  );
};
