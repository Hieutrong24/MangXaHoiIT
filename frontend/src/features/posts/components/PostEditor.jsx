// src/features/posts/components/PostEditor.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Loader2,
  Eye,
  Paperclip,
  Video,
  FileText,
} from "lucide-react";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let u = 0;

  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u++;
  }

  return `${n.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

function inferType(file) {
  if (file?.type?.startsWith("image/")) return "image";
  if (file?.type?.startsWith("video/")) return "video";
  return "file";
}

export default function PostEditor({
  title,
  setTitle,
  content,
  setContent,
  onSubmit,
  initialTags = [],
  submitting = false,
  submitLabel = "Đăng bài",
  rightPanel = null,
}) {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fileInputRef = useRef(null);

  const MAX_FILE_MB = 8;
  const MAX_BYTES = MAX_FILE_MB * 1024 * 1024;

  const isBusy = loading || submitting;

  useEffect(() => {
    if (Array.isArray(initialTags)) {
      setTags(
        initialTags
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean)
      );
    }
  }, [initialTags]);

  useEffect(() => {
    return () => {
      for (const a of attachments) {
        if (a?.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(a.previewUrl);
        }
      }
    };
  }, [attachments]);

  const addTag = (value) => {
    const v = String(value || "").trim().toLowerCase();
    if (!v || tags.includes(v)) return;
    setTags((prev) => [...prev, v]);
  };

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }

    if (e.key === "Backspace" && !tagInput && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const insertMarkdown = (before, after = before) => {
    const textarea = document.getElementById("cyber-editor");
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = String(content || "").slice(start, end);

    const next =
      String(content || "").slice(0, start) +
      before +
      selected +
      after +
      String(content || "").slice(end);

    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const openPicker = (kind) => {
    if (!fileInputRef.current) return;

    if (kind === "image") {
      fileInputRef.current.accept = "image/*";
    } else if (kind === "video") {
      fileInputRef.current.accept = "video/*";
    } else {
      fileInputRef.current.accept = "";
    }

    fileInputRef.current.click();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const next = [];

    for (const f of files) {
      if (f.size > MAX_BYTES) continue;

      const kind = inferType(f);
      const previewUrl = URL.createObjectURL(f);

      next.push({
        id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
        kind,
        name: f.name,
        size: f.size,
        mime: f.type || "application/octet-stream",
        file: f,
        previewUrl,
      });
    }

    if (next.length) {
      setAttachments((prev) => [...prev, ...next]);
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const found = prev.find((a) => a.id === id);
      if (found?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const attachmentCountByKind = useMemo(() => {
    const c = { file: 0, image: 0, video: 0 };
    for (const a of attachments) {
      c[a.kind] = (c[a.kind] || 0) + 1;
    }
    return c;
  }, [attachments]);

  const insertAttachmentToMarkdown = (att) => {
    setContent((prev) => {
      const current = String(prev || "");
      const sep = current.endsWith("\n") || !current ? "" : "\n";

      if (att.kind === "image") {
        return `${current}${sep}![${att.name}](${att.previewUrl})\n`;
      }

      return `${current}${sep}[${att.name}](${att.previewUrl})\n`;
    });
  };

  const handleSubmit = async () => {
    if (!String(title || "").trim()) return;
    if (!String(content || "").trim()) return;

    setLoading(true);
    try {
      await onSubmit?.({
        title: title ?? "",
        content,
        tags,
        attachments,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div
          className={cx(
            "rounded-2xl p-6",
            "bg-white/[0.035] backdrop-blur-xl border border-white/10",
            "shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_0_28px_rgba(168,85,247,0.10),0_24px_60px_rgba(0,0,0,0.55)]"
          )}
        >
          <div className="space-y-5">
            <div className="relative">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent border border-white/20 rounded-xl px-4 pt-5 pb-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all"
              />
              <label className="absolute left-4 top-2.5 text-xs text-slate-400 peer-focus:text-cyan-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500">
                Tiêu đề
              </label>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full border border-purple-400/35 text-purple-200 bg-purple-500/10"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      title="Gỡ tag"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder="Thêm tag (Enter hoặc ,)"
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/25"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />

              <button
                type="button"
                onClick={() => openPicker("file")}
                className="px-3 py-2 rounded-xl border border-white/15 text-slate-200 hover:border-cyan-400/70 transition flex items-center gap-2 text-sm"
              >
                <Paperclip className="h-4 w-4 text-cyan-400" />
                Tệp
                {attachmentCountByKind.file
                  ? ` (${attachmentCountByKind.file})`
                  : ""}
              </button>

              <button
                type="button"
                onClick={() => openPicker("image")}
                className="px-3 py-2 rounded-xl border border-white/15 text-slate-200 hover:border-yellow-400/70 transition flex items-center gap-2 text-sm"
              >
                <ImageIcon className="h-4 w-4 text-yellow-400" />
                Ảnh
                {attachmentCountByKind.image
                  ? ` (${attachmentCountByKind.image})`
                  : ""}
              </button>

              <button
                type="button"
                onClick={() => openPicker("video")}
                className="px-3 py-2 rounded-xl border border-white/15 text-slate-200 hover:border-purple-400/70 transition flex items-center gap-2 text-sm"
              >
                <Video className="h-4 w-4 text-purple-400" />
                Video
                {attachmentCountByKind.video
                  ? ` (${attachmentCountByKind.video})`
                  : ""}
              </button>

              <div className="text-[11px] text-slate-500 ml-1">
                ≤ {MAX_FILE_MB}MB / file
              </div>
            </div>

            <div className="flex gap-3 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                title="Bold"
              >
                <Bold className="h-4 w-4 text-cyan-400 hover:scale-110 transition" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                title="Italic"
              >
                <Italic className="h-4 w-4 text-pink-400 hover:scale-110 transition" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("```\n", "\n```")}
                title="Code"
              >
                <Code className="h-4 w-4 text-purple-400 hover:scale-110 transition" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[text](", ")")}
                title="Link"
              >
                <LinkIcon className="h-4 w-4 text-green-400 hover:scale-110 transition" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("![alt](", ")")}
                title="Image md"
              >
                <ImageIcon className="h-4 w-4 text-yellow-400 hover:scale-110 transition" />
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-slate-300 font-semibold">
                  Tệp đã đính kèm
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-white/10 bg-black/25 p-2.5 flex gap-2.5 items-start"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/35 flex items-center justify-center shrink-0">
                        {a.kind === "image" ? (
                          <img
                            src={a.previewUrl}
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        ) : a.kind === "video" ? (
                          <video
                            src={a.previewUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <FileText className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-white truncate">
                          {a.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {a.kind.toUpperCase()} • {formatBytes(a.size)}
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => insertAttachmentToMarkdown(a)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-white/15 text-slate-200 hover:border-cyan-400/70 transition"
                          >
                            Chèn
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAttachment(a.id)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-white/15 text-slate-200 hover:border-red-400/70 transition"
                          >
                            Gỡ
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="text-slate-400 hover:text-white"
                        title="Gỡ"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              id="cyber-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bài tại đây... Markdown supported."
              className="w-full min-h-[220px] bg-black/35 border border-white/20 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition shadow-inner"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isBusy}
                className={cx(
                  "flex-1 py-2.5 rounded-xl font-bold text-white transition-all text-sm",
                  "bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700",
                  "hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(34,211,238,0.35)]",
                  isBusy && "opacity-70"
                )}
              >
                {isBusy ? (
                  <Loader2 className="animate-spin inline h-4 w-4 mr-2" />
                ) : null}
                {submitLabel}
              </button>

              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:border-cyan-400/70 hover:shadow-[0_0_10px_rgba(34,211,238,0.45)] transition text-sm"
              >
                <Eye className="inline h-4 w-4 mr-2" />
                Preview
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              *Lưu ý: file đính kèm sẽ được upload ở bước Submit bên page cha,
              sau đó lưu metadata vào <code>media[]</code> của bài viết để hiển
              thị ảnh, video và file tải xuống.
            </div>
          </div>
        </div>

        {rightPanel ? (
          <aside className="lg:sticky lg:top-4 h-fit">{rightPanel}</aside>
        ) : null}
      </div>
    </div>
  );
}