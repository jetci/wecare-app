import React, { useRef, useEffect } from 'react';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  [key: string]: any;
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose, className, ...restProps }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) modalRef.current?.focus();
  }, [open]);
  if (!open) return null;
  const testId = (restProps['data-testid'] as string) || 'modal';
  return (
    <div
      {...restProps}
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
      ref={modalRef}
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className || ''}`}
    >
      <div className="bg-white p-4 rounded shadow relative w-full max-w-lg">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
        {title && <h2 id="modal-title" className="text-lg font-semibold mb-2">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

// Provide default and named export
export default Modal;
