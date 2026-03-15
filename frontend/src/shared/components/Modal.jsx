// src/shared/components/Modal.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-soft"
            initial={{ y: 12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="font-extrabold">{title}</div>
              <button className="text-slate-300 hover:text-white" onClick={onClose}>
                ✕
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
