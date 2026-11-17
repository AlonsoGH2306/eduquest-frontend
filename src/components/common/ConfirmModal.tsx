import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  loadingLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  loadingLabel = 'Procesando...',
  destructive = false,
  loading = false,
  icon,
  onConfirm,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={() => !loading && onClose()} title={title}>
    <div className="text-sm text-slate-600">{message}</div>
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
          destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {icon}
        {loading ? loadingLabel : confirmLabel}
      </button>
    </div>
  </Modal>
);
