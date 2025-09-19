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
            className="relative w-full max-w-md mx-4 rounded-xl border border-black/20 dark:border-white/20 bg-gray-200 dark:bg-gray-800/50 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                aria-label="بستن"
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
              >
                <span className="w-6 h-6 flex items-center justify-center text-2xl font-light">&times;</span>
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
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "تایید", 
  cancelText = "انصراف",
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg bg-gray-300 dark:bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-800 dark:text-white transition-colors duration-300 hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ${
              isDestructive 
              ? 'bg-red-600 shadow-lg shadow-red-600/30 hover:bg-red-500' 
              : 'bg-sky-600 shadow-lg shadow-sky-600/30 hover:bg-sky-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={imageUrl} 
              alt="نمایش بزرگ‌تر تصویر" 
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl shadow-black/50"
            />
          </motion.div>
           <button
                onClick={onClose}
                aria-label="بستن تصویر"
                className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/50 hover:bg-black/80 transition-colors duration-200 z-[70]"
              >
                <span className="w-6 h-6 flex items-center justify-center text-2xl font-light">&times;</span>
            </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};