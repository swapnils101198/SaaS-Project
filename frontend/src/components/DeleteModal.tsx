import { useEffect, useRef } from 'react';
import type { ApiResource } from '../types/resource';

interface DeleteModalProps {
  isOpen: boolean;
  resource: ApiResource | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteModal({
  isOpen,
  resource,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content modal-content-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="modal-header">
          <h2 id="delete-dialog-title" className="modal-title text-danger">
            Delete Resource
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close confirmation dialog"
          >
            &times;
          </button>
        </div>

        <div className="delete-modal-body">
          <p>
            Are you sure you want to delete <strong>{resource.name}</strong>?
          </p>
          <p className="delete-modal-subtext">
            Endpoint <code>{resource.endpoint}</code> will be removed from health tracking. This action cannot be undone.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            ref={cancelBtnRef}
            className="button button-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button-danger"
            onClick={() => onConfirm(resource.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
