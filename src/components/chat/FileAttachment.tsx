import React from 'react';
import { Download, FileSpreadsheet, FileText, Presentation } from 'lucide-react';

interface FileAttachmentProps {
  url: string;
  name: string;
  mine: boolean;
}

const iconFor = (name: string) => {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  if (['xls', 'xlsx'].includes(extension)) return FileSpreadsheet;
  if (['ppt', 'pptx'].includes(extension)) return Presentation;
  return FileText;
};

export const isVideoFile = (name: string) => /\.(mp4|webm|mov)$/i.test(name);

export const FileAttachment: React.FC<FileAttachmentProps> = ({ url, name, mine }) => {
  if (isVideoFile(name)) {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        playsInline
        aria-label={`Video: ${name}`}
        className={`max-h-80 w-80 max-w-full rounded-2xl border bg-black ${mine ? 'border-indigo-300' : 'border-slate-200'}`}
      />
    );
  }
  const Icon = iconFor(name);
  const extension = name.includes('.') ? name.split('.').pop()?.toUpperCase() : 'ARCHIVO';
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-64 max-w-full items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
        mine ? 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100' : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-800">{name}</span>
        <span className="text-[11px] text-slate-500">{extension}</span>
      </span>
      <Download size={16} className="shrink-0 text-slate-400" />
    </a>
  );
};
