import { useEffect, useMemo, useState } from "react";
import { buildAvatarCandidates } from "../../../shared/utils/avatar";
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
  if (Array.isArray(post?.media)) return post.media;

  const legacyImages = Array.isArray(post?.images)
    ? post.images.map((url, idx) => ({
        url,
        secureUrl: url,
        publicId: `image-${idx}`,
        resourceType: "image",
      }))
    : [];

  const legacyVideos = Array.isArray(post?.videos)
    ? post.videos.map((url, idx) => ({
        url,
        secureUrl: url,
        publicId: `video-${idx}`,
        resourceType: "video",
      }))
    : [];

  const legacyFiles = Array.isArray(post?.others)
    ? post.others.map((url, idx) => ({
        url,
        secureUrl: url,
        publicId: `file-${idx}`,
        resourceType: "raw",
      }))
    : [];

  return [...legacyImages, ...legacyVideos, ...legacyFiles];
}

function getAuthor(post) {
  return (
    post?.author?.fullName ||
    post?.author?.username ||
    post?.author?.name ||
    "unknown"
  );
}

function getAuthorInfo(post) {
  if (post?.author && typeof post.author === "object") {
    return post.author;
  }

  return {
    id: post?.authorId || post?.author || "",
    userId: post?.authorId || post?.author || "",
    username: "",
    fullName: "",
    avatarUrl: "",
  };
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

function getCurrentUserId() {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("uid") ||
    localStorage.getItem("currentUserId") ||
    JSON.parse(localStorage.getItem("user") || "null")?.id ||
    JSON.parse(localStorage.getItem("user") || "null")?._id ||
    ""
  );
}

function getLiked(post) {
  if (typeof post?.liked === "boolean") return post.liked;

  const currentUserId = getCurrentUserId();
  if (!currentUserId) return false;

  return (
    Array.isArray(post?.likes) &&
    post.likes.map(String).includes(String(currentUserId))
  );
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
  const [liked, setLiked] = useState(getLiked(post));
  const [likeCount, setLikeCount] = useState(getLikeCount(post));
  const [likeLoading, setLikeLoading] = useState(false);

  const author = getAuthor(post);
  const authorInfo = useMemo(() => getAuthorInfo(post), [post]);

  const avatarCandidates = useMemo(
    () => buildAvatarCandidates(authorInfo),
    [authorInfo]
  );
  const [avatarIdx, setAvatarIdx] = useState(0);

  useEffect(() => {
    setLiked(getLiked(post));
    setLikeCount(getLikeCount(post));
  }, [post]);

  useEffect(() => {
    setAvatarIdx(0);
  }, [avatarCandidates]);

  const tags = getTags(post);
  const primaryTag = tags[0] || "general";

  const title =
    post?.title || (post?.content ? String(post.content).slice(0, 80) : "Bài viết");

  const excerpt =
    post?.excerpt || (post?.content ? String(post.content).slice(0, 160) : "");

  const media = useMemo(() => getMediaList(post), [post]);

  const images = useMemo(
    () =>
      media.filter(
        (m) => String(m?.resourceType || "").toLowerCase() === "image"
      ),
    [media]
  );

  const videos = useMemo(
    () =>
      media.filter(
        (m) => String(m?.resourceType || "").toLowerCase() === "video"
      ),
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
      <GlassCard className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111827]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_22%)] opacity-90" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <img
                  src={avatarCandidates[avatarIdx]}
                  alt={author}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => {
                    setAvatarIdx((i) =>
                      i + 1 < avatarCandidates.length ? i + 1 : i
                    );
                  }}
                  draggable={false}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#111827] bg-emerald-400" />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="truncate text-sm font-semibold text-slate-100 sm:text-[15px]">
                  @{author}
                </div>

                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                  #{primaryTag}
                </span>

                {(post?.trending || post?.hot) && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/15 bg-orange-400/10 px-2.5 py-1 text-[11px] font-medium text-orange-100">
                    <Flame className="h-3.5 w-3.5" />
                    Hot
                  </span>
                )}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {formatTime(post?.createdAt || post?.updatedAt || post?.time)}
              </div>
            </div>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
            title="Tuỳ chọn"
            type="button"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-4">
          <a href={postUrl} className="block group">
            <div className="text-lg font-semibold tracking-tight text-slate-50 transition group-hover:text-cyan-100 sm:text-[22px]">
              {title}
            </div>

            {excerpt && (
              <div className="mt-2 text-sm leading-7 text-slate-300 sm:text-[15px]">
                {excerpt}
              </div>
            )}
          </a>

          {mediaType !== "none" && (
            <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/85">
              {mediaType === "image" && firstImage && (
                <a href={postUrl} className="block">
                  <img
                    src={firstImage.secureUrl || firstImage.url}
                    alt={firstImage.originalName || title}
                    className="max-h-[460px] w-full object-cover"
                    loading="lazy"
                  />
                  {(images.length > 1 || videos.length > 0 || files.length > 0) && (
                    <div className="flex flex-wrap gap-3 border-t border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-slate-300">
                      {images.length > 1 && (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5 text-cyan-300/80" />
                          {images.length} ảnh
                        </span>
                      )}
                      {videos.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <VideoIcon className="h-3.5 w-3.5 text-violet-300/80" />
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
                <div className="p-3 sm:p-4">
                  <video
                    src={firstVideo.secureUrl || firstVideo.url}
                    controls
                    className="w-full rounded-2xl border border-white/10 bg-black"
                  />
                  {(videos.length > 1 || files.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
                      {videos.length > 1 && (
                        <span className="inline-flex items-center gap-1">
                          <VideoIcon className="h-3.5 w-3.5 text-violet-300/80" />
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
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <FileText className="h-4 w-4 text-cyan-300/80" />
                    Tệp đính kèm
                  </div>

                  <div className="mt-3 space-y-2.5">
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
                          className="block rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:bg-white/[0.07]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm text-slate-100">
                                {getFileName(item)}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item?.format ? String(item.format).toUpperCase() : "FILE"}
                                {item?.bytes ? ` • ${formatBytes(item.bytes)}` : ""}
                              </div>
                            </div>

                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-slate-950/80 text-slate-300">
                              <Download className="h-4 w-4" />
                            </div>
                          </div>
                        </a>
                      );
                    })}

                    {files.length > 3 && (
                      <a
                        href={postUrl}
                        className="block text-xs font-medium text-cyan-200 transition hover:text-cyan-100"
                      >
                        Xem thêm {files.length - 3} tệp...
                      </a>
                    )}
                  </div>
                </div>
              )}

              {mediaType === "code" && (
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                      <Code2 className="h-4 w-4 text-violet-300/80" />
                      <span className="font-mono">snippet</span>
                    </div>
                    <button
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]"
                      onClick={handleCopyCode}
                      title="Copy code"
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-[12px] leading-6 text-slate-200/90">
                    {String(post?.code || "").slice(0, 500)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {tags.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(1, 6).map((tag) => (
                <span
                  key={tag}
                  className="rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-[11px] text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleLike();
              }}
              disabled={likeLoading}
              className={cx(
                "inline-flex h-11 items-center gap-2 rounded-2xl border px-3.5 text-sm font-medium transition",
                "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]",
                liked &&
                  "border-red-400/25 bg-red-400/10 text-red-100 shadow-[0_12px_28px_rgba(248,113,113,0.10)]",
                likeLoading && "cursor-not-allowed opacity-70"
              )}
              title="Thả tim"
              type="button"
            >
              <motion.span
                animate={liked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className={liked ? "text-red-300" : "text-slate-400"}
              >
                <Heart className={cx("h-4 w-4", liked && "fill-current")} />
              </motion.span>
              <span>Like</span>
              <span className="text-slate-500">{likeCount}</span>
            </motion.button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenComments?.(post);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
              title="Bình luận"
              type="button"
            >
              <MessageCircle className="h-4 w-4 text-violet-200/90" />
              <span>Comment</span>
              <span className="text-slate-500">{getCommentCount(post)}</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenShare?.(post);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
              title="Chia sẻ"
              type="button"
            >
              <Repeat2 className="h-4 w-4 text-pink-200/90" />
              <span>Share</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-950/80 text-cyan-200 transition hover:bg-cyan-400/10"
            title="Copy link"
            type="button"
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
