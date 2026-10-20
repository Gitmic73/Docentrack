import { AnimatePresence, motion } from 'framer-motion';

export default function ModalShell({ open, onClose, children, maxWidth = 'max-w-[500px]' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 bg-[rgba(10,20,40,0.62)] z-[1000] flex items-center justify-center p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={`bg-white rounded-xl p-6 w-full ${maxWidth} max-h-[calc(100vh-2rem)] overflow-y-auto border border-bordo shadow-[0_8px_40px_rgba(0,0,0,0.22)]`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}