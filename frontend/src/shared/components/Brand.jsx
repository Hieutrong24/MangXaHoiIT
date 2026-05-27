import { motion } from "framer-motion";

export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3 select-none min-w-0">
      <motion.div
        initial={{ rotate: -8, scale: 0.95, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 text-[15px] font-black text-slate-950 shadow-[0_12px_30px_rgba(59,130,246,0.35)]"
      >
        <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
        <span className="relative">sI</span>
      </motion.div>

      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-extrabold tracking-tight text-[var(--text-primary)] sm:text-base">
            sockioIT
          </div>
          <div className="truncate text-[11px] text-[var(--text-muted)] sm:text-xs">
            Chia sẻ kiến thức • CNTT TDMU
          </div>
        </div>
      )}
    </div>
  );
}
