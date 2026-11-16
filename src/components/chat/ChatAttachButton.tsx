import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Paperclip } from 'lucide-react';
import { documentService } from '../../services/documentService';
import { ChatAttachment } from '../../types';
import { extractErrorMessage } from '../../utils/errors';

const MAX_FILE_MB = 10;
const MAX_IMAGE_MB = 25;
const MAX_VIDEO_MB = 50;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ACCEPTED = [
  ...IMAGE_TYPES,
  ...VIDEO_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

export const uploadChatFile = async (file: File): Promise<ChatAttachment | null> => {
  if (!ACCEPTED.includes(file.type)) {
    toast.error('Puedes enviar imágenes, videos (MP4, WebM o MOV), PDF, Word, PowerPoint, Excel o texto');
    return null;
  }
  const video = VIDEO_TYPES.includes(file.type);
  const image = IMAGE_TYPES.includes(file.type);
  const limit = video ? MAX_VIDEO_MB : image ? MAX_IMAGE_MB : MAX_FILE_MB;
  if (file.size > limit * 1024 * 1024) {
    toast.error(`${video ? 'El video' : image ? 'La imagen' : 'El archivo'} no debe superar los ${limit} MB`);
    return null;
  }
  const uploaded = await documentService.uploadFile(file);
  return IMAGE_TYPES.includes(file.type) ? { imageUrl: uploaded.url } : { fileUrl: uploaded.url, fileName: file.name };
};

interface ChatAttachButtonProps {
  disabled?: boolean;
  onUploaded: (attachment: ChatAttachment) => Promise<void>;
}

export const ChatAttachButton: React.FC<ChatAttachButtonProps> = ({ disabled, onUploaded }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const attachment = await uploadChatFile(file);
      if (attachment) await onUploaded(attachment);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} onChange={onChange} className="sr-only" tabIndex={-1} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label="Adjuntar imagen, video o archivo"
        title="Adjuntar imagen, video o archivo"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
      </button>
    </>
  );
};
