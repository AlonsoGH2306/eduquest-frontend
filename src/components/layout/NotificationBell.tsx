import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Bell, Calendar, CheckCheck, FileText, Megaphone, MessageCircle, UserPlus } from 'lucide-react';
import { AppNotification, NotificationType } from '../../types';
import { notificationService } from '../../services/notificationService';
import { useNotifications } from '../../hooks/useNotifications';
import { extractErrorMessage } from '../../utils/errors';
import { timeAgo } from '../../utils/relativeTime';
import { Spinner } from '../common/Spinner';

const PAGE_SIZE = 15;

const TYPE_STYLES: Record<NotificationType, { Icon: React.ElementType; className: string }> = {
  GROUP_MEMBER: { Icon: UserPlus, className: 'bg-sky-50 text-sky-700' },
  GROUP_DOCUMENT: { Icon: FileText, className: 'bg-indigo-50 text-indigo-600' },
  GROUP_SESSION: { Icon: Calendar, className: 'bg-emerald-50 text-emerald-700' },
  DIRECT_MESSAGE: { Icon: MessageCircle, className: 'bg-violet-50 text-violet-700' },
  BADGE: { Icon: Award, className: 'bg-amber-50 text-amber-700' },
  ANNOUNCEMENT: { Icon: Megaphone, className: 'bg-rose-50 text-rose-700' },
};

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { unreadNotifications, setUnreadNotifications, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(nextPage, PAGE_SIZE);
      setItems((current) => (nextPage === 0 ? data.content : [...current, ...data.content]));
      setPage(nextPage);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load(0);
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openNotification = (notification: AppNotification) => {
    if (!notification.read) {
      setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
      setUnreadNotifications((count) => Math.max(count - 1, 0));
      notificationService.markRead(notification.id).catch(() => undefined);
    }
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadNotifications(0);
    try {
      await notificationService.markAllRead();
    } catch {
      refresh();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadNotifications > 0 ? `Notificaciones, ${unreadNotifications} sin leer` : 'Notificaciones'}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-soft transition hover:bg-hover hover:text-ink"
      >
        <Bell size={18} />
        {unreadNotifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-none font-bold text-white">
            {unreadNotifications > 99 ? '99+' : unreadNotifications}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="fixed bottom-16 left-2 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Notificaciones</p>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unreadNotifications === 0 && items.every((item) => item.read)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-40"
            >
              <CheckCheck size={14} /> Marcar todo como leído
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {error && <p className="px-4 py-6 text-center text-xs text-red-600">{error}</p>}
            {!error && items.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-slate-400">
                <Bell size={28} />
                <p className="text-sm font-semibold text-slate-600">Estás al día</p>
                <p className="text-xs">Aquí verás la actividad de tus grupos, tus mensajes y tus logros.</p>
              </div>
            )}
            <ul>
              {items.map((notification) => {
                const { Icon, className } = TYPE_STYLES[notification.type] ?? TYPE_STYLES.ANNOUNCEMENT;
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        notification.read ? '' : 'bg-indigo-50/60'
                      }`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}>
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">{notification.title}</span>
                        {notification.body && (
                          <span className="mt-0.5 line-clamp-2 block text-xs text-slate-600">{notification.body}</span>
                        )}
                        <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(notification.createdAt)}</span>
                      </span>
                      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {loading && <Spinner label="Cargando..." />}
            {!loading && page + 1 < totalPages && (
              <div className="p-3 text-center">
                <button
                  type="button"
                  onClick={() => void load(page + 1)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ver anteriores
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
