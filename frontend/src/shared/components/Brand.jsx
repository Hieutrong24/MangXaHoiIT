import { motion } from "framer-motion";

export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <motion.div
        initial={{ rotate: -8, scale: 0.95, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-500 to-emerald-500 grid place-items-center text-slate-950 font-black shadow-soft"
      >
        sI
      </motion.div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight text-slate-50">sockioIT</div>
          <div className="text-xs text-slate-400">Chia sẻ kiến thức • CNTT TDMU</div>
        </div>
      )}
    </div>
  );
}
