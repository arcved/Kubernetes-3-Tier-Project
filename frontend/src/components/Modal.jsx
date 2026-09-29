import { useEffect } from 'react';

export default function Modal({ onClose, className = '', children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
