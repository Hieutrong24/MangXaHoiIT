import { useEffect, useMemo, useRef, useState } from "react";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Phone, Video, Info } from "lucide-react";
import MessageBubble from "./MessageBubble";

function shortId(id) {
  if (!id) return "";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

function Avatar({ src, name, size = 38 }) {
  const [bad, setBad] = useState(false);

  if (!src || bad) {
    return (
      <div
        className="rounded-full grid place-items-center bg-white/10 text-white/90 font-semibold"
        style={{ width: size, height: size }}
        title={name}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setBad(true)}
      className="rounded-full object-cover bg-white/10"
      style={{ width: size, height: size }}
    />
  );
}

/**
 * messages: [{ id, mine, text, time, createdAtMs? }]
 * peer: { fullName/username, avatarUrl, userId }
 */
export default function ChatRoom({
  peer,
  messages = [],
  onSend,
  sending = false,
  onCall,
  onVideo,
  onInfo,
}) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  // sort CHẮC CHẮN theo thời gian tăng dần (cũ -> mới)
  const sorted = useMemo(() => {
    const arr = [...messages];
    arr.sort((a, b) => {
      const ta = a.createdAtMs ?? (a.time ? Date.parse(a.time) : 0);
      const tb = b.createdAtMs ?? (b.time ? Date.parse(b.time) : 0);
      return ta - tb;
    });
    return arr;
  }, [messages]);

  // auto-scroll: chỉ cuộn xuống nếu user đang ở gần đáy
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [sorted.length]);

  function handleSend() {
    const value = text.trim();
    if (!value) return;
    onSend?.(value);
    setText("");
  }

  return (
    <div className="flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={peer?.avatarUrl} name={peer?.fullName || peer?.username} />
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {peer?.fullName || peer?.username || "Người dùng"}
            </div>
            <div className="text-xs opacity-70 truncate">ID: {shortId(peer?.userId || peer?.id)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button title="Gọi thoại" onClick={onCall}>
            <Phone size={16} />
          </Button>
          <Button title="Gọi video" onClick={onVideo}>
            <Video size={16} />
          </Button>
          <Button title="Thông tin" onClick={onInfo}>
            <Info size={16} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-auto pr-2 space-y-2 pt-3">
        {sorted.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2 items-center">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={sending || !text.trim()}>
          {sending ? "..." : "Gửi"}
        </Button>
      </div>
    </div>
  );
}