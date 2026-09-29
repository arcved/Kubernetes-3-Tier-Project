import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onCancel} className="modal-sm">
      <div className="confirm">
        <div className="confirm-icon">
          <Trash2 size={24} />
        </div>
        <h2>{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal-actions stretch">
          <button className="btn ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn danger-solid" onClick={confirm} disabled={busy}>
            {busy ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
