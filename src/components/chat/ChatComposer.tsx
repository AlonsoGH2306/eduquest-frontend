import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Bold, Code, CornerUpLeft, Italic, List, Pencil, Send, X } from 'lucide-react';
import { ChatAttachment } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { MENTION_QUERY } from '../../utils/richText';
import { ChatAttachButton } from './ChatAttachButton';
import { StickerPicker } from './StickerPicker';

const MAX_LENGTH = 1000;
const MAX_SUGGESTIONS = 6;

export interface ComposerContext {
  mode: 'reply' | 'edit';
  messageId: number;
  label: string;
  preview: string;
  initialText?: string;
}

interface ChatComposerProps {
  inputId: string;
  placeholder: string;
  context: ComposerContext | null;
  resetKey?: string | number;
  mentionCandidates?: string[];
  extraActions?: React.ReactNode;
  onCancelContext: () => void;
  onSend: (content: string, attachment?: ChatAttachment) => Promise<void>;
  onTyping?: () => void;
}

const formatButton =
  'rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40';

export const ChatComposer: React.FC<ChatComposerProps> = ({
  inputId,
  placeholder,
  context,
  resetKey,
  mentionCandidates = [],
  extraActions,
  onCancelContext,
  onSend,
  onTyping,
}) => {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [caret, setCaret] = useState(0);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const savedDraft = useRef('');
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const contextKey = context ? `${context.mode}:${context.messageId}` : null;
  const initialText = context?.mode === 'edit' ? (context.initialText ?? '') : null;
  const editing = context?.mode === 'edit';

  useEffect(() => {
    setDraft('');
    savedDraft.current = '';
  }, [resetKey]);

  useEffect(() => {
    if (!contextKey) return;
    if (initialText !== null) {
      savedDraft.current = draftRef.current;
      setDraft(initialText);
    }
    inputRef.current?.focus();
  }, [contextKey, initialText]);

  const mentionQuery = useMemo(() => MENTION_QUERY.exec(draft.slice(0, caret))?.[1] ?? null, [draft, caret]);
  const suggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.toLowerCase();
    return mentionCandidates.filter((name) => name.toLowerCase().startsWith(query)).slice(0, MAX_SUGGESTIONS);
  }, [mentionQuery, mentionCandidates]);

  useEffect(() => setHighlighted(0), [mentionQuery]);

  const cancel = () => {
    if (editing) setDraft(savedDraft.current);
    onCancelContext();
  };

  const run = async (content: string, attachment?: ChatAttachment) => {
    setSending(true);
    try {
      await onSend(content, attachment);
      setDraft(editing ? savedDraft.current : '');
      savedDraft.current = '';
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    void run(content);
  };

  const replaceRange = (start: number, end: number, text: string, cursor: number) => {
    const next = draft.slice(0, start) + text + draft.slice(end);
    setDraft(next.slice(0, MAX_LENGTH));
    window.requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(cursor, cursor);
      setCaret(cursor);
    });
  };

  const insertMention = (username: string) => {
    const start = caret - (mentionQuery?.length ?? 0);
    const text = `${username} `;
    replaceRange(start, caret, text, start + text.length);
  };

  const wrapSelection = (marker: string) => {
    const input = inputRef.current;
    if (!input) return;
    const { selectionStart, selectionEnd } = input;
    const selected = draft.slice(selectionStart, selectionEnd) || 'texto';
    replaceRange(selectionStart, selectionEnd, `${marker}${selected}${marker}`, selectionStart + marker.length + selected.length);
  };

  const insertList = () => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const prefix = start === 0 || draft[start - 1] === '\n' ? '- ' : '\n- ';
    replaceRange(start, input.selectionEnd, prefix, start + prefix.length);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setHighlighted((current) => (current + step + suggestions.length) % suggestions.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        insertMention(suggestions[highlighted]);
        return;
      }
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape' && context) {
      cancel();
    }
  };

  return (
    <div className="px-4 pb-4">
      {context && (
        <div className="flex items-center gap-2 rounded-t-lg bg-slate-50 px-3 py-2 text-xs">
          {context.mode === 'reply' ? (
            <CornerUpLeft size={14} className="shrink-0 text-indigo-600" />
          ) : (
            <Pencil size={14} className="shrink-0 text-indigo-600" />
          )}
          <p className="min-w-0 flex-1 truncate text-slate-600">
            <span className="font-semibold text-slate-800">{context.label}</span> {context.preview}
          </p>
          <button
            type="button"
            onClick={cancel}
            aria-label={context.mode === 'reply' ? 'Cancelar respuesta' : 'Cancelar edición'}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-0.5 py-1">
        <button type="button" onClick={() => wrapSelection('**')} className={formatButton} aria-label="Negrita" title="Negrita">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => wrapSelection('*')} className={formatButton} aria-label="Cursiva" title="Cursiva">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => wrapSelection('`')} className={formatButton} aria-label="Código" title="Código">
          <Code size={14} />
        </button>
        <button type="button" onClick={insertList} className={formatButton} aria-label="Lista" title="Lista">
          <List size={14} />
        </button>
        <span className="ml-auto hidden text-[10px] text-slate-400 sm:inline">
          Escribe @ para mencionar · Shift+Enter para salto de línea
        </span>
      </div>
      <form onSubmit={submit} className="relative flex items-end gap-1 rounded-lg bg-slate-100 px-2 py-1.5">
        {!editing && (
          <>
            <ChatAttachButton disabled={sending} onUploaded={(attachment) => run(draft.trim(), attachment)} />
            <StickerPicker disabled={sending} onPick={(sticker) => run('', { sticker })} />
            {extraActions}
          </>
        )}
        {suggestions.length > 0 && (
          <ul
            role="listbox"
            aria-label="Mencionar a"
            className="absolute bottom-full left-3 z-30 mb-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((name, index) => (
              <li key={name} role="option" aria-selected={index === highlighted}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    insertMention(name);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-sm ${
                    index === highlighted ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  @{name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label htmlFor={inputId} className="sr-only">
          Escribe un mensaje
        </label>
        <textarea
          id={inputId}
          ref={inputRef}
          rows={1}
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => {
            setDraft(event.target.value);
            setCaret(event.target.selectionStart);
            if (event.target.value.trim()) onTyping?.();
          }}
          onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
          onKeyDown={onKeyDown}
          placeholder={editing ? 'Edita tu mensaje (Esc para cancelar)' : placeholder}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label={editing ? 'Guardar cambios' : 'Enviar mensaje'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-indigo-500 transition hover:bg-slate-200 disabled:text-slate-400 disabled:opacity-60"
        >
          {editing ? <Pencil size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};
