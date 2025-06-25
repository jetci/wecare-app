import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BroadcastModal({ open, onClose, children }: React.PropsWithChildren<BroadcastModalProps>) {
  return (
    <AnimatePresence>
      {open && (
        <div data-testid="broadcast-modal-overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            className="bg-white p-4 rounded shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Broadcast Modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {children}
            <button
data-testid="broadcast-modal-close"
className="mt-4 text-blue-600 hover:underline"
onClick={onClose}
>Close</button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
