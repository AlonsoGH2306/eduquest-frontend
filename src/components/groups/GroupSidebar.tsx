import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  CalendarDays,
  ChevronDown,
  FileText,
  Hash,
  Headphones,
  LogOut,
  Palette,
  Pencil,
  PhoneOff,
  Plus,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { GroupChannel, GroupResponse, UserSummary } from '../../types';
import { GroupTab } from '../../hooks/useGroupDetail';
import { UserAvatar } from '../common/UserAvatar';
import { UserPanel } from '../layout/UserPanel';
import { ChannelList } from './ChannelList';
import { GroupBanner } from './GroupAvatar';

export interface GroupMenuActions {
  muted: boolean;
  canCustomize: boolean;
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canLeave: boolean;
  onCustomize: () => void;
  onEdit: () => void;
  onInvite: () => void;
  onToggleMute: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

interface GroupNavProps {
  activeTab: GroupTab;
  activeChannelId: number | null;
  channels: GroupChannel[];
  documentsCount: number;
  memberCount: number;
  voice: UserSummary[];
  inVoice: boolean;
  joiningVoice: boolean;
  onSelectTab: (tab: GroupTab) => void;
  onSelectChannel: (channelId: number) => void;
  onToggleVoice: () => void;
}

interface GroupSidebarProps extends GroupNavProps {
  group: GroupResponse | null;
  groupName: string;
  canManageChannels: boolean;
  menu: GroupMenuActions;
  studyRoom?: React.ReactNode;
  onCreateChannel: () => void;
  onEditChannel: (channel: GroupChannel) => void;
  onDeleteChannel: (channel: GroupChannel) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="mt-4 mb-1 flex items-center justify-between px-2">
    <p className="text-xs font-bold text-faint">{children}</p>
    {action}
  </div>
);

const navItemClass = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[15px] transition ${
    active ? 'bg-raised font-bold text-ink' : 'font-medium text-faint hover:bg-hover hover:text-soft'
  }`;

const GroupMenu: React.FC<{ menu: GroupMenuActions }> = ({ menu }) => {
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

  const item = (label: string, Icon: React.ElementType, onClick: () => void, danger = false) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm font-semibold transition ${
        danger ? 'text-red-500 hover:bg-red-500 hover:text-white' : 'text-slate-700 hover:bg-indigo-600 hover:text-white'
      }`}
    >
      {label} <Icon size={16} />
    </button>
  );

  return (
    <div ref={ref} className="absolute top-2 right-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Opciones del grupo"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
      >
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
          {menu.canInvite && item('Invitar personas', Send, menu.onInvite)}
          {menu.canCustomize && item('Personalizar grupo', Palette, menu.onCustomize)}
          {menu.canEdit && item('Editar nombre y descripción', Pencil, menu.onEdit)}
          {item(menu.muted ? 'Activar avisos' : 'Silenciar grupo', menu.muted ? Bell : BellOff, menu.onToggleMute)}
          {(menu.canLeave || menu.canDelete) && <div className="my-1 h-px bg-slate-200" />}
          {menu.canLeave && item('Salir del grupo', LogOut, menu.onLeave, true)}
          {menu.canDelete && item('Eliminar grupo', Trash2, menu.onDelete, true)}
        </div>
      )}
    </div>
  );
};

const VoiceEntry: React.FC<Pick<GroupNavProps, 'voice' | 'inVoice' | 'joiningVoice' | 'onToggleVoice'>> = ({
  voice,
  inVoice,
  joiningVoice,
  onToggleVoice,
}) => (
  <>
    <button
      type="button"
      onClick={onToggleVoice}
      disabled={joiningVoice}
      className={`${navItemClass(false)} disabled:opacity-60`}
      aria-label={inVoice ? 'Salir de la sala de voz' : 'Entrar a la sala de voz'}
    >
      {inVoice ? <PhoneOff size={16} className="shrink-0 text-red-500" /> : <Headphones size={16} className="shrink-0 text-mint-ink" />}
      <span className="truncate">{joiningVoice ? 'Abriendo...' : inVoice ? 'Salir de voz' : 'Sala de voz'}</span>
    </button>
    {voice.length > 0 && (
      <ul className="mb-1 space-y-1 pl-8" aria-label="En la sala de voz">
        {voice.map((person) => (
          <li key={person.id} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full ring-2 ring-mint">
              <UserAvatar username={person.username} avatarUrl={person.avatarUrl} size={22} />
            </span>
            <span className="truncate">{person.username}</span>
          </li>
        ))}
      </ul>
    )}
  </>
);

export const GroupSidebar: React.FC<GroupSidebarProps> = ({
  group,
  groupName,
  activeTab,
  activeChannelId,
  channels,
  canManageChannels,
  documentsCount,
  memberCount,
  voice,
  inVoice,
  joiningVoice,
  menu,
  studyRoom,
  onSelectTab,
  onSelectChannel,
  onToggleVoice,
  onCreateChannel,
  onEditChannel,
  onDeleteChannel,
}) => (
  <aside aria-label={`Canales de ${groupName}`} className="hidden w-60 shrink-0 flex-col bg-side md:flex">
    <div className="relative z-10 shrink-0">
      <GroupBanner group={group ?? { name: groupName }} className="h-36">
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[var(--eq-side)]" />
        <p className="absolute right-3 bottom-3 left-3 line-clamp-2 text-base leading-tight font-extrabold text-ink">{groupName}</p>
      </GroupBanner>
      <GroupMenu menu={menu} />
    </div>

    <nav className="eq-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-label="Secciones del grupo">
      <SectionTitle>Información</SectionTitle>
      <button
        type="button"
        onClick={() => onSelectTab('docs')}
        aria-current={activeTab === 'docs' ? 'page' : undefined}
        className={navItemClass(activeTab === 'docs')}
      >
        <FileText size={16} className="shrink-0 text-faint" /> Material
        <span className="ml-auto text-xs text-faint">{documentsCount}</span>
      </button>
      <button
        type="button"
        onClick={() => onSelectTab('sessions')}
        aria-current={activeTab === 'sessions' ? 'page' : undefined}
        className={navItemClass(activeTab === 'sessions')}
      >
        <CalendarDays size={16} className="shrink-0 text-faint" /> Asesorías
      </button>
      <button
        type="button"
        onClick={() => onSelectTab('members')}
        aria-current={activeTab === 'members' ? 'page' : undefined}
        className={navItemClass(activeTab === 'members')}
      >
        <Users size={16} className="shrink-0 text-faint" /> Integrantes
        <span className="ml-auto text-xs text-faint">{memberCount}</span>
      </button>

      <SectionTitle
        action={
          canManageChannels ? (
            <button
              type="button"
              onClick={onCreateChannel}
              aria-label="Crear canal"
              title="Crear canal"
              className="rounded p-0.5 text-faint hover:text-ink"
            >
              <Plus size={15} />
            </button>
          ) : undefined
        }
      >
        Canales de texto
      </SectionTitle>
      <ChannelList
        channels={channels}
        activeId={activeTab === 'chat' ? activeChannelId : null}
        canManage={canManageChannels}
        onSelect={(channel) => onSelectChannel(channel.id)}
        onEdit={onEditChannel}
        onDelete={onDeleteChannel}
      />

      <SectionTitle>Juntos</SectionTitle>
      <VoiceEntry voice={voice} inVoice={inVoice} joiningVoice={joiningVoice} onToggleVoice={onToggleVoice} />
      {studyRoom && <div className="mt-3 xl:hidden">{studyRoom}</div>}
    </nav>
    <UserPanel />
  </aside>
);

export const GroupMobileNav: React.FC<GroupNavProps & { groupName: string }> = ({
  groupName,
  activeTab,
  activeChannelId,
  channels,
  documentsCount,
  voice,
  inVoice,
  joiningVoice,
  onSelectTab,
  onSelectChannel,
  onToggleVoice,
}) => {
  const pill = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition ${
      active ? 'bg-indigo-600 text-white' : 'bg-raised text-slate-700'
    }`;
  return (
    <nav aria-label={`Secciones de ${groupName}`} className="eq-scroll-hidden flex shrink-0 gap-2 overflow-x-auto bg-side px-3 py-2 md:hidden">
      {channels.map((channel) => (
        <button
          key={channel.id}
          type="button"
          onClick={() => onSelectChannel(channel.id)}
          className={pill(activeTab === 'chat' && channel.id === activeChannelId)}
        >
          <Hash size={14} /> {channel.name}
          {channel.mentionCount > 0 && <span className="rounded-full bg-chicle px-1.5 text-[11px] font-extrabold text-noche">@</span>}
        </button>
      ))}
      <button type="button" onClick={() => onSelectTab('docs')} className={pill(activeTab === 'docs')}>
        <FileText size={14} /> Material ({documentsCount})
      </button>
      <button type="button" onClick={() => onSelectTab('sessions')} className={pill(activeTab === 'sessions')}>
        <CalendarDays size={14} /> Asesorías
      </button>
      <button type="button" onClick={() => onSelectTab('members')} className={pill(activeTab === 'members')}>
        <Users size={14} /> Integrantes
      </button>
      <button type="button" onClick={onToggleVoice} disabled={joiningVoice} className={pill(inVoice)}>
        <Headphones size={14} /> {inVoice ? 'Salir de voz' : voice.length > 0 ? `Voz (${voice.length})` : 'Voz'}
      </button>
    </nav>
  );
};
