import { useEffect, useMemo, useState } from "react";
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
  Video as VideoIcon,
  Paperclip,
  Download,
  FileText,
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let u = 0;

  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }

  return `${n.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

function getMediaList(post) {
  return Array.isArray(post?.media) ? post.media : [];
}

function getAuthor(post) {
  const author = post?.author ?? post?.authorId;
  if (!author) return "unknown";
  if (typeof author === "object") {
    return author.username || author.name || author._id || "unknown";
  }
  return String(author);
}

function getTags(post) {
  if (Array.isArray(post?.tags) && post.tags.length > 0) {
    return post.tags.map((x) => String(x));
  }

  if (typeof post?.tag === "string" && post.tag.trim()) {
    return [post.tag.trim()];
  }

  return ["general"];
}

function getLikeCount(post) {
  if (typeof post?.likeCount === "number") return post.likeCount;
  if (Array.isArray(post?.likes)) return post.likes.length;
  return Number(post?.likes ?? 0);
}

function getCommentCount(post) {
  if (typeof post?.commentCount === "number") return post.commentCount;
  if (Array.isArray(post?.comments)) return post.comments.length;
  return Number(post?.comments ?? 0);
}

function getFileName(item) {
  if (item?.originalName) return item.originalName;

  const rawUrl = item?.secureUrl || item?.url || "";
  try {
    const u = new URL(rawUrl);
    const last = u.pathname.split("/").filter(Boolean).pop() || "file";
    return decodeURIComponent(last);
  } catch {
    const last = String(rawUrl).split("/").filter(Boolean).pop() || "file";
    return last;
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
  const [likeCount, setLikeCount] = useState(getLikeCount(post));
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    setLiked(!!post?.liked);
    setLikeCount(getLikeCount(post));
  }, [post]);

  const author = getAuthor(post);
  const tags = getTags(post);
  const primaryTag = tags[0] || "general";

  const title =
    post?.title || (post?.content ? String(post.content).slice(0, 80) : "Bài viết");

  const excerpt =
    post?.excerpt || (post?.content ? String(post.content).slice(0, 160) : "");

  const media = useMemo(() => getMediaList(post), [post]);

  const images = useMemo(
    () => media.filter((m) => String(m?.resourceType || "").toLowerCase() === "image"),
    [media]
  );

  const videos = useMemo(
    () => media.filter((m) => String(m?.resourceType || "").toLowerCase() === "video"),
    [media]
  );

  const files = useMemo(
    () =>
      media.filter((m) => {
        const type = String(m?.resourceType || "").toLowerCase();
        return type !== "image" && type !== "video";
      }),
    [media]
  );

  const firstImage = images[0] || null;
  const firstVideo = videos[0] || null;

  const mediaType = useMemo(() => {
    if (post?.code) return "code";
    if (firstImage) return "image";
    if (firstVideo) return "video";
    if (files.length > 0) return "file";
    return "none";
  }, [post, firstImage, firstVideo, files.length]);

  const neonBorder =
    "border border-white/10 shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_18px_40px_rgba(0,0,0,0.55)]";

  const hoverGlow =
    "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.20),0_0_28px_rgba(34,211,238,0.12),0_18px_40px_rgba(0,0,0,0.60)]";

  const handleToggleLike = async () => {
    if (likeLoading) return;

    const prevLiked = liked;
    const prevCount = likeCount;
    const next = !prevLiked;

    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    setLikeLoading(true);

    try {
      const result = await onToggleLike?.(post);

      if (result?.post) {
        setLiked(!!result.liked);
        setLikeCount(
          typeof result.likeCount === "number"
            ? result.likeCount
            : getLikeCount(result.post)
        );
      }
    } catch (error) {
      console.error("Toggle like error:", error);
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const postUrl = `/posts/${post?._id || post?.id}`;

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const url = `${window.location.origin}${postUrl}`;
      await navigator.clipboard?.writeText(url);
      onOpenShare?.(post, { copied: true });
    } catch (error) {
      console.error("Copy link error:", error);
      onOpenShare?.(post);
    }
  };

  const handleCopyCode = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard?.writeText(post?.code || "");
    } catch (error) {
      console.error("Copy code error:", error);
    }
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-purple-500/20 to-pink-500/20 border border-white/10" />
              <div className="absolute -inset-1 rounded-[18px] blur-md opacity-60 bg-cyan-400/10" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <div className="font-extrabold tracking-tight text-slate-100 truncate">
                  @{author}
                </div>

                <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-200/90">
                  #{primaryTag}
                </span>

                {(post?.trending || post?.hot) && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-orange-200/90">
                    <Flame className="h-3.5 w-3.5" />
                    Hot
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                {formatTime(post?.createdAt || post?.updatedAt || post?.time)}
              </div>
            </div>
          </div>

          <button
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center
                       hover:shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_0_18px_rgba(168,85,247,0.14)]"
            title="Tuỳ chọn"
            type="button"
          >
            <MoreHorizontal className="h-5 w-5 text-slate-200/80" />
          </button>
        </div>

        <div className="mt-4">
          <a href={postUrl} className="block group">
            <div className="text-lg font-extrabold tracking-tight text-slate-100 group-hover:text-cyan-200 transition break-words">
              {title}
            </div>

            {excerpt && (
              <div className="mt-2 text-sm text-slate-300 leading-relaxed break-words">
                {excerpt}
              </div>
            )}
          </a>

          {mediaType !== "none" && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#060913] overflow-hidden">
              {mediaType === "image" && firstImage && (
                <a href={postUrl} className="block">
                  <img
                    src={firstImage.secureUrl || firstImage.url}
                    alt={firstImage.originalName || title}
                    className="w-full max-h-[420px] object-cover"
                    loading="lazy"
                  />
                  {(images.length > 1 || videos.length > 0 || files.length > 0) && (
                    <div className="px-4 py-2 text-xs text-slate-300 border-t border-white/10 bg-black/20 flex flex-wrap gap-3">
                      {images.length > 1 && (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5 text-cyan-300/80" />
                          {images.length} ảnh
                        </span>
                      )}
                      {videos.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <VideoIcon className="h-3.5 w-3.5 text-purple-300/80" />
                          {videos.length} video
                        </span>
                      )}
                      {files.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5 text-slate-300" />
                          {files.length} tệp
                        </span>
                      )}
                    </div>
                  )}
                </a>
              )}

              {mediaType === "video" && firstVideo && (
                <div className="p-3">
                  <video
                    src={firstVideo.secureUrl || firstVideo.url}
                    controls
                    className="w-full rounded-xl border border-white/10"
                  />
                  {(videos.length > 1 || files.length > 0) && (
                    <div className="mt-3 text-xs text-slate-300 flex flex-wrap gap-3">
                      {videos.length > 1 && (
                        <span className="inline-flex items-center gap-1">
                          <VideoIcon className="h-3.5 w-3.5 text-purple-300/80" />
                          {videos.length} video
                        </span>
                      )}
                      {files.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5 text-slate-300" />
                          {files.length} tệp
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {mediaType === "file" && (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <FileText className="h-4 w-4 text-cyan-300/80" />
                    Tệp đính kèm
                  </div>

                  <div className="mt-3 space-y-2">
                    {files.slice(0, 3).map((item, i) => {
                      const href = item?.secureUrl || item?.url;
                      if (!href) return null;

                      return (
                        <a
                          key={item?.publicId || i}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          download={getFileName(item)}
                          className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm text-slate-100">
                                {getFileName(item)}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item?.format
                                  ? String(item.format).toUpperCase()
                                  : "FILE"}
                                {item?.bytes ? ` • ${formatBytes(item.bytes)}` : ""}
                              </div>
                            </div>

                            <div className="shrink-0 text-slate-300">
                              <Download className="h-4 w-4" />
                            </div>
                          </div>
                        </a>
                      );
                    })}

                    {files.length > 3 && (
                      <a
                        href={postUrl}
                        className="block text-xs text-cyan-200 hover:text-cyan-100 transition"
                      >
                        Xem thêm {files.length - 3} tệp...
                      </a>
                    )}
                  </div>
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
                      onClick={handleCopyCode}
                      title="Copy code"
                      type="button"
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

          {tags.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(1, 6).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-200/90"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleLike();
              }}
              disabled={likeLoading}
              className={cx(
                "h-10 px-3 rounded-2xl border text-xs font-bold inline-flex items-center gap-2 transition",
                "bg-white/5 border-white/10 hover:bg-white/10",
                liked &&
                  "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_18px_rgba(34,211,238,0.14)]",
                likeLoading && "opacity-70 cursor-not-allowed"
              )}
              title="Thả tim"
              type="button"
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
              <span className="text-slate-400">{likeCount}</span>
            </motion.button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenComments?.(post);
              }}
              className="h-10 px-3 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition
                         hover:shadow-[0_0_0_1px_rgba(168,85,247,0.22),0_0_18px_rgba(168,85,247,0.12)] text-xs font-bold inline-flex items-center gap-2"
              title="Bình luận"
              type="button"
            >
              <MessageCircle className="h-4 w-4 text-purple-200/90" />
              <span className="text-slate-200/80">Comment</span>
              <span className="text-slate-400">{getCommentCount(post)}</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenShare?.(post);
              }}
              className="h-10 px-3 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 transition
                         hover:shadow-[0_0_0_1px_rgba(236,72,153,0.22),0_0_18px_rgba(236,72,153,0.12)] text-xs font-bold inline-flex items-center gap-2"
              title="Chia sẻ"
              type="button"
            >
              <Repeat2 className="h-4 w-4 text-pink-200/90" />
              <span className="text-slate-200/80">Share</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center
                       hover:shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_18px_rgba(34,211,238,0.12)]"
            title="Copy link"
            type="button"
          >
            <Link2 className="h-4 w-4 text-cyan-200/90" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}