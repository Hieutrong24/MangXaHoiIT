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
  Sparkles,
  Hash,
  Clock3,
  UserRound,
  Code2,
  Quote,
} from "lucide-react";
import { postsApi } from "../api/posts.api";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatTime(t) {
  try {
    if (!t) return "";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return String(t);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

function getInitials(value) {
  const text = String(value || "U").trim();
  if (!text) return "U";

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function renderInlineMarkdown(text, keyPrefix = "inline") {
  const raw = String(text || "");
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|(https?:\/\/[^\s]+))/g;

  let lastIndex = 0;
  let match;
  let index = 0;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push(raw.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-bold-${index}`} className="font-extrabold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`${keyPrefix}-code-${index}`}
          className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[0.92em] font-semibold text-cyan-100"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const label = token.slice(1, token.indexOf("]("));
      const href = token.slice(token.indexOf("](") + 2, -1);

      parts.push(
        <a
          key={`${keyPrefix}-link-${index}`}
          href={isUrl(href) ? href : "#"}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-100"
        >
          {label}
        </a>
      );
    } else if (isUrl(token)) {
      parts.push(
        <a
          key={`${keyPrefix}-url-${index}`}
          href={token}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-100"
        >
          {token}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
    index += 1;
  }

  if (lastIndex < raw.length) {
    parts.push(raw.slice(lastIndex));
  }

  return parts.map((part, i) =>
    typeof part === "string" ? <span key={`${keyPrefix}-text-${i}`}>{part}</span> : part
  );
}

function cleanMarkdownMarker(line) {
  return String(line || "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function getSectionTone(line) {
  const text = String(line || "").trim();

  if (text.startsWith("⚠️") || text.startsWith("❗") || text.startsWith("🔥")) {
    return {
      icon: "⚠️",
      border: "border-amber-300/20",
      bg: "bg-amber-300/10",
      text: "text-amber-100",
      dot: "bg-amber-300",
    };
  }

  if (text.startsWith("🎯") || text.startsWith("✅")) {
    return {
      icon: "🎯",
      border: "border-emerald-300/20",
      bg: "bg-emerald-300/10",
      text: "text-emerald-100",
      dot: "bg-emerald-300",
    };
  }

  if (text.startsWith("🚀") || text.startsWith("📌") || text.startsWith("💡")) {
    return {
      icon: "✨",
      border: "border-cyan-300/20",
      bg: "bg-cyan-300/10",
      text: "text-cyan-100",
      dot: "bg-cyan-300",
    };
  }

  if (text.startsWith("💬")) {
    return {
      icon: "💬",
      border: "border-violet-300/20",
      bg: "bg-violet-300/10",
      text: "text-violet-100",
      dot: "bg-violet-300",
    };
  }

  return {
    icon: "📌",
    border: "border-cyan-300/20",
    bg: "bg-cyan-300/10",
    text: "text-cyan-100",
    dot: "bg-cyan-300",
  };
}

function parseMarkdownBlocks(content) {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;
  let codeLang = "";

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push({
        type: "paragraph",
        text: paragraph.join(" ").replace(/\s+/g, " ").trim(),
      });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push({
        type: "list",
        items: list,
      });
      list = [];
    }
  }

  function flushCode() {
    blocks.push({
      type: "code",
      lang: codeLang,
      text: code.join("\n"),
    });
    code = [];
    codeLang = "";
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      if (!inCode) {
        flushParagraph();
        flushList();
        inCode = true;
        codeLang = line.replace(/^```/, "").trim();
      } else {
        inCode = false;
        flushCode();
      }
      continue;
    }

    if (inCode) {
      code.push(rawLine);
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^(-{3,}|…{1,}|\.{3,})$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      flushParagraph();
      flushList();
      const level = Math.min((line.match(/^#+/)?.[0]?.length || 2), 3);
      blocks.push({
        type: "heading",
        level,
        text: cleanMarkdownMarker(line),
      });
      continue;
    }

    if (/^>\s+/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "quote",
        text: line.replace(/^>\s+/, "").trim(),
      });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(cleanMarkdownMarker(line));
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "numbered-section",
        text: cleanMarkdownMarker(line),
        raw: line,
      });
      continue;
    }

    if (/^(🚀|📌|⚠️|🎯|✅|💬|🔥|💡|❗)/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "emoji-section",
        text: line,
      });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  if (inCode && code.length) {
    flushCode();
  }

  return blocks;
}

function MarkdownContent({ content }) {
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  if (!blocks.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-slate-400">
        Bài viết chưa có nội dung.
      </div>
    );
  }

  return (
    <article className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
      <div className="space-y-4 text-[15px] leading-7 text-slate-200">
        {blocks.map((block, index) => {
          if (block.type === "divider") {
            return (
              <div key={`divider-${index}`} className="py-1">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />
              </div>
            );
          }

          if (block.type === "heading") {
            const size =
              block.level === 1
                ? "text-2xl sm:text-3xl"
                : block.level === 2
                  ? "text-xl sm:text-2xl"
                  : "text-lg sm:text-xl";

            return (
              <div key={`heading-${index}`} className="pt-1">
                <h2 className={cx("font-black tracking-tight text-white", size)}>
                  {renderInlineMarkdown(block.text, `heading-${index}`)}
                </h2>
              </div>
            );
          }

          if (block.type === "emoji-section") {
            const tone = getSectionTone(block.text);

            return (
              <div
                key={`emoji-section-${index}`}
                className={cx(
                  "rounded-2xl border px-4 py-3",
                  tone.border,
                  tone.bg
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cx("mt-2 h-2 w-2 shrink-0 rounded-full", tone.dot)} />
                  <div className={cx("font-bold leading-7", tone.text)}>
                    {renderInlineMarkdown(block.text, `emoji-section-${index}`)}
                  </div>
                </div>
              </div>
            );
          }

          if (block.type === "numbered-section") {
            const numberMatch = String(block.raw || "").match(/^(\d+)[.)]/);
            const number = numberMatch?.[1] || index + 1;

            return (
              <div
                key={`numbered-${index}`}
                className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs font-black text-cyan-100">
                    {number}
                  </div>
                  <div className="pt-0.5 font-bold text-white">
                    {renderInlineMarkdown(block.text, `numbered-${index}`)}
                  </div>
                </div>
              </div>
            );
          }

          if (block.type === "list") {
            return (
              <ul key={`list-${index}`} className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
                {block.items.map((item, itemIndex) => (
                  <li key={`list-${index}-${itemIndex}`} className="flex gap-3 text-slate-200">
                    <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                    <span>{renderInlineMarkdown(item, `list-${index}-${itemIndex}`)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === "quote") {
            return (
              <div
                key={`quote-${index}`}
                className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.07] px-4 py-3"
              >
                <div className="flex gap-3">
                  <Quote className="mt-1 h-4 w-4 shrink-0 text-violet-200" />
                  <p className="text-slate-200">
                    {renderInlineMarkdown(block.text, `quote-${index}`)}
                  </p>
                </div>
              </div>
            );
          }

          if (block.type === "code") {
            return (
              <div
                key={`code-${index}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/35"
              >
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5 text-cyan-200" />
                    <span>{block.lang || "code"}</span>
                  </div>
                </div>
                <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-slate-200">
                  <code>{block.text}</code>
                </pre>
              </div>
            );
          }

          return (
            <p key={`paragraph-${index}`} className="text-slate-200">
              {renderInlineMarkdown(block.text, `paragraph-${index}`)}
            </p>
          );
        })}
      </div>
    </article>
  );
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
    if (typeof a === "object") {
      return a.fullName || a.displayName || a.username || a.name || a._id || "unknown";
    }
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
    () =>
      media.filter((m) => {
        const type = String(m?.resourceType).toLowerCase();
        return type !== "image" && type !== "video";
      }),
    [media]
  );

  if (loading) {
    return (
      <div className="grid gap-4">
        <GlassCard className="overflow-hidden p-0">
          <div className="animate-pulse p-6">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-2/3 rounded-xl bg-white/10" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full rounded-full bg-white/10" />
              <div className="h-4 w-5/6 rounded-full bg-white/10" />
              <div className="h-4 w-4/6 rounded-full bg-white/10" />
            </div>
          </div>
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
    <div className="mx-auto grid max-w-6xl gap-4">
      <GlassCard className="overflow-hidden border border-white/10 bg-slate-950/45 p-0">
        <div className="border-b border-white/10 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/70 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {tags.length ? (
                  tags.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100"
                    >
                      <Hash className="h-3 w-3" />
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                    <Hash className="h-3 w-3" />
                    general
                  </span>
                )}
              </div>

              <h1 className="mt-4 break-words text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <div className="inline-flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-[11px] font-black text-cyan-100">
                    {getInitials(author)}
                  </div>
                  <span className="font-semibold text-slate-200">@{author}</span>
                </div>

                {createdAt ? (
                  <div className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>{formatTime(createdAt)}</span>
                  </div>
                ) : null}

                <div className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 text-slate-500" />
                  <span>Post detail</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button
                variant="ghost"
                title="Bật/tắt debug"
                onClick={() => setShowDebug((v) => !v)}
                className="!h-9 !rounded-xl !px-3"
              >
                <Bug className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                title="Tải lại"
                onClick={fetchPost}
                className="!h-9 !rounded-xl !px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Link to="/posts">
                <Button
                  variant="ghost"
                  title="Quay lại danh sách"
                  className="!h-9 !rounded-xl !px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <Link to={`/posts/${post?._id || id}/edit`}>
                <Button variant="ghost" className="!h-9 !rounded-xl !px-3">
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {showDebug && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200/90">
              <div className="mb-2 flex items-center gap-2 font-bold text-slate-100">
                <Bug className="h-4 w-4 text-cyan-200" />
                DEBUG
              </div>

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

          <MarkdownContent content={content} />

          {images.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <ImageIcon className="h-4 w-4 text-cyan-200/90" />
                Ảnh
                <span className="text-slate-400 font-normal">({images.length})</span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {images.map((item, i) => {
                  const src = item?.secureUrl || item?.url;
                  if (!src) return null;

                  return (
                    <a
                      key={`img-${item?.publicId || i}`}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                      title="Mở ảnh"
                    >
                      <img
                        src={src}
                        alt={item?.originalName || `post-${post?._id}-img-${i}`}
                        className="w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:opacity-95"
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
                      className="w-full rounded-2xl border border-white/10 bg-black/30"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
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
                      className="block rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cyan-200 transition hover:bg-white/10"
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

                        <div className="inline-flex shrink-0 items-center gap-1 text-slate-300">
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

          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <Button variant="ghost" className="!rounded-xl">
              <Heart className="h-4 w-4" />
              Thích ({likeCount})
            </Button>

            <Button variant="ghost" className="!rounded-xl">
              <MessageCircle className="h-4 w-4" />
              Bình luận ({commentCount})
            </Button>

            <Button variant="ghost" className="!rounded-xl">
              <Bookmark className="h-4 w-4" />
              Lưu
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden border border-white/10 bg-slate-950/45 p-0">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <MessageCircle className="h-4 w-4 text-cyan-200" />
            Bình luận
          </div>
          <div className="mt-1 text-sm text-slate-400">Tổng: {commentCount}</div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-slate-400">
            Danh sách bình luận nên lấy từ service comment riêng hoặc endpoint comments theo post.
          </div>
        </div>
      </GlassCard>
    </div>
  );
}