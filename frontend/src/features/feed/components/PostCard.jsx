import { useMemo, useState } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  Flame,
  Link2,
  Code2,
  Image as ImageIcon,
} from "lucide-react";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function formatTime(t) {
  try {
    if (!t) return "vừa xong";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return String(t);
    return d.toLocaleString();
  } catch {
    return "vừa xong";
  }
}

export default function PostCard({
  post,
  index = 0,
  onOpenComments,
  onOpenShare,
  onToggleLike,
}) {
  const [liked, setLiked] = useState(!!post?.liked);
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? post?.likes ?? 0);

  const tag = post?.tag || "general";
  const author = post?.author?.username || post?.author || post?.authorId || "unknown";
  const title =
    post?.title || (post?.content ? String(post.content).slice(0, 80) : "Bài viết");
  const excerpt =
    post?.excerpt || (post?.content ? String(post.content).slice(0, 160) : "");

  const mediaType = useMemo(() => {
    if (post?.code) return "code";
    if (post?.imageUrl || post?.images?.length) return "image";
    if (post?.videoUrl) return "video";
    return "none";
  }, [post]);

  const neonBorder =
    "border border-white/10 shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_18px_40px_rgba(0,0,0,0.55)]";

  const hoverGlow =
    "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.20),0_0_28px_rgba(34,211,238,0.12),0_18px_40px_rgba(0,0,0,0.60)]";

  const handleToggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    onToggleLike?.(post, next);
  };

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="block"
    >
      <GlassCard
        className={cx(
          "p-5 rounded-2xl bg-white/[0.05] backdrop-blur-xl",
          neonBorder,
          hoverGlow,
          "transition-all"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-purple-500/20 to-pink-500/20 border border-white/10" />
              <div className="absolute -inset-1 rounded-[18px] blur-md opacity-60 bg-cyan-400/10" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="font-extrabold tracking-tight text-slate-100 truncate">
                  @{author}
                </div>

                <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-200/90">
                  #{tag}
                </span>

                {(post?.trending || post?.hot) && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-orange-200/90">
                    <Flame className="h-3.5 w-3.5" />
                    Hot
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                {formatTime(post?.createdAt || post?.time)}
              </div>
            </div>
          </div>

          <button
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center
                       hover:shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_0_18px_rgba(168,85,247,0.14)]"
            title="Tuỳ chọn"
          >
            <MoreHorizontal className="h-5 w-5 text-slate-200/80" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <a
            href={`/posts/${post?._id || post?.id}`}
            className="block group"
          >
            <div className="text-lg font-extrabold tracking-tight text-slate-100 group-hover:text-cyan-200 transition">
              {title}
            </div>

            {excerpt && (
              <div className="mt-2 text-sm text-slate-300 leading-relaxed">
                {excerpt}
              </div>
            )}
          </a>

          {/* Media (placeholder / demo) */}
          {mediaType !== "none" && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#060913] overflow-hidden">
              {mediaType === "image" && (
                <div className="h-52 grid place-items-center text-slate-400">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-cyan-300/80" />
                    <span className="text-sm">Image preview</span>
                  </div>
                </div>
              )}

              {mediaType === "video" && (
                <div className="h-52 grid place-items-center text-slate-400">
                  <span className="text-sm">Video preview</span>
                </div>
              )}

              {mediaType === "code" && (
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-purple-300/80" />
                      <span className="font-mono">snippet</span>
                    </div>
                    <button
                      className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition
                                 hover:shadow-[0_0_0_1px_rgba(236,72,153,0.25),0_0_18px_rgba(236,72,153,0.12)]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard?.writeText(post?.code || "");
                      }}
                      title="Copy code"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="mt-3 text-[12px] leading-relaxed font-mono text-slate-200/90 whitespace-pre-wrap">
{String(post?.code || "").slice(0, 500)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleLike();
              }}
              className={cx(
                "h-10 px-3 rounded-2xl border text-xs font-bold inline-flex items-center gap-2 transition",
                "bg-white/5 border-white/10 hover:bg-white/10",
                liked &&
                  "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_18px_rgba(34,211,238,0.14)]"
              )}
              title="Thả tim"
            >
              <motion.span
                animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className={cx(
                  "grid place-items-center",
                  liked ? "text-cyan-200" : "text-slate-200/80"
                )}
              >
                <Heart className="h-4 w-4" />
              </motion.span>
              <span className={liked ? "text-cyan-100" : "text-slate-200/80"}>
                Like
              </span>
          
            </motion.button>

            {/* Comment */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenComments?.(post);
              }}
              className="h-10 px-3 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition
                         hover:shadow-[0_0_0_1px_rgba(168,85,247,0.22),0_0_18px_rgba(168,85,247,0.12)] text-xs font-bold inline-flex items-center gap-2"
              title="Bình luận"
            >
              <MessageCircle className="h-4 w-4 text-purple-200/90" />
              <span className="text-slate-200/80">Comment</span>
              <span className="text-slate-400">{post?.commentCount ?? 0}</span>
            </button>

            {/* Share */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenShare?.(post);
              }}
              className="h-10 px-3 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition
                         hover:shadow-[0_0_0_1px_rgba(236,72,153,0.22),0_0_18px_rgba(236,72,153,0.12)] text-xs font-bold inline-flex items-center gap-2"
              title="Chia sẻ"
            >
              <Repeat2 className="h-4 w-4 text-pink-200/90" />
              <span className="text-slate-200/80">Share</span>
            </button>
          </div>

          {/* Quick copy link */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const url = `${window.location.origin}/posts/${post?._id || post?.id}`;
              navigator.clipboard?.writeText(url);
              onOpenShare?.(post, { copied: true });
            }}
            className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center
                       hover:shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_18px_rgba(34,211,238,0.12)]"
            title="Copy link"
          >
            <Link2 className="h-4 w-4 text-cyan-200/90" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}