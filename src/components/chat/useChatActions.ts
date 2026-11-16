import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { ChatAttachment } from '../../types';
import { ComposerContext } from './ChatComposer';
import { BubbleMessage } from './MessageBubble';
import { extractErrorMessage } from '../../utils/errors';
import { previewOf } from '../../utils/chatMessages';

interface ChatActionHandlers {
  sendMessage: (content: string, attachment?: ChatAttachment, replyToId?: number) => Promise<void>;
  editMessage: (messageId: number, content: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
}

export function useChatActions({ sendMessage, editMessage, deleteMessage }: ChatActionHandlers) {
  const [context, setContext] = useState<ComposerContext | null>(null);
  const [toDelete, setToDelete] = useState<BubbleMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reply = useCallback((message: BubbleMessage, authorUsername: string) => {
    setContext({ mode: 'reply', messageId: message.id, label: `Respondiendo a @${authorUsername}:`, preview: previewOf(message) });
  }, []);

  const edit = useCallback((message: BubbleMessage) => {
    setContext({
      mode: 'edit',
      messageId: message.id,
      label: 'Editando:',
      preview: previewOf(message),
      initialText: message.content,
    });
  }, []);

  const send = useCallback(
    async (content: string, attachment?: ChatAttachment) => {
      if (context?.mode === 'edit') {
        await editMessage(context.messageId, content);
      } else {
        await sendMessage(content, attachment, context?.mode === 'reply' ? context.messageId : undefined);
      }
      setContext(null);
    },
    [context, editMessage, sendMessage]
  );

  const confirmDelete = useCallback(async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteMessage(toDelete.id);
      if (context?.messageId === toDelete.id) setContext(null);
      setToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }, [toDelete, deleteMessage, context]);

  const jumpTo = useCallback((messageId: number) => {
    const element = document.getElementById(`chat-message-${messageId}`);
    if (!element) {
      toast('Ese mensaje es más antiguo; carga los anteriores para verlo.');
      return;
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('chat-highlight');
    window.setTimeout(() => element.classList.remove('chat-highlight'), 1600);
  }, []);

  return {
    context,
    setContext,
    reply,
    edit,
    send,
    toDelete,
    setToDelete,
    deleting,
    confirmDelete,
    jumpTo,
  };
}
