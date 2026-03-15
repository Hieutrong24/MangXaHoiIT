import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";

import {
  Heart,
  MessageCircle,
  Bookmark,
  Pencil,
  ArrowLeft,
  Bug,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
} from "lucide-react";
import { postsApi } from "../api/posts.api";

function formatTime(t) {
  try {
    if (!t) return "";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return String(t);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function unwrapPost(res) {
  if (!res) return null;
  if (res?.data && typeof res.data === "object") return res.data;
  return res;
}

function safeString(v, fallback = "") {
  if (v === undefined || v === null) return fallback;
  return String(v);
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

export default function PostDetailPage() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [meta, setMeta] = useState({ success: undefined, correlationId: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await postsApi.getById(id);
      const actualPost = unwrapPost(res);

      setMeta({
        success: res?.success,
        correlationId: res?.correlationId || "",
      });
      setPost(actualPost);
    } catch (e) {
      console.error("[PostDetailPage] Load post detail error:", e);
      setErr(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Không tải được bài viết. Vui lòng thử lại."
      );
      setPost(null);
      setMeta({ success: undefined, correlationId: "" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const title = useMemo(() => {
    if (post?.title) return post.title;
    if (post?.content) return String(post.content).slice(0, 80);
    return `Bài viết #${id}`;
  }, [post, id]);

  const content = safeString(post?.content, "");

  const author = useMemo(() => {
    const a = post?.author ?? post?.authorId;
    if (!a) return "unknown";
    if (typeof a === "object") return a.username || a.name || a._id || "unknown";
    return String(a);
  }, [post]);

  const createdAt = post?.createdAt || post?.updatedAt;

  const likeCount = Array.isArray(post?.likes)
    ? post.likes.length
    : Number(post?.likeCount ?? 0);

  const commentCount = Number(post?.commentCount ?? post?.comments?.length ?? 0);

  const tags = useMemo(() => {
    const t = post?.tags;
    if (Array.isArray(t)) return t.map((x) => String(x));
    if (typeof t === "string") {
      return t
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return [];
  }, [post]);

  const contentLines = useMemo(() => {
    if (!content) return [];
    if (typeof content === "string") return content.split("\n").filter(Boolean);
    return [String(content)];
  }, [content]);

  const media = Array.isArray(post?.media) ? post.media : [];

  const images = useMemo(
    () => media.filter((m) => String(m?.resourceType).toLowerCase() === "image"),
    [media]
  );

  const videos = useMemo(
    () => media.filter((m) => String(m?.resourceType).toLowerCase() === "video"),
    [media]
  );

  const files = useMemo(
    () => media.filter((m) => {
      const type = String(m?.resourceType).toLowerCase();
      return type !== "image" && type !== "video";
    }),
    [media]
  );

  if (loading) {
    return (
      <div className="grid gap-4">
        <GlassCard className="p-6">
          <div className="text-slate-300">Đang tải bài viết…</div>
        </GlassCard>
      </div>
    );
  }

  if (err) {
    return (
      <div className="grid gap-4">
        <GlassCard className="p-6">
          <div className="text-red-300 font-semibold">{err}</div>
          <div className="mt-4 flex gap-2">
            <Link to="/posts">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Button>
            </Link>
            <Button onClick={fetchPost}>
              <RefreshCw className="h-4 w-4" /> Thử lại
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="grid gap-4">
        <GlassCard className="p-6">
          <div className="text-slate-300">Không tìm thấy bài viết.</div>
          <div className="mt-4 flex gap-2">
            <Link to="/posts">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Button>
            </Link>
            <Button onClick={fetchPost}>
              <RefreshCw className="h-4 w-4" /> Tải lại
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              {tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-200/90"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-cyan-200/90 font-semibold">#general</span>
              )}

              <span className="text-slate-600">•</span>
              <span className="truncate">@{author}</span>

              {createdAt ? (
                <>
                  <span className="text-slate-600">•</span>
                  <span>{formatTime(createdAt)}</span>
                </>
              ) : null}
            </div>

            <div className="mt-3 text-2xl font-black tracking-tight text-slate-100 break-words">
              {title}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              title="Bật/tắt debug"
              onClick={() => setShowDebug((v) => !v)}
            >
              <Bug className="h-4 w-4" />
            </Button>

            <Button variant="ghost" title="Tải lại" onClick={fetchPost}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Link to="/posts">
              <Button variant="ghost" title="Quay lại danh sách">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <Link to={`/posts/${post?._id || id}/edit`}>
              <Button variant="ghost">
                <Pencil className="h-4 w-4" /> Sửa
              </Button>
            </Link>
          </div>
        </div>

        {showDebug && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200/90">
            <div className="font-bold text-slate-100 mb-2">DEBUG</div>
            <div className="grid gap-1">
              <div>
                <span className="text-slate-400">route id:</span> {id}
              </div>
              <div>
                <span className="text-slate-400">post._id:</span>{" "}
                {String(post?._id ?? "")}
              </div>
              <div>
                <span className="text-slate-400">author/authorId:</span>{" "}
                {typeof (post?.author ?? post?.authorId) === "object"
                  ? JSON.stringify(post?.author ?? post?.authorId)
                  : String(post?.author ?? post?.authorId ?? "")}
              </div>
              <div>
                <span className="text-slate-400">content length:</span>{" "}
                {typeof post?.content === "string" ? post.content.length : "N/A"}
              </div>
              <div>
                <span className="text-slate-400">media:</span> {media.length}
              </div>
              <div>
                <span className="text-slate-400">images:</span> {images.length}
              </div>
              <div>
                <span className="text-slate-400">videos:</span> {videos.length}
              </div>
              <div>
                <span className="text-slate-400">files:</span> {files.length}
              </div>
              {meta?.correlationId ? (
                <div>
                  <span className="text-slate-400">correlationId:</span>{" "}
                  {meta.correlationId}
                </div>
              ) : null}
              <details className="mt-2">
                <summary className="cursor-pointer text-slate-100">
                  raw post JSON
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-slate-300">
                  {JSON.stringify(post, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        <div className="mt-6 prose prose-invert max-w-none">
          {contentLines.length ? (
            contentLines.map((line, i) => <p key={i}>{line}</p>)
          ) : (
            <p className="text-slate-300">Bài viết chưa có nội dung.</p>
          )}
        </div>

        {images.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <ImageIcon className="h-4 w-4 text-cyan-200/90" />
              Ảnh
              <span className="text-slate-400 font-normal">({images.length})</span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((item, i) => {
                const src = item?.secureUrl || item?.url;
                if (!src) return null;

                return (
                  <a
                    key={`img-${item?.publicId || i}`}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                    title="Mở ảnh"
                  >
                    <img
                      src={src}
                      alt={item?.originalName || `post-${post?._id}-img-${i}`}
                      className="w-full rounded-2xl border border-white/10 object-cover hover:opacity-95 transition"
                      loading="lazy"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <VideoIcon className="h-4 w-4 text-purple-200/90" />
              Video
              <span className="text-slate-400 font-normal">({videos.length})</span>
            </div>

            <div className="mt-3 grid gap-3">
              {videos.map((item, i) => {
                const src = item?.secureUrl || item?.url;
                if (!src) return null;

                return (
                  <video
                    key={`vid-${item?.publicId || i}`}
                    src={src}
                    controls
                    className="w-full rounded-2xl border border-white/10"
                  />
                );
              })}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <FileText className="h-4 w-4 text-slate-200/90" />
              Tệp đính kèm
              <span className="text-slate-400 font-normal">({files.length})</span>
            </div>

            <div className="mt-3 space-y-2">
              {files.map((item, i) => {
                const href = item?.secureUrl || item?.url;
                if (!href) return null;

                return (
                  <a
                    key={`file-${item?.publicId || i}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    download={getFileName(item)}
                    className="block rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cyan-200 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{getFileName(item)}</div>
                        <div className="text-[11px] text-slate-500 break-all">
                          {href}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {item?.format ? `${String(item.format).toUpperCase()} • ` : ""}
                          {item?.bytes ? formatBytes(item.bytes) : ""}
                        </div>
                      </div>

                      <div className="shrink-0 inline-flex items-center gap-1 text-slate-300">
                        <Download className="h-4 w-4" />
                        <span className="text-xs">Tải</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="ghost">
            <Heart className="h-4 w-4" /> Thích ({likeCount})
          </Button>
          <Button variant="ghost">
            <MessageCircle className="h-4 w-4" /> Bình luận ({commentCount})
          </Button>
          <Button variant="ghost">
            <Bookmark className="h-4 w-4" /> Lưu
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="font-bold text-slate-100">Bình luận</div>
        <div className="mt-2 text-sm text-slate-300">Tổng: {commentCount}</div>
        <div className="mt-3 text-sm text-slate-400">
          Danh sách bình luận nên lấy từ service comment riêng hoặc endpoint comments theo post.
        </div>
      </GlassCard>
    </div>
  );
}