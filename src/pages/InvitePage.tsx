import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, MailOpen, UserPlus, Users } from 'lucide-react';
import { useInvite } from '../hooks/useInvite';
import { useMyGroups } from '../hooks/useMyGroups';
import { extractErrorMessage, getErrorStatus } from '../utils/errors';
import { GroupResponse } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { VisibilityBadge } from '../components/groups/VisibilityBadge';
import { JoinPrivateGroupModal } from '../components/groups/JoinPrivateGroupModal';

export const InvitePage: React.FC = () => {
  const { code = '' } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { refresh: refreshMyGroups } = useMyGroups();
  const { group, loading, error, errorStatus, reload, joining, joinWithInvite, joinWithPassword } = useInvite(code, token);
  const [askPassword, setAskPassword] = useState(false);

  const goToGroup = (target: GroupResponse) => navigate(`/groups/${target.id}`, { replace: true, state: { group: target } });

  const onJoined = (joined: GroupResponse) => {
    refreshMyGroups();
    goToGroup(joined);
  };

  const accept = async () => {
    if (!group) return;
    if (group.visibility === 'PRIVATE' && !token) {
      setAskPassword(true);
      return;
    }
    try {
      const joined = await joinWithInvite();
      if (!joined) return;
      toast.success(`¡Te uniste a "${joined.name}"!`);
      onJoined(joined);
    } catch (err) {
      if (getErrorStatus(err) === 409) {
        goToGroup({ ...group, member: true });
        return;
      }
      toast.error(extractErrorMessage(err));
      if (getErrorStatus(err) === 403 && group.visibility === 'PRIVATE') setAskPassword(true);
    }
  };

  if (loading) return <Spinner label="Abriendo la invitación..." />;

  if (errorStatus === 404 || !group) {
    return error && errorStatus !== 404 ? (
      <ErrorState message={error} onRetry={reload} />
    ) : (
      <EmptyState
        title="Esta invitación no existe"
        description="Revisa el enlace o pide a quien te invitó que te mande uno nuevo."
        actionLabel="Ir a Grupos"
        onAction={() => navigate('/groups')}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Breadcrumbs items={[{ label: 'Grupos de estudio', to: '/groups' }, { label: 'Invitación' }]} />
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <MailOpen size={28} />
        </div>
        <p className="text-sm text-slate-500">@{group.creatorUsername} te invita a</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{group.name}</h1>
        {group.description && <p className="mt-2 text-sm text-slate-600">{group.description}</p>}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
          <VisibilityBadge visibility={group.visibility} />
          <span className="inline-flex items-center gap-1">
            <Users size={13} /> {group.memberCount} {group.memberCount === 1 ? 'integrante' : 'integrantes'}
          </span>
        </div>

        {group.member ? (
          <button
            type="button"
            onClick={() => goToGroup(group)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Ya eres miembro · Ir al grupo <ArrowRight size={16} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={accept}
              disabled={joining}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <UserPlus size={16} /> {joining ? 'Uniéndote...' : 'Aceptar invitación'}
            </button>
            {group.visibility === 'PRIVATE' && (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
                <Lock size={12} />
                {token ? 'Con este enlace no necesitas la contraseña.' : 'Te pediremos la contraseña del grupo.'}
              </p>
            )}
          </>
        )}
      </div>

      <JoinPrivateGroupModal
        group={askPassword ? group : null}
        onClose={() => setAskPassword(false)}
        onJoin={joinWithPassword}
        onJoined={(joined) => {
          setAskPassword(false);
          onJoined(joined);
        }}
      />
    </div>
  );
};
