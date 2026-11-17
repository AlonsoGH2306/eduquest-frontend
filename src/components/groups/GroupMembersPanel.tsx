import React from 'react';
import { Link } from 'react-router-dom';
import { GroupMember, StudyRoom, UserSummary } from '../../types';
import { availabilityDot } from '../../utils/availability';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';
import { StudyRoomCard } from './StudyRoomCard';

interface GroupMembersPanelProps {
  members: GroupMember[];
  onlineIds: Set<number>;
  voice: UserSummary[];
  studyRoom: StudyRoom | null;
  currentUserId?: number;
  canManage: boolean;
  onStartStudy: (focusMinutes: number, breakMinutes: number) => Promise<void>;
  onStudyAction: (action: 'join' | 'leave' | 'stop') => Promise<void>;
}

const ROLE_LABEL: Record<GroupMember['groupRole'], string | null> = {
  CREATOR: 'Creador',
  MODERATOR: 'Moderador',
  MEMBER: null,
};

export const GroupMembersPanel: React.FC<GroupMembersPanelProps> = ({
  members,
  onlineIds,
  voice,
  studyRoom,
  currentUserId,
  canManage,
  onStartStudy,
  onStudyAction,
}) => {
  const studying = new Set(studyRoom?.active ? studyRoom.participants.map((person) => person.id) : []);
  const talking = new Set(voice.map((person) => person.id));
  const isOnline = (member: GroupMember) =>
    member.id === currentUserId ? true : onlineIds.has(member.id) && member.availability !== 'INVISIBLE';
  const online = members.filter(isOnline);
  const offline = members.filter((member) => !isOnline(member));

  const activityOf = (member: GroupMember) => {
    if (studying.has(member.id)) return { text: 'En la sala de estudio', className: 'text-lumi-ink' };
    if (talking.has(member.id)) return { text: 'En voz', className: 'text-mint-ink' };
    const status = [member.statusEmoji, member.statusText].filter(Boolean).join(' ');
    if (status) return { text: status, className: 'text-slate-500' };
    const role = ROLE_LABEL[member.groupRole];
    return role ? { text: role, className: 'text-slate-500' } : null;
  };

  const renderMember = (member: GroupMember, connected: boolean) => {
    const activity = connected ? activityOf(member) : null;
    return (
      <li key={member.id}>
        <Link
          to={`/users/${member.id}`}
          className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-hover ${connected ? '' : 'opacity-50 hover:opacity-80'}`}
        >
          <span className="relative shrink-0">
            <UserAvatar username={member.username} avatarUrl={member.avatarUrl} size={34} />
            {connected && (
              <span
                className={`absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full ring-[3px] ring-[var(--eq-side)] ${
                  studying.has(member.id) ? 'bg-lumi' : availabilityDot(member.availability)
                }`}
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-slate-900">{member.username}</span>
              {member.advisor && <AdvisorBadge compact />}
            </span>
            {activity && <span className={`block truncate text-xs ${activity.className}`}>{activity.text}</span>}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <aside aria-label="Integrantes del grupo" className="eq-scroll hidden w-64 shrink-0 flex-col gap-4 overflow-y-auto bg-side p-3 xl:flex">
      <StudyRoomCard
        room={studyRoom}
        currentUserId={currentUserId}
        canManage={canManage}
        onStart={onStartStudy}
        onAction={onStudyAction}
      />
      <section aria-label="En línea">
        <h2 className="px-2 pb-1 text-xs font-bold text-slate-500">En línea, {online.length}</h2>
        <ul>{online.map((member) => renderMember(member, true))}</ul>
      </section>
      {offline.length > 0 && (
        <section aria-label="Desconectados">
          <h2 className="px-2 pb-1 text-xs font-bold text-slate-500">Desconectados, {offline.length}</h2>
          <ul>{offline.map((member) => renderMember(member, false))}</ul>
        </section>
      )}
    </aside>
  );
};
