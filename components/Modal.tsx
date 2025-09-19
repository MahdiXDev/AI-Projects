import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md mx-4 rounded-xl border border-white/20 bg-gray-800/50 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                aria-label="بستن"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="text-2xl font-sans">&times;</span>
              </button>
            </div>
            <div className="mt-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;


interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "تایید حذف", 
  cancelText = "انصراف" 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-gray-300">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};