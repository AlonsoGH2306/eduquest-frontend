import React from 'react';
import { Hash, Megaphone, Pencil, Trash2 } from 'lucide-react';
import { GroupChannel } from '../../types';

interface ChannelListProps {
  channels: GroupChannel[];
  activeId: number | null;
  canManage: boolean;
  onSelect: (channel: GroupChannel) => void;
  onEdit: (channel: GroupChannel) => void;
  onDelete: (channel: GroupChannel) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({ channels, activeId, canManage, onSelect, onEdit, onDelete }) => (
  <ul className="space-y-0.5">
    {channels.map((channel) => {
      const active = channel.id === activeId;
      const unread = !active && channel.unreadCount > 0;
      return (
        <li key={channel.id} className="group">
          <div
            className={`flex items-center rounded-lg transition ${
              active ? 'bg-raised text-ink' : unread ? 'text-ink hover:bg-hover' : 'text-faint hover:bg-hover hover:text-soft'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(channel)}
              aria-current={active ? 'page' : undefined}
              title={channel.topic ?? undefined}
              className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-[15px]"
            >
              {channel.readOnly ? (
                <Megaphone size={16} className="shrink-0 text-faint" />
              ) : (
                <Hash size={16} className="shrink-0 text-faint" />
              )}
              <span className={`truncate ${active || unread ? 'font-bold' : 'font-medium'}`}>{channel.name}</span>
              {!active && channel.mentionCount > 0 ? (
                <span
                  className="ml-auto shrink-0 rounded-full bg-chicle px-1.5 text-[11px] font-extrabold text-noche"
                  aria-label={`${channel.mentionCount} menciones`}
                >
                  @{channel.mentionCount}
                </span>
              ) : unread ? (
                <span
                  className="ml-auto shrink-0 rounded-full bg-indigo-600 px-1.5 text-[11px] font-bold text-white"
                  aria-label={`${channel.unreadCount} sin leer`}
                >
                  {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                </span>
              ) : null}
            </button>
            {canManage && (
              <span className="hidden shrink-0 items-center gap-0.5 pr-1.5 group-focus-within:flex group-hover:flex">
                <button
                  type="button"
                  onClick={() => onEdit(channel)}
                  aria-label={`Editar canal ${channel.name}`}
                  className="rounded p-1 text-faint hover:text-ink"
                >
                  <Pencil size={13} />
                </button>
                {channels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDelete(channel)}
                    aria-label={`Eliminar canal ${channel.name}`}
                    className="rounded p-1 text-faint hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </span>
            )}
          </div>
        </li>
      );
    })}
  </ul>
);
