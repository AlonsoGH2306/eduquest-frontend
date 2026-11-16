import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, matchPath, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { Spinner } from '../common/Spinner';
import { EmailVerificationBanner } from '../auth/EmailVerificationBanner';
import { OfflineBanner } from './OfflineBanner';
import { ServerRail } from './ServerRail';
import { SideNav } from './SideNav';
import { useMyGroups } from '../../hooks/useMyGroups';
import { useNotifications } from '../../hooks/useNotifications';

export const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { totalUnread } = useMyGroups();
  const { unreadMessages } = useNotifications();
  const pending = totalUnread + unreadMessages;
  const immersive = Boolean(matchPath('/groups/:groupId', pathname) || matchPath('/messages/*', pathname));
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-ink">
      <div className="hidden md:flex">
        <ServerRail />
        {!immersive && <SideNav />}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="flex shadow-2xl">
            <ServerRail onNavigate={closeDrawer} />
            <SideNav onNavigate={closeDrawer} />
          </div>
          <button type="button" aria-label="Cerrar menú" onClick={closeDrawer} className="flex-1 bg-black/60" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-black/10 px-3 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={pending > 0 ? `Abrir menú, ${pending} novedades` : 'Abrir menú'}
            aria-expanded={drawerOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-soft hover:bg-hover"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            {pending > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
            <BookOpen size={20} className="text-indigo-500" /> EduQuest
          </Link>
        </header>
        <OfflineBanner />
        <EmailVerificationBanner />
        {immersive ? (
          <main id="contenido" className="min-h-0 flex-1 overflow-hidden">
            <Suspense fallback={<Spinner label="Cargando..." />}>
              <Outlet />
            </Suspense>
          </main>
        ) : (
          <main ref={mainRef} id="contenido" className="eq-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
              <Suspense fallback={<Spinner label="Cargando..." />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
