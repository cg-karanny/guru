'use client';

import { useEffect } from 'react';
import styles from './SwalAlert.module.css';

type SwalAlertProps = {
  open: boolean;
  type?: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
};

export default function SwalAlert({ open, type = 'success', title, message, onClose }: SwalAlertProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="swal-title" aria-describedby="swal-message">
        <div className={`${styles.icon} ${type === 'success' ? styles.success : styles.error}`} aria-hidden="true">
          {type === 'success' ? (
            <svg viewBox="0 0 52 52"><path d="M14 27l8 8 17-18" /></svg>
          ) : <span>!</span>}
        </div>
        <h2 id="swal-title">{title}</h2>
        <p id="swal-message">{message}</p>
        <button type="button" className={styles.confirm} autoFocus onClick={onClose}>OK</button>
      </section>
    </div>
  );
}
