import { useEffect, useCallback } from 'react';

export default function Modal({ title, children, onSave, onClose }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={onSave}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
