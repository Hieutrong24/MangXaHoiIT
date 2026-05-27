import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageCircle,
  Clock3,
  Sparkles,
  Loader2,
} from "lucide-react";
import ModalShell from "./ModalShell";
import { cx, pickTitle } from "../utils/feedHelpers";
import { feedApi } from "../api/feed.api";
import { http } from "../../../services/http";
import { buildAvatarCandidates } from "../../../shared/utils/avatar";

function normalizeComments(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.users && Array.isArray(payload.users)) return payload.users;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  if (payload?.data?.users && Array.isArray(payload.data.users)) return payload.data.users;
  return [];
}

function getCommentId(c, idx) {
  return c?._id || c?.id || `${idx}`;
}

function getUserKey(user) {
  return (
    user?.userId ||
    user?.id ||
    user?._id ||
    user?.UserId ||
    user?.Id ||
    ""
  );
}

function buildAuthorObject(user, authorId) {
  if (!user) return null;

  return {
    id: getUserKey(user) || authorId,
    username: user?.username || user?.userName || user?.Username || null,
    fullName:
      user?.fullName ||
      user?.displayName ||
      user?.name ||
      user?.Name ||
      null,
    avatarUrl:
      user?.avatarUrl ||
      user?.avatar ||
      user?.profilePicture ||
      user?.photoUrl ||
      "",
  };
}

function enrichCommentsWithUsers(comments, usersMap) {
  return comments.map((c) => {
    const authorId = String(c?.authorId || c?.author || c?.user || "");
    const rawUser = usersMap.get(authorId) || null;

    return {
      ...c,
      author:
        c?.author && typeof c.author === "object"
          ? c.author
          : buildAuthorObject(rawUser, authorId),
    };
  });
}

function getCommentAuthor(c) {
  return (
    c?.author?.fullName ||
    c?.author?.username ||
    c?.author?.name ||
    "unknown"
  );
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

function CommentAvatar({ author, size = "md" }) {
  const candidates = buildAvatarCandidates(author || {});
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [author]);

  const sizeClass =
    size === "lg" ? "h-11 w-11 rounded-2xl" : "h-10 w-10 rounded-2xl";

  return (
    <div
      className={cx(
        sizeClass,
        "overflow-hidden border border-white/10 bg-white/[0.06]",
        "ring-1 ring-cyan-400/10 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
      )}
    >
      <img
        src={candidates[idx]}
        alt="avatar"
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => {
          setIdx((i) => (i + 1 < candidates.length ? i + 1 : i));
        }}
        draggable={false}
      />
    </div>
  );
}

function SkeletonComment() {
  return (
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-2xl bg-white/5 animate-pulse" />
      <div className="flex-1">
        <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
        <div className="mt-2 h-16 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

function CommentCard({ comment, idx }) {
  return (
    <motion.div
      key={getCommentId(comment, idx)}
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative flex gap-3"
    >
      <div className="relative pt-1">
        <CommentAvatar author={comment?.author} />
        <div className="absolute left-1/2 top-12 bottom-[-16px] w-px -translate-x-1/2 bg-gradient-to-b from-white/10 to-transparent group-last:hidden" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-slate-100">
            {getCommentAuthor(comment)}
          </span>

          <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200/90">
            Member
          </span>

          <span className="text-slate-500">•</span>

          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            {formatCommentTime(comment?.createdAt || comment?.time)}
          </span>
        </div>

        <div
          className={cx(
            "mt-2 rounded-[22px] border px-4 py-3.5 text-sm leading-6 text-slate-200",
            "border-white/10 bg-white/[0.06] backdrop-blur-md",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_40px_rgba(0,0,0,0.22)]",
            "transition duration-200 group-hover:border-cyan-300/20 group-hover:bg-white/[0.075]"
          )}
        >
          {comment?.content || ""}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommentModal({
  post,
  open,
  onClose,
  onCommentCreated,
}) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const postId = post?._id || post?.id;
  const title = useMemo(() => (post ? pickTitle(post) : ""), [post]);

  useEffect(() => {
    if (!open || !postId) return;

    let alive = true;

    const loadComments = async () => {
      try {
        setLoading(true);
        setText("");

        const [commentsPayload, usersRes] = await Promise.all([
          feedApi.getComments(postId, {
            page: 1,
            pageSize: 20,
          }),
          http.get("/users", {
            params: { page: 1, pageSize: 500 },
          }),
        ]);

        const comments = normalizeComments(commentsPayload);
        const users = normalizeUsers(usersRes.data);

        const usersMap = new Map();
        users.forEach((u) => {
          const key = String(getUserKey(u) || "");
          if (key) usersMap.set(key, u);
        });

        const enriched = enrichCommentsWithUsers(comments, usersMap);

        if (alive) setItems(enriched);
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

      const currentUser =
        JSON.parse(localStorage.getItem("user") || "null") || null;

      const enrichedCreated = {
        ...created,
        author:
          created?.author && typeof created.author === "object"
            ? created.author
            : currentUser
            ? {
                id:
                  currentUser?.id ||
                  currentUser?._id ||
                  currentUser?.userId ||
                  "",
                username:
                  currentUser?.username || currentUser?.userName || null,
                fullName: currentUser?.fullName || currentUser?.name || null,
                avatarUrl:
                  currentUser?.avatarUrl || currentUser?.avatar || "",
              }
            : null,
      };

      setItems((s) => [enrichedCreated, ...s]);
      setText("");
      onCommentCreated?.(postId, enrichedCreated);
    } catch (error) {
      console.error("Create comment error:", error);
    } finally {
      setSending(false);
    }
  };

  const canSend = !!text.trim() && !sending;
  const commentCount = items.length;
  const charCount = text.trim().length;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title=""
      panelClassName="w-[min(1040px,96vw)]"
    >
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111827]/95 text-slate-100 shadow-[0_30px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_20%)]" />

        <div className="relative border-b border-white/10 px-6 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/90">
                <Sparkles className="h-3.5 w-3.5" />
                Comment Center
              </div>

              <h2 className="mt-3 line-clamp-2 text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                Bình luận • {title}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Theo dõi thảo luận, phản hồi nhanh và quản lý bình luận theo
                phong cách hiện đại hơn.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Total comments
                </div>
                <div className="text-lg font-bold text-white">
                  {loading ? "..." : commentCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative grid gap-0 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#111827]/88 px-6 py-4 backdrop-blur-xl sm:px-7">
              <div className="flex gap-3">
                <div className="pt-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-fuchsia-500/10 text-cyan-200 shadow-[0_8px_24px_rgba(34,211,238,0.12)]">
                    <Send className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex-1">
                  <div
                    className={cx(
                      "rounded-[24px] border bg-white/[0.05] p-3.5 backdrop-blur-md transition duration-200",
                      "border-cyan-300/15 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_14px_40px_rgba(0,0,0,0.20)]",
                      "focus-within:border-cyan-300/30 focus-within:bg-white/[0.07]",
                      "focus-within:shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_28px_rgba(34,211,238,0.10)]"
                    )}
                  >
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Viết bình luận của bạn…"
                      rows={3}
                      className="max-h-40 min-h-[88px] w-full resize-none bg-transparent text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                          Nhấn gửi để đăng ngay
                        </span>
                        <span>{charCount} ký tự</span>
                      </div>

                      <button
                        onClick={handleSend}
                        disabled={!canSend}
                        type="button"
                        className={cx(
                          "inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition",
                          "border border-cyan-300/20 bg-gradient-to-r from-cyan-400/20 to-sky-500/20 text-white",
                          "shadow-[0_10px_30px_rgba(34,211,238,0.16)] hover:from-cyan-400/30 hover:to-sky-500/30",
                          !canSend &&
                            "cursor-not-allowed opacity-55 saturate-50"
                        )}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {sending ? "Đang gửi..." : "Gửi bình luận"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-[58vh] space-y-5 overflow-auto px-6 py-5 pr-4 sm:px-7">
              {loading && (
                <>
                  <SkeletonComment />
                  <SkeletonComment />
                  <SkeletonComment />
                </>
              )}

              {!loading && items.length === 0 && (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/60 px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-200">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-slate-100">
                    Chưa có bình luận nào
                  </div>
                  <div className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Hãy bắt đầu cuộc trò chuyện đầu tiên bằng một bình luận ngắn,
                    rõ ràng và hữu ích.
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {!loading &&
                  items.map((c, idx) => (
                    <CommentCard
                      key={getCommentId(c, idx)}
                      comment={c}
                      idx={idx}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="space-y-4 p-5">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.16)]">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Discussion stats
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-slate-400">Tổng bình luận</div>
                    <div className="mt-1 text-2xl font-bold text-white">
                      {loading ? "..." : commentCount}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-slate-400">Bài viết</div>
                    <div className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-200">
                      {title || "Không có tiêu đề"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-xs text-slate-400">Trạng thái</div>
                    <div className="mt-2 inline-flex rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                      Active thread
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </aside>
        </div>
      </div>
    </ModalShell>
  );
}