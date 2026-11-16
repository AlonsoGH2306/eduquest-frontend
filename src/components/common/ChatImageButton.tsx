import React from 'react';

export const ChatImage: React.FC<{ url: string; mine: boolean }> = ({ url, mine }) => (
  <a href={url} target="_blank" rel="noreferrer" className="block">
    <img
      src={url}
      alt="Imagen enviada en el chat"
      loading="lazy"
      className={`max-h-64 max-w-full rounded-2xl border object-cover ${mine ? 'border-indigo-300' : 'border-slate-200'}`}
    />
  </a>
);
