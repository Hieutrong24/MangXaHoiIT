import GlassCard from "../../../shared/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cx } from "../utils/feedHelpers";

export default function ModalShell({
  open,
  title,
  onClose,
  children,
  panelClassName = "",
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              className={cx(
                "relative w-[min(1080px,96vw)] max-h-[92vh]",
                panelClassName
              )}
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard
                className={cx(
                  "relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0f172a]/94 backdrop-blur-2xl",
                  "shadow-[0_28px_100px_rgba(0,0,0,0.55)]"
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />

                <div className="relative p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="min-w-0">
                      {!!title && (
                        <div className="truncate text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
                          {title}
                        </div>
                      )}
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Dark UI system
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className={cx(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]",
                        "text-slate-300 hover:text-slate-50"
                      )}
                      title="Đóng"
                      type="button"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 max-h-[calc(92vh-92px)] overflow-y-auto pr-1">
                    {children}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
