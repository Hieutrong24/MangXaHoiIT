import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ModalShell from "./ModalShell";
import { cx, pickTitle } from "../utils/feedHelpers";

export default function CommentModal({ post, open, onClose }) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    setText("");
    setItems([
      { id: 1, user: "hieu.it", content: "Snippet này clean ghê 🔥", time: "vừa xong" },
      { id: 2, user: "khoi.dev", content: "Cho mình xin thêm context về bài này", time: "1 phút" },
    ]);
  }, [open]);

  const handleSend = () => {
    if (!text.trim()) return;
    setItems((s) => [
      { id: Date.now(), user: "you", content: text.trim(), time: "vừa xong" },
      ...s,
    ]);
    setText("");
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
                className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center gap-2
                           hover:shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_18px_rgba(34,211,238,0.12)]"
              >
                <Send className="h-4 w-4 text-cyan-200/90" />
                <span className="text-xs font-bold text-slate-100/90">Gửi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 max-h-[52vh] overflow-auto pr-1">
        {items.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10" />
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-200/90 font-bold">@{c.user}</span>
                <span>•</span>
                <span>{c.time}</span>
              </div>
              <div
                className={cx(
                  "mt-1 rounded-2xl px-4 py-3 text-sm text-slate-200/90",
                  "bg-white/[0.06] border border-white/10",
                  "shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_0_18px_rgba(34,211,238,0.06)]"
                )}
              >
                {c.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ModalShell>
  );
}