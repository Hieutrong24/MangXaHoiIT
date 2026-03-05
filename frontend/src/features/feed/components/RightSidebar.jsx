// src/features/feed/components/RightSidebar.jsx
import { useMemo, useState } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { Users, Flame, Brain, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
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
  // ✅ Giảm token: chỉ gửi title + tag + excerpt ngắn
  const recentPosts = (posts || []).slice(0, 5).map((p) => ({
    title: pickTitle(p),
    tag: p?.tag || "general",
    excerpt: pickExcerpt(p).slice(0, 80),
  }));

  const recentTags = [...new Set(recentPosts.map((x) => x.tag).filter(Boolean))].slice(0, 8);

  return { recentPosts, recentTags };
}

function hashKey(payload) {
  // cache key đơn giản
  try {
    return JSON.stringify({
      t: payload.recentTags,
      p: payload.recentPosts.map((x) => x.title).slice(0, 3),
    });
  } catch {
    return String(Date.now());
  }
}

export default function RightSidebar({ posts = [] }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiErr, setAiErr] = useState("");

  // ✅ cooldown để chống spam/quota
  const [cooldownUntil, setCooldownUntil] = useState(0);

  // ✅ cache local trong FE (không thay thế cache BE nhưng giúp đỡ spam)
  const [localCache, setLocalCache] = useState(() => new Map());

  const canAskAI = !aiLoading && Date.now() > cooldownUntil;

  const payload = useMemo(() => buildPayload(posts), [posts]);
  const cacheKey = useMemo(() => hashKey(payload), [payload]);

  const handleAi = async () => {
    if (!canAskAI) return;

    setAiErr("");

    // ✅ nếu đã có cache local -> dùng luôn (không call API)
    const hit = localCache.get(cacheKey);
    if (hit && hit.exp > Date.now()) {
      setAiText(hit.text);
      setCooldownUntil(Date.now() + 10_000);
      return;
    }

    setAiLoading(true);
    try {
      const data = await aiApi.getSuggestion(payload);

      // server có thể trả: {success:true, suggestion} hoặc {success:true, data:{suggestion}}
      const suggestion =
        data?.suggestion ||
        data?.data?.suggestion ||
        data?.data ||
        data;

      const text = String(suggestion || "").trim();

      if (!text) throw new Error("Empty suggestion");

      setAiText(text);

      // ✅ cache local 2 phút
      setLocalCache((m) => {
        const next = new Map(m);
        next.set(cacheKey, { text, exp: Date.now() + 120_000 });
        return next;
      });

      // ✅ thành công: cooldown 20s
      setCooldownUntil(Date.now() + 20_000);
    } catch (e) {
      console.error(e);

      // ✅ lỗi/quota: message rõ ràng + cooldown dài
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
    <div className="space-y-4">
      {/* Online friends */}
      <GlassCard className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-200/90" />
            Online friends
          </div>
          <span className="text-xs text-slate-400">12</span>
        </div>

        <div className="mt-3 space-y-2">
          {["khoi.dev", "hieu.it", "linh.sql", "minh.react"].map((u) => (
            <div
              key={u}
              className="flex items-center gap-3 p-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 relative">
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.40)]" />
              </div>
              <div className="text-xs font-bold text-slate-100/90">@{u}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Trending tags */}
      <GlassCard className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl">
        <div className="font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-200/90" />
          Trending tags
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["#dsa", "#sql", "#react", "#nodejs", "#ai", "#system"].map((t) => (
            <button
              key={t}
              className="text-[11px] px-3 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition
                         hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_0_18px_rgba(168,85,247,0.10)] text-slate-100/90"
              type="button"
              onClick={() => {}}
            >
              {t}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* AI Suggestion (dynamic + anti overload) */}
      <GlassCard className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-200/90" />
            AI gợi ý
          </div>

          <button
            type="button"
            onClick={handleAi}
            disabled={!canAskAI}
            className={cx(
              "h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2",
              "hover:shadow-[0_0_0_1px_rgba(168,85,247,0.22),0_0_18px_rgba(168,85,247,0.12)]",
              !canAskAI && "opacity-60 cursor-not-allowed"
            )}
            title={!canAskAI ? "Đợi một chút để tránh quota" : "Làm mới gợi ý"}
          >
            <RefreshCw className={cx("h-4 w-4", aiLoading ? "animate-spin" : "")} />
            <span className="text-[11px] font-extrabold text-slate-100/90">
              {aiLoading ? "Đang..." : "Làm mới"}
            </span>
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-300 leading-relaxed min-h-[96px]">
          {aiLoading && (
            <div className="text-slate-300">
              AI đang phân tích… <span className="text-cyan-200">glow mode</span>
            </div>
          )}

          {!aiLoading && aiErr && (
            <div className="flex items-start gap-2 text-pink-200/90">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <span>{aiErr}</span>
            </div>
          )}

          {!aiLoading && !aiErr && !aiText && (
            <div>
              Nhấn <span className="text-purple-200 font-bold">Làm mới</span> để nhận gợi ý cá nhân hoá.
            </div>
          )}

          {!aiLoading && !aiErr && aiText && (
            <motion.div
              key={aiText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-200/90"
            >
              {aiText}
            </motion.div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={handleAi} disabled={!canAskAI}>
            {aiLoading ? "Đang xử lý..." : "Lấy gợi ý"}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              // Demo action
              // Bạn có thể lưu gợi ý vào Notes / Saved
            }}
            disabled={!aiText || aiLoading}
          >
            Apply
          </Button>
        </div>

        {!canAskAI && (
          <div className="mt-2 text-[11px] text-slate-500">
            Anti-spam đang bật để tránh quota. Hãy đợi một chút rồi thử lại.
          </div>
        )}
      </GlassCard>
    </div>
  );
}