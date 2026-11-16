import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessagesSquare, Search, Users, X } from 'lucide-react';
import { searchService } from '../../services/searchService';
import { useDebounce } from '../../hooks/useDebounce';
import { GlobalSearchResult } from '../../types';
import { isCanceledError } from '../../utils/errors';
import { UserAvatar } from '../common/UserAvatar';

interface ResultItem {
  key: string;
  label: string;
  subtitle?: string | null;
  to: string;
  icon: React.ReactNode;
}

const toItems = (result: GlobalSearchResult): { title: string; items: ResultItem[] }[] =>
  [
    {
      title: 'Materiales',
      items: result.documents.map((hit) => ({
        key: `d${hit.id}`,
        label: hit.title,
        subtitle: hit.subtitle,
        to: `/documents?search=${encodeURIComponent(hit.title)}`,
        icon: <FileText size={14} />,
      })),
    },
    {
      title: 'Grupos',
      items: result.groups.map((hit) => ({
        key: `g${hit.id}`,
        label: hit.title,
        subtitle: hit.subtitle,
        to: `/groups/${hit.id}`,
        icon: <Users size={14} />,
      })),
    },
    {
      title: 'Foro',
      items: result.questions.map((hit) => ({
        key: `q${hit.id}`,
        label: hit.title,
        subtitle: hit.subtitle,
        to: `/forum/${hit.id}`,
        icon: <MessagesSquare size={14} />,
      })),
    },
    {
      title: 'Personas',
      items: result.users.map((person) => ({
        key: `u${person.id}`,
        label: `@${person.username}`,
        subtitle: person.advisor ? 'Asesor' : null,
        to: `/users/${person.id}`,
        icon: <UserAvatar username={person.username} avatarUrl={person.avatarUrl} size={18} />,
      })),
    },
  ].filter((section) => section.items.length > 0);

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const debounced = useDebounce(query.trim(), 300);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', close);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', close);
    };
  }, []);

  useEffect(() => {
    if (debounced.length < 2) {
      setResult(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    searchService
      .search(debounced, controller.signal)
      .then((data) => {
        setResult(data);
        setHighlighted(0);
      })
      .catch((err) => {
        if (!isCanceledError(err)) setResult(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debounced]);

  const sections = result ? toItems(result) : [];
  const flat = sections.flatMap((section) => section.items);

  const go = (item: ResultItem) => {
    navigate(item.to);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative hidden lg:block">
      <label htmlFor="global-search" className="sr-only">
        Buscar en EduQuest
      </label>
      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-indigo-400">
        <Search size={14} className="text-slate-400" />
        <input
          id="global-search"
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && flat.length > 0) {
              event.preventDefault();
              setHighlighted((current) => (current + 1) % flat.length);
            } else if (event.key === 'ArrowUp' && flat.length > 0) {
              event.preventDefault();
              setHighlighted((current) => (current - 1 + flat.length) % flat.length);
            } else if (event.key === 'Enter' && flat[highlighted]) {
              go(flat[highlighted]);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Buscar (Ctrl+K)"
          className="w-40 bg-transparent text-xs focus:outline-hidden xl:w-52"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda" className="text-slate-400">
            <X size={12} />
          </button>
        )}
      </div>
      {open && debounced.length >= 2 && (
        <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {loading && !result && <p className="p-3 text-xs text-slate-400">Buscando...</p>}
          {result && sections.length === 0 && <p className="p-3 text-xs text-slate-500">Sin resultados para «{debounced}».</p>}
          {sections.map((section) => (
            <div key={section.title} className="mb-1">
              <p className="px-2 pt-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">{section.title}</p>
              {section.items.map((item) => {
                const index = flat.indexOf(item);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => go(item)}
                    onMouseEnter={() => setHighlighted(index)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${
                      index === highlighted ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="shrink-0 text-slate-500">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-800">{item.label}</span>
                      {item.subtitle && <span className="block truncate text-[11px] text-slate-500">{item.subtitle}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
