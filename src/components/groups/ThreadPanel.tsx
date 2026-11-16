import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareText } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useRealtimeEvents } from '../../hooks/useRealtime';
import { ChatAttachment, GroupMessage } from '../../types';
import { extractErrorMessage, isCanceledError } from '../../utils/errors';
import { mergeById, replaceMessage } from '../../utils/chatMessages';
import { Spinner } from '../common/Spinner';
import { ChatRow } from '../chat/ChatRow';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatComposer } from '../chat/ChatComposer';
import { PanelShell } from './ChatSidePanels';

interface ThreadPanelProps {
  groupId: number;
  rootId: number;
  currentUserId?: number;
  myUsername?: string;
  mentionCandidates: string[];
  canModerate: boolean;
  onClose: () => void;
}

export const ThreadPanel: React.FC<ThreadPanelProps> = ({
  groupId,
  rootId,
  currentUserId,
  myUsername,
  mentionCandidates,
  canModerate,
  onClose,
}) => {
  const [root, setRoot] = useState<GroupMessage | null>(null);
  const [replies, setReplies] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    groupService
      .getThread(groupId, rootId, controller.signal)
      .then((thread) => {
        setRoot(thread.root);
        setReplies(thread.replies);
      })
      .catch((err) => {
        if (!isCanceledError(err)) toast.error(extractErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [groupId, rootId]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [replies.length]);

  const withMine = (message: GroupMessage) => ({ ...message, mine: message.authorId === currentUserId });

  useRealtimeEvents((event) => {
    if (event.type !== 'group.message' || event.groupId !== groupId) return;
    const message = withMine(event.message as GroupMessage);
    if (message.id === rootId) {
      setRoot(message);
    } else if (message.threadRootId === rootId) {
      setReplies((current) => (event.action === 'created' ? mergeById(current, [message]) : replaceMessage(current, message)));
    }
  });

  const send = async (content: string, attachment?: ChatAttachment) => {
    const sent = await groupService.sendMessage(groupId, { content, ...attachment, threadRootId: rootId });
    setReplies((current) => mergeById(current, [sent]));
  };

  const react = async (message: GroupMessage, emoji: string) => {
    try {
      const updated = await groupService.toggleReaction(groupId, message.id, emoji);
      if (updated.id === rootId) setRoot(updated);
      else setReplies((current) => replaceMessage(current, updated));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const remove = async (message: GroupMessage) => {
    try {
      const deleted = await groupService.deleteMessage(groupId, message.id);
      setReplies((current) => replaceMessage(current, deleted));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const renderMessage = (message: GroupMessage, isRoot: boolean) => (
    <ChatRow
      key={message.id}
      authorId={message.authorId}
      username={message.authorUsername}
      avatarUrl={message.authorAvatarUrl}
      advisor={message.authorAdvisor}
      createdAt={message.createdAt}
      grouped={false}
    >
      <MessageBubble
        message={{ ...message, mine: false }}
        currentUserId={currentUserId}
        myUsername={myUsername}
        canDelete={!isRoot && (message.authorId === currentUserId || canModerate)}
        onDelete={() => void remove(message)}
        onReact={(emoji) => void react(message, emoji)}
      />
    </ChatRow>
  );

  return (
    <PanelShell title="Hilo" icon={<MessageSquareText size={16} />} onClose={onClose}>
      {loading || !root ? (
        <Spinner label="Cargando hilo..." />
      ) : (
        <>
          <div ref={listRef} className="flex-1 overflow-y-auto pb-3">
            {renderMessage(root, true)}
            <p className="mx-4 mt-3 border-b border-slate-200 pb-1 text-xs font-semibold text-slate-400">
              {replies.length === 1 ? '1 respuesta' : `${replies.length} respuestas`}
            </p>
            {replies.map((reply) => renderMessage(reply, false))}
          </div>
          <ChatComposer
            inputId="thread-message"
            placeholder="Responder en el hilo…"
            context={null}
            resetKey={rootId}
            mentionCandidates={mentionCandidates}
            onCancelContext={() => undefined}
            onSend={send}
          />
        </>
      )}
    </PanelShell>
  );
};
