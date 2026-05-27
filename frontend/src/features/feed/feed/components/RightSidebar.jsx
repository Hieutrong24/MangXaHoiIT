import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Flame,
  Brain,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { aiApi } from "../api/ai.api";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function pickTitle(p) {
  return p?.title || (p?.content ? String(p.content).slice(0, 80) : "Bài viết");
}

function pickExcerpt(p) {
  return p?.excerpt || (p?.content ? String(p.content).slice(0, 160) : "");
}

function buildPayload(posts = []) {
  const recentPosts = (posts || []).slice(0, 5).map((p) => ({
    title: pickTitle(p),
    tag: p?.tag || "general",
    excerpt: pickExcerpt(p).slice(0, 80),
  }));

  const recentTags = [...new Set(recentPosts.map((x) => x.tag).filter(Boolean))].slice(0, 8);

  return { recentPosts, recentTags };
}

function hashKey(payload) {
  try {
    return JSON.stringify({
      t: payload.recentTags,
      p: payload.recentPosts.map((x) => x.title).slice(0, 3),
    });
  } catch {
    return String(Date.now());
  }
}

function SidebarCard({ title, icon: Icon, children, right }) {
  return (
    <GlassCard className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-100">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">
              {title}
            </div>
          </div>
        </div>
        {right}
      </div>

      <div className="mt-4">{children}</div>
    </GlassCard>
  );
}

export default function RightSidebar({
  posts = [],
  onRefreshJobs,
  jobsLoading = false,
}) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiErr, setAiErr] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [localCache, setLocalCache] = useState(() => new Map());

  const canAskAI = !aiLoading && Date.now() > cooldownUntil;

  const payload = useMemo(() => buildPayload(posts), [posts]);
  const cacheKey = useMemo(() => hashKey(payload), [payload]);

  const handleAi = async () => {
    if (!canAskAI) return;

    setAiErr("");

    const hit = localCache.get(cacheKey);
    if (hit && hit.exp > Date.now()) {
      setAiText(hit.text);
      setCooldownUntil(Date.now() + 10_000);
      return;
    }

    setAiLoading(true);

    try {
      const data = await aiApi.getSuggestion(payload);

      const suggestion =
        data?.suggestion ||
        data?.data?.suggestion ||
        data?.data ||
        data;

      const text = String(suggestion || "").trim();

      if (!text) {
        throw new Error("Empty suggestion");
      }

      setAiText(text);

      setLocalCache((m) => {
        const next = new Map(m);
        next.set(cacheKey, {
          text,
          exp: Date.now() + 120_000,
        });
        return next;
      });

      setCooldownUntil(Date.now() + 20_000);
    } catch (e) {
      console.error(e);

      const msg = String(e?.response?.data?.message || e?.message || "");

      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        setAiErr("AI đang quá tải/quota. Thử lại sau 1–2 phút nhé.");
        setCooldownUntil(Date.now() + 60_000);
      } else if (msg.toLowerCase().includes("unauthorized")) {
        setAiErr("Bạn cần đăng nhập để dùng AI gợi ý.");
        setCooldownUntil(Date.now() + 30_000);
      } else {
        setAiErr("AI gặp lỗi. Thử lại sau.");
        setCooldownUntil(Date.now() + 30_000);
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 xl:sticky xl:top-6 xl:self-start">
      <SidebarCard
        title="Online friends"
        icon={Users}
        right={
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
            12 online
          </span>
        }
      >
        <div className="space-y-2.5">
          {["khoi.dev", "hieu.it", "linh.sql", "minh.react"].map((u) => (
            <div
              key={u}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 transition hover:border-cyan-400/20 hover:bg-slate-950"
            >
              <div className="relative h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700 to-slate-950">
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#111827] bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-100">
                  @{u}
                </div>
                <div className="text-xs text-slate-500">Đang hoạt động</div>
              </div>
            </div>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard
        title="Trending tags"
        icon={Flame}
        right={
          typeof onRefreshJobs === "function" ? (
            <button
              type="button"
              onClick={onRefreshJobs}
              disabled={jobsLoading}
              className={cx(
                "inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]",
                jobsLoading && "cursor-not-allowed opacity-60"
              )}
              title="Làm mới job"
            >
              <RefreshCw
                className={cx("h-4 w-4", jobsLoading ? "animate-spin" : "")}
              />
              {jobsLoading ? "Đang..." : "Jobs"}
            </button>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-2">
          {["#dsa", "#sql", "#react", "#nodejs", "#ai", "#system"].map((t) => (
            <button
              key={t}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-[11px] font-medium text-slate-200 transition hover:border-violet-400/20 hover:bg-violet-400/10"
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </SidebarCard>

      <SidebarCard
        title="AI gợi ý"
        icon={Brain}
        right={
          <button
            type="button"
            onClick={handleAi}
            disabled={!canAskAI}
            className={cx(
              "inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]",
              !canAskAI && "cursor-not-allowed opacity-60"
            )}
            title={!canAskAI ? "Đợi một chút để tránh quota" : "Làm mới gợi ý"}
          >
            <RefreshCw
              className={cx("h-4 w-4", aiLoading ? "animate-spin" : "")}
            />
            {aiLoading ? "Đang..." : "Làm mới"}
          </button>
        }
      >
        <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized hints
          </div>

          <div className="mt-3 min-h-[112px] text-sm leading-7 text-slate-300">
            {aiLoading && (
              <div className="text-slate-300">
                AI đang phân tích… <span className="text-cyan-200">glow mode</span>
              </div>
            )}

            {!aiLoading && aiErr && (
              <div className="flex items-start gap-2 text-rose-200/90">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{aiErr}</span>
              </div>
            )}

            {!aiLoading && !aiErr && !aiText && (
              <div>
                Nhấn <span className="font-semibold text-violet-200">Làm mới</span> để nhận gợi ý cá nhân hoá.
              </div>
            )}

            {!aiLoading && !aiErr && aiText && (
              <motion.div
                key={aiText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-200"
              >
                {aiText}
              </motion.div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04]"
              onClick={handleAi}
              disabled={!canAskAI}
            >
              {aiLoading ? "Đang xử lý..." : "Lấy gợi ý"}
            </Button>

            <Button
              className="flex-1 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-slate-50 hover:bg-cyan-400/15"
              onClick={() => {}}
              disabled={!aiText || aiLoading}
            >
              Apply
            </Button>
          </div>

          {!canAskAI && (
            <div className="mt-3 text-[11px] text-slate-500">
              Anti-spam đang bật để tránh quota. Hãy đợi một chút rồi thử lại.
            </div>
          )}
        </div>
      </SidebarCard>
    </div>
  );
}