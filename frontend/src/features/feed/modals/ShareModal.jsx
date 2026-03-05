import { Copy, Users, MessageSquareText, Compass, Hash } from "lucide-react";
import ModalShell from "./ModalShell";
import { cx, pickTitle } from "../utils/feedHelpers";

export default function ShareModal({ post, open, onClose }) {
  const postId = post?._id || post?.id;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${postId}`
      : `/posts/${postId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
    } catch {}
  };

  const actions = [
    { label: "Share group", icon: Users, glow: "rgba(34,211,238,0.22)" },
    { label: "Share chat", icon: MessageSquareText, glow: "rgba(168,85,247,0.22)" },
    { label: "External", icon: Compass, glow: "rgba(236,72,153,0.22)" },
    { label: "Save link", icon: Hash, glow: "rgba(34,211,238,0.18)" },
  ];

  return (
    <ModalShell
      open={open}
      title={`Chia sẻ • ${post ? pickTitle(post) : ""}`}
      onClose={onClose}
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-slate-400">Link bài viết</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 truncate text-sm text-slate-100/90 font-mono">
            {shareUrl}
          </div>
          <button
            onClick={copyLink}
            className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2
                       hover:shadow-[0_0_0_1px_rgba(236,72,153,0.22),0_0_18px_rgba(236,72,153,0.12)]"
          >
            <Copy className="h-4 w-4 text-pink-200/90" />
            <span className="text-xs font-bold text-slate-100/90">Copy</span>
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((x) => (
          <button
            key={x.label}
            onClick={() => {}}
            className={cx(
              "h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition",
              "inline-flex items-center justify-center gap-2 text-xs font-extrabold text-slate-100/90",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_30px_rgba(0,0,0,0.35)]"
            )}
            style={{
              boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 0 22px ${x.glow}, 0 14px 30px rgba(0,0,0,0.35)`,
            }}
          >
            <x.icon className="h-4 w-4" />
            {x.label}
          </button>
        ))}
      </div>
    </ModalShell>
  );
}