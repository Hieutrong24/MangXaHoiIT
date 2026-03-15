import GlassCard from "../../../shared/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cx } from "../utils/feedHelpers";

export default function ModalShell({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard
              className={cx(
                "p-5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xl",
                "shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_28px_rgba(34,211,238,0.10),0_18px_50px_rgba(0,0,0,0.65)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-extrabold tracking-tight text-slate-100 truncate">
                    {title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Dark Cyber • glass • neon border
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center
                           hover:shadow-[0_0_0_1px_rgba(168,85,247,0.22),0_0_18px_rgba(168,85,247,0.12)]"
                  title="Đóng"
                >
                  <X className="h-5 w-5 text-slate-200/80" />
                </button>
              </div>

              <div className="mt-4">{children}</div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}