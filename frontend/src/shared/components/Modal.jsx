// src/shared/components/Modal.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/5"
            initial={{ y: 12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-5 py-4">
              <div className="pr-4 text-base font-extrabold tracking-tight text-slate-50">{title}</div>
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/15 hover:bg-white/10 hover:text-white"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div className="max-h-[min(70vh,720px)] overflow-y-auto p-5 text-slate-200 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
