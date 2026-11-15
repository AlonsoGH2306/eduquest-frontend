import React from 'react';
import { Modal } from '../common/Modal';
import { StudySessionResponse } from '../../types';

interface RecordingPlayerModalProps {
  session: StudySessionResponse | null;
  onClose: () => void;
}

export const RecordingPlayerModal: React.FC<RecordingPlayerModalProps> = ({ session, onClose }) => (
  <Modal
    isOpen={Boolean(session?.recordingVideoId)}
    onClose={onClose}
    title={session?.recordingTitle || session?.title || 'Grabación'}
    size="xl"
  >
    {session?.recordingVideoId && (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${session.recordingVideoId}`}
          title={`Grabación de ${session.title}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )}
  </Modal>
);
