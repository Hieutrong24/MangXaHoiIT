import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ModalShell from "./ModalShell";
import { cx, pickTitle } from "../utils/feedHelpers";
import { feedApi } from "../api/feed.api";

function normalizeComments(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

function getCommentId(c, idx) {
  return c?._id || c?.id || `${idx}`;
}

function getCommentAuthor(c) {
  const author = c?.author ?? c?.authorId ?? c?.user;
  if (!author) return "unknown";

  if (typeof author === "object") {
    return author.username || author.name || author._id || "unknown";
  }

  return String(author);
}

function formatCommentTime(t) {
  try {
    if (!t) return "vừa xong";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return String(t);
    return d.toLocaleString();
  } catch {
    return "vừa xong";
  }
}

export default function CommentModal({ post, open, onClose, onCommentCreated }) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const postId = post?._id || post?.id;

  useEffect(() => {
    if (!open || !postId) return;

    let alive = true;

    const loadComments = async () => {
      try {
        setLoading(true);
        setText("");

        const payload = await feedApi.getComments(postId, {
          page: 1,
          pageSize: 20,
        });

        const list = normalizeComments(payload);
        if (alive) setItems(list);
      } catch (error) {
        console.error("Load comments error:", error);
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadComments();

    return () => {
      alive = false;
    };
  }, [open, postId]);

  const handleSend = async () => {
    if (!text.trim() || !postId || sending) return;

    try {
      setSending(true);

      const created = await feedApi.createComment(postId, {
        content: text.trim(),
      });

      setItems((s) => [created, ...s]);
      setText("");
      onCommentCreated?.(postId, created);
    } catch (error) {
      console.error("Create comment error:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <ModalShell
      open={open}
      title={`Bình luận • ${post ? pickTitle(post) : ""}`}
      onClose={onClose}
    >
      <div className="flex gap-3 items-start">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400/25 via-purple-500/15 to-pink-500/15 border border-white/10" />
        <div className="flex-1">
          <div
            className={cx(
              "rounded-2xl border border-cyan-300/20 bg-white/5",
              "shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_18px_rgba(34,211,238,0.08)]",
              "px-4 py-3"
            )}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Viết bình luận…"
              className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
            />

            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className={cx(
                  "h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2",
                  "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_18px_rgba(34,211,238,0.12)]",
                  (sending || !text.trim()) && "opacity-70 cursor-not-allowed"
                )}
                type="button"
              >
                <Send className="h-4 w-4 text-cyan-200/90" />
                <span className="text-xs font-bold text-slate-100/90">
                  {sending ? "Đang gửi..." : "Gửi"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 max-h-[52vh] overflow-auto pr-1">
        {loading && (
          <div className="text-sm text-slate-400">Đang tải bình luận...</div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-sm text-slate-400">Chưa có bình luận nào.</div>
        )}

        {!loading &&
          items.map((c, idx) => (
            <motion.div
              key={getCommentId(c, idx)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10" />
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-slate-200/90 font-bold">
                    @{getCommentAuthor(c)}
                  </span>
                  <span>•</span>
                  <span>{formatCommentTime(c?.createdAt || c?.time)}</span>
                </div>
                <div
                  className={cx(
                    "mt-1 rounded-2xl px-4 py-3 text-sm text-slate-200/90",
                    "bg-white/[0.06] border border-white/10",
                    "shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_0_18px_rgba(34,211,238,0.06)]"
                  )}
                >
                  {c?.content || ""}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </ModalShell>
  );
}