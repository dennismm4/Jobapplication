import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div className="toast-region" aria-live="polite">
      {toast && (
        <div className="toast">
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              className="toast__btn"
              onClick={() => {
                toast.undo();
                onClose();
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
