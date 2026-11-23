'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/lib/shared';

interface ConfirmDangerModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  withReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
  onConfirm: (reason?: string) => Promise<void> | void;
  onClose: () => void;
}

/**
 * In-app danger confirmation dialog replacing browser native window.confirm().
 */
export function ConfirmDangerModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer la suppression',
  cancelLabel = 'Annuler',
  busy = false,
  withReason = false,
  reasonLabel = 'Motif (optionnel)',
  reasonPlaceholder = 'Précisez un motif si nécessaire…',
  reasonRequired = false,
  onConfirm,
  onClose,
}: ConfirmDangerModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const isBusy = busy || submitting;

  const handleClose = () => {
    if (isBusy) return;
    setReason('');
    onClose();
  };

  return (
    <Modal
      title={title}
      icon={<AlertTriangle size={20} />}
      onClose={handleClose}
    >
      <form
        onSubmit={async e => {
          e.preventDefault();
          if (isBusy) return;
          setSubmitting(true);
          try {
            await onConfirm(withReason ? reason.trim() || undefined : undefined);
            setReason('');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="pc-danger-confirm-box">
          <p>{message}</p>
        </div>
        {withReason && (
          <label className="form-field">
            {reasonLabel}
            <textarea
              rows={3}
              required={reasonRequired}
              disabled={isBusy}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
            />
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="outline-btn" disabled={isBusy} onClick={handleClose}>
            {cancelLabel}
          </button>
          <button type="submit" className="pc-danger-btn" disabled={isBusy}>
            {isBusy ? 'Traitement…' : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
