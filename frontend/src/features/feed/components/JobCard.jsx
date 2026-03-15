// src/features/feed/components/JobCard.jsx
import GlassCard from "../../../shared/components/GlassCard";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  ExternalLink,
  BadgeCheck,
  Clock,
  Building2,
  DollarSign,
  Tag,
} from "lucide-react";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("vi-VN");
}

export default function JobCard({ job, index = 0 }) {
  if (!job) return null;

  const neonBorder =
    "border border-white/10 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_18px_40px_rgba(0,0,0,0.55)]";

  const hoverGlow =
    "hover:shadow-[0_0_0_1px_rgba(16,185,129,0.28),0_0_28px_rgba(16,185,129,0.14),0_18px_40px_rgba(0,0,0,0.60)]";

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <GlassCard
        className={cx(
          "p-5 rounded-2xl bg-white/[0.05] backdrop-blur-xl transition-all",
          neonBorder,
          hoverGlow
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-cyan-500/20 to-purple-500/20 border border-white/10 grid place-items-center shrink-0">
              <Briefcase className="h-5 w-5 text-emerald-200" />
            </div>

            <div className="min-w-0 flex-1">
              {/* TAGS */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-200/90 inline-flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Tuyển dụng IT
                </span>

                {job.source && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200/80">
                    {job.source}
                  </span>
                )}

                {job.jobType && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-200/90">
                    {job.jobType}
                  </span>
                )}
              </div>

              {/* TITLE */}
              <div className="mt-3 text-lg font-extrabold tracking-tight text-slate-50   line-clamp-2">
                {job.title}
              </div>

              {/* COMPANY + LOCATION */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                {job.company && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {job.company}
                  </span>
                )}

                {job.location && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}

                {job.createdAt && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Clock className="h-4 w-4" />
                    {formatDate(job.createdAt)}
                  </span>
                )}
              </div>

              {/* SALARY */}
              {job.salary && (
                <div className="mt-2 text-sm text-emerald-200 inline-flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold">{job.salary}</span>
                </div>
              )}

              {/* TAGS / STACK */}
              {job.tags && job.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tags.slice(0, 5).map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-purple-200/80 inline-flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* DESCRIPTION PREVIEW */}
              {job.description && (
                <div className="mt-3 text-sm text-slate-300 line-clamp-3">
                  {job.description}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT ACTION */}
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center
                       hover:shadow-[0_0_0_1px_rgba(16,185,129,0.28),0_0_18px_rgba(16,185,129,0.14)]"
            title="Xem chi tiết"
          >
            <ExternalLink className="h-4 w-4 text-emerald-200/90" />
          </a>
        </div>
      </GlassCard>
    </motion.div>
  );
}