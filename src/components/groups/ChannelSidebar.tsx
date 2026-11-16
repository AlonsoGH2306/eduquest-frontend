import React from 'react';
import { Hash, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { GroupChannel } from '../../types';

interface ChannelSidebarProps {
  channels: GroupChannel[];
  activeId: number | null;
  canManage: boolean;
  onSelect: (channel: GroupChannel) => void;
  onCreate: () => void;
  onEdit: (channel: GroupChannel) => void;
  onDelete: (channel: GroupChannel) => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  channels,
  activeId,
  canManage,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}) => (
  <nav aria-label="Canales del grupo" className="flex w-full shrink-0 flex-col border-b border-slate-100 bg-slate-50 md:w-52 md:border-r md:border-b-0">
    <div className="flex items-center justify-between px-3 pt-3 pb-1">
      <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Canales</p>
      {canManage && (
        <button
          type="button"
          onClick={onCreate}
          aria-label="Crear canal"
          title="Crear canal"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
    <ul className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-y-auto">
      {channels.map((channel) => {
        const active = channel.id === activeId;
        return (
          <li key={channel.id} className="group shrink-0">
            <div
              className={`flex items-center rounded-lg ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <button
                type="button"
                onClick={() => onSelect(channel)}
                aria-current={active ? 'true' : undefined}
                title={channel.topic ?? undefined}
                className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-sm font-medium"
              >
                {channel.readOnly ? (
                  <Megaphone size={14} className="shrink-0 opacity-70" />
                ) : (
                  <Hash size={14} className="shrink-0 opacity-70" />
                )}
                <span className={`truncate ${!active && channel.unreadCount > 0 ? 'font-bold text-slate-900' : ''}`}>
                  {channel.name}
                </span>
                {!active && channel.mentionCount > 0 ? (
                  <span
                    className="ml-auto shrink-0 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white"
                    aria-label={`${channel.mentionCount} menciones`}
                  >
                    @{channel.mentionCount}
                  </span>
                ) : !active && channel.unreadCount > 0 ? (
                  <span
                    className="ml-auto shrink-0 rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white"
                    aria-label={`${channel.unreadCount} sin leer`}
                  >
                    {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                  </span>
                ) : null}
              </button>
              {canManage && (
                <span className="hidden shrink-0 items-center pr-1 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => onEdit(channel)}
                    aria-label={`Editar canal ${channel.name}`}
                    className="rounded p-0.5 opacity-70 hover:opacity-100"
                  >
                    <Pencil size={12} />
                  </button>
                  {channels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDelete(channel)}
                      aria-label={`Eliminar canal ${channel.name}`}
                      className="rounded p-0.5 opacity-70 hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  </nav>
);
