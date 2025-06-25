import React, { useEffect, useRef } from 'react';







type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({ open, title, message, onConfirm, onCancel }: Props) {
  if (!open) return null;

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={e => e.stopPropagation()}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="bg-white rounded-lg p-6 w-80 focus:outline-none">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold mb-2">{title}</h2>
        <p id="confirm-dialog-desc" className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >ยกเลิก</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}
