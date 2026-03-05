'use client';

import { useEffect, useState } from 'react';

type ToastProps = {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  durationMs?: number;
};

export function Toast({ type, message, onClose, durationMs = 3200 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 180);
    }, durationMs);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [durationMs, onClose]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 180);
  }

  const className =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-red-200 bg-red-50 text-red-700';

  return (
    <div
      className={`mb-3 flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-150 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      } ${className}`}
    >
      <p>{message}</p>
      <button
        type="button"
        className="rounded px-1 text-[10px] font-bold"
        onClick={handleClose}
        aria-label="토스트 닫기"
      >
        닫기
      </button>
    </div>
  );
}
