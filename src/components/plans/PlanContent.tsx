import React from 'react';
import { Check } from 'lucide-react';

type Block =
  | { kind: 'heading'; text: string; level: number }
  | { kind: 'step'; text: string; marker: string; index: number }
  | { kind: 'paragraph'; text: string }
  | { kind: 'divider' };

const cleanInline = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').trim();

const parsePlan = (content: string): Block[] => {
  let stepIndex = 0;
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map<Block>((line) => {
      if (/^([-*_])\1{2,}$/.test(line)) return { kind: 'divider' };
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) return { kind: 'heading', level: heading[1].length, text: cleanInline(heading[2]) };
      const boldLine = line.match(/^\*\*(.+)\*\*:?$/);
      if (boldLine) return { kind: 'heading', level: 3, text: cleanInline(boldLine[1]) };
      const bullet = line.match(/^[-*•]\s+(\S.*)$/);
      if (bullet) return { kind: 'step', marker: '•', text: cleanInline(bullet[1]), index: stepIndex++ };
      const numbered = line.match(/^(\d+)[.)]\s+(\S.*)$/);
      if (numbered) return { kind: 'step', marker: `${numbered[1]}.`, text: cleanInline(numbered[2]), index: stepIndex++ };
      return { kind: 'paragraph', text: cleanInline(line) };
    });
};

interface PlanContentProps {
  content: string;
  completedSteps?: number[];
  onToggleStep?: (index: number) => void;
}

export const PlanContent: React.FC<PlanContentProps> = ({ content, completedSteps = [], onToggleStep }) => {
  const done = new Set(completedSteps);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {parsePlan(content).map((block, index) => {
        switch (block.kind) {
          case 'divider':
            return <hr key={index} className="my-4 border-slate-200" />;
          case 'heading':
            return block.level <= 2 ? (
              <h3 key={index} className="pt-3 text-lg font-bold text-slate-900">
                {block.text}
              </h3>
            ) : (
              <h4 key={index} className="pt-2 text-base font-semibold text-slate-900">
                {block.text}
              </h4>
            );
          case 'step': {
            if (!onToggleStep) {
              return (
                <div key={index} className="flex gap-2 pl-1">
                  <span className="font-semibold text-indigo-600">{block.marker}</span>
                  <span className="flex-1">{block.text}</span>
                </div>
              );
            }
            const checked = done.has(block.index);
            return (
              <button
                key={index}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onToggleStep(block.index)}
                className="flex w-full items-start gap-2.5 rounded-lg px-1 py-0.5 text-left transition hover:bg-white"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
                <span className={`flex-1 ${checked ? 'text-slate-400 line-through' : ''}`}>{block.text}</span>
              </button>
            );
          }
          default:
            return <p key={index}>{block.text}</p>;
        }
      })}
    </div>
  );
};
