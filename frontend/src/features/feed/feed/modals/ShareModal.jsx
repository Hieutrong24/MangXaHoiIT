import { useState } from "react";
import {
  Copy,
  Users,
  MessageSquareText,
  Compass,
  Hash,
  Link2,
} from "lucide-react";
import ModalShell from "./ModalShell";
import { cx, pickTitle } from "../utils/feedHelpers";
import { feedApi } from "../api/feed.api";

export default function ShareModal({ post, open, onClose }) {
  const [sharing, setSharing] = useState(false);

  const postId = post?._id || post?.id;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${postId}`
      : `/posts/${postId}`;

  const markShared = async () => {
    if (!postId) return null;
    return feedApi.sharePost(postId);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
      await markShared();
    } catch (error) {
      console.error("Copy/share error:", error);
    }
  };

  const handleAction = async (type) => {
    if (!postId || sharing) return;

    setSharing(true);
    try {
      await markShared();

      if (type === "external" && typeof window !== "undefined") {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }

      if (type === "save-link") {
        await navigator.clipboard?.writeText(shareUrl);
      }
    } catch (error) {
      console.error("Share action error:", error);
    } finally {
      setSharing(false);
    }
  };

  const actions = [
    {
      key: "group",
      label: "Share group",
      icon: Users,
      glow: "rgba(34,211,238,0.14)",
    },
    {
      key: "chat",
      label: "Share chat",
      icon: MessageSquareText,
      glow: "rgba(168,85,247,0.14)",
    },
    {
      key: "external",
      label: "External",
      icon: Compass,
      glow: "rgba(236,72,153,0.14)",
    },
    {
      key: "save-link",
      label: "Save link",
      icon: Hash,
      glow: "rgba(14,165,233,0.14)",
    },
  ];

  return (
    <ModalShell
      open={open}
      title={`Chia sẻ • ${post ? pickTitle(post) : ""}`}
      onClose={onClose}
      panelClassName="w-[min(760px,96vw)]"
    >
      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[#111827]/70 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            <Link2 className="h-3.5 w-3.5" />
            Link bài viết
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-slate-950/80 p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 truncate font-mono text-sm text-slate-100/90">
              {shareUrl}
            </div>
            <button
              onClick={copyLink}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-50 transition hover:bg-cyan-400/15"
              type="button"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((x) => (
            <button
              key={x.key}
              onClick={() => handleAction(x.key)}
              disabled={sharing}
              className={cx(
                "rounded-[24px] border border-white/10 bg-[#111827]/70 p-4 text-left transition",
                "hover:-translate-y-0.5 hover:bg-[#111827]",
                sharing && "cursor-not-allowed opacity-70"
              )}
              style={{
                boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 16px 40px rgba(0,0,0,0.22), 0 0 28px ${x.glow}`,
              }}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-950/80 text-slate-100">
                    <x.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-100">{x.label}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Chia sẻ nhanh theo ngữ cảnh hiện tại.
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}
