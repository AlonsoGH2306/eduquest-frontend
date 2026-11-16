import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Spinner } from '../common/Spinner';
import { RichText } from '../chat/RichText';
import { groupService } from '../../services/groupService';
import { ChannelSummary } from '../../types';
import { extractErrorMessage } from '../../utils/errors';

interface SummaryModalProps {
  groupId: number;
  channelId: number | null;
  channelName: string;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ groupId, channelId, channelName, onClose }) => {
  const [summary, setSummary] = useState<ChannelSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channelId === null) return;
    let cancelled = false;
    setSummary(null);
    setError(null);
    groupService
      .summarizeChannel(groupId, channelId)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, channelId]);

  return (
    <Modal isOpen={channelId !== null} onClose={onClose} title={`Ponme al día · #${channelName}`}>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !summary ? (
        <Spinner label="Leyendo el canal..." />
      ) : (
        <div className="space-y-3">
          <div className="text-sm leading-relaxed text-slate-700">
            <RichText content={summary.summary} />
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles size={12} />
            {summary.generatedByAi ? 'Resumen generado con IA' : 'Resumen básico'} a partir de {summary.messageCount}{' '}
            {summary.messageCount === 1 ? 'mensaje' : 'mensajes'}. Revisa el canal si necesitas el detalle.
          </p>
        </div>
      )}
    </Modal>
  );
};
