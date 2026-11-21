import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * ConfirmDialog component implementing role="alertdialog"
 * with focus trapping, Escape cancellation, and focus restoration to the trigger element.
 */
export function ConfirmDialog({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel
}) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement;

      // Bring focus directly to the safe Cancel or Confirm button
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
          return;
        }

        if (e.key === 'Tab' && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll('button');
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus to trigger when closing
        if (previouslyFocusedElement.current && typeof previouslyFocusedElement.current.focus === 'function') {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="modal-backdrop modal-backdrop--alert"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal-container modal-container--alert"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-desc"
      >
        <div className="alert-dialog__icon-wrap">
          <AlertTriangle size={24} className="alert-dialog__icon" aria-hidden="true" />
        </div>

        <div className="alert-dialog__content">
          <h2 id="alert-dialog-title" className="alert-dialog__title">
            Delete "{taskTitle}"?
          </h2>
          <p id="alert-dialog-desc" className="alert-dialog__desc">
            This task will be permanently removed. This action cannot be undone.
          </p>
        </div>

        <div className="modal-actions alert-dialog__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>Delete Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
