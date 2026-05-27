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

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <GlassCard
        className={cx(
          "group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111827]/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-200 sm:p-5",
          "hover:-translate-y-0.5 hover:border-emerald-400/20 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_24px_70px_rgba(0,0,0,0.5)]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)] opacity-80" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/20 via-slate-800 to-slate-950 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Briefcase className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Tuyển dụng IT
                </span>

                {job.source && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                    {job.source}
                  </span>
                )}

                {job.jobType && (
                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                    {job.jobType}
                  </span>
                )}
              </div>

              <div className="mt-3 text-lg font-semibold tracking-tight text-slate-50 sm:text-[21px]">
                {job.title}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                {job.company && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    {job.company}
                  </span>
                )}

                {job.location && (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}

                {job.createdAt && (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-4 w-4" />
                    {formatDate(job.createdAt)}
                  </span>
                )}
              </div>

              {job.salary && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">{job.salary}</span>
                </div>
              )}

              {job.tags && job.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.slice(0, 5).map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[11px] text-slate-300"
                    >
                      <Tag className="h-3 w-3 text-violet-300" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {job.description && (
                <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-slate-300">
                  {job.description}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end lg:justify-start">
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-50"
              title="Xem chi tiết"
            >
              Xem chi tiết
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
