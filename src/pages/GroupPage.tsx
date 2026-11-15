import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Compass, Plus, Search, Users, X } from 'lucide-react';
import { GroupResponse } from '../types';
import { useGroups } from '../hooks/useGroups';
import { useMyGroups } from '../hooks/useMyGroups';
import { usePageParams } from '../hooks/usePageParams';
import { useDebounce } from '../hooks/useDebounce';
import { useGroupCodeMatch } from '../hooks/useGroupCodeMatch';
import { extractErrorMessage, getErrorStatus } from '../utils/errors';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PaginationBar } from '../components/common/PaginationBar';
import { TabButton } from '../components/common/TabButton';
import { UnreadBadge } from '../components/common/UnreadBadge';
import { GroupCard } from '../components/groups/GroupCard';
import { MyGroupRow } from '../components/groups/MyGroupRow';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { JoinPrivateGroupModal } from '../components/groups/JoinPrivateGroupModal';

type GroupsView = 'mine' | 'explore';

export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const { page, size, setPage, setSize, searchParams, updateParams } = usePageParams();
  const view: GroupsView = searchParams.get('view') === 'explore' ? 'explore' : 'mine';
  const searchParam = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput.trim(), 400);

  const myGroups = useMyGroups();
  const { groups, totalElements, totalPages, loading, error, reload, createGroup, joinGroup } = useGroups(
    page,
    size,
    searchParam
  );
  const { match: codeMatch, searching: searchingCode } = useGroupCodeMatch(debouncedSearch);

  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [privateTarget, setPrivateTarget] = useState<GroupResponse | null>(null);

  const { refresh: refreshMyGroups } = myGroups;
  useEffect(() => {
    refreshMyGroups();
  }, [refreshMyGroups]);

  useEffect(() => {
    if (debouncedSearch !== searchParam) {
      updateParams({ search: debouncedSearch || null, page: '0' }, true);
    }
  }, [debouncedSearch, searchParam, updateParams]);

  const changeView = (next: GroupsView) => updateParams({ view: next === 'mine' ? null : next, page: '0' });

  const openGroup = (group: GroupResponse) => navigate(`/groups/${group.id}`, { state: { group } });

  const afterJoin = (group: GroupResponse) => {
    myGroups.refresh();
    openGroup(group);
  };

  const handleJoin = async (group: GroupResponse) => {
    if (group.visibility === 'PRIVATE') {
      setPrivateTarget(group);
      return;
    }
    setJoiningId(group.id);
    try {
      const joined = await joinGroup(group.id);
      toast.success(`¡Te uniste al grupo "${joined.name}"!`);
      afterJoin(joined);
    } catch (err) {
      if (getErrorStatus(err) === 409) {
        afterJoin({ ...group, member: true });
        return;
      }
      toast.error(extractErrorMessage(err));
    } finally {
      setJoiningId(null);
    }
  };

  const renderMine = () => {
    if (myGroups.loading) return <SkeletonCard count={3} />;
    if (myGroups.error) return <ErrorState message={myGroups.error} onRetry={myGroups.refresh} />;
    if (myGroups.groups.length === 0) {
      return (
        <EmptyState
          title="Todavía no perteneces a ningún grupo"
          description="Explora los grupos públicos, busca uno privado con su código o crea el tuyo."
          actionLabel="Explorar grupos"
          onAction={() => changeView('explore')}
        />
      );
    }
    return (
      <div className="space-y-3">
        {myGroups.groups.map((group) => (
          <MyGroupRow key={group.id} group={group} />
        ))}
      </div>
    );
  };

  const renderExplore = () => (
    <>
      <div role="search" className="mb-6">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busca por nombre o pega el código de un grupo privado (ej. K7P2QX)"
            aria-label="Buscar grupos por nombre o código"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-10 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Limpiar búsqueda"
              className="absolute inset-y-0 right-2 my-auto h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={15} className="mx-auto" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Los grupos públicos se encuentran por nombre. Los privados solo aparecen si escribes su código exacto.
        </p>
      </div>

      {(codeMatch || searchingCode) && (
        <section className="mb-8" aria-label="Grupo encontrado por código">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">Coincidencia por código</h2>
          {codeMatch ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <GroupCard group={codeMatch} onJoin={handleJoin} joiningId={joiningId} />
            </div>
          ) : (
            <SkeletonCard count={1} />
          )}
        </section>
      )}

      {loading ? (
        <SkeletonCard count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : groups.length === 0 ? (
        searchParam ? (
          codeMatch ? null : (
            <EmptyState
              title={`No hay grupos públicos con "${searchParam}"`}
              description="Prueba con otro nombre. Si es un grupo privado, pide su código de 6 caracteres."
              actionLabel="Limpiar búsqueda"
              onAction={() => setSearchInput('')}
            />
          )
        ) : (
          <EmptyState
            title="No hay grupos públicos todavía"
            description="Crea el primer grupo para tu curso o busca uno privado con el código que te compartieron."
            actionLabel="Crear grupo"
            onAction={() => setIsCreateOpen(true)}
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} onJoin={handleJoin} joiningId={joiningId} />
            ))}
          </div>
          <PaginationBar
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={setPage}
            onSizeChange={setSize}
          />
        </>
      )}
    </>
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Grupos de estudio' }]} />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grupos de estudio</h1>
          <p className="text-sm text-slate-500">Tus grupos con sus novedades, y nuevos grupos para unirte.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <Plus size={16} /> Crear grupo
        </button>
      </div>

      <div role="tablist" className="mb-6 flex gap-2 border-b border-slate-200">
        <TabButton
          active={view === 'mine'}
          onClick={() => changeView('mine')}
          icon={<Users size={15} />}
          label={`Mis grupos (${myGroups.groups.length})`}
        />
        {myGroups.totalUnread > 0 && view !== 'mine' && (
          <span className="-ml-3 self-center">
            <UnreadBadge count={myGroups.totalUnread} />
          </span>
        )}
        <TabButton
          active={view === 'explore'}
          onClick={() => changeView('explore')}
          icon={<Compass size={15} />}
          label="Explorar"
        />
      </div>

      {view === 'mine' ? renderMine() : renderExplore()}

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createGroup}
        onCreated={(created) => {
          setIsCreateOpen(false);
          afterJoin(created);
        }}
      />

      <JoinPrivateGroupModal
        group={privateTarget}
        onClose={() => setPrivateTarget(null)}
        onJoin={joinGroup}
        onJoined={(joined) => {
          setPrivateTarget(null);
          afterJoin(joined);
        }}
      />
    </div>
  );
};
