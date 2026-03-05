// src/features/chat/components/ChatList.jsx
export default function ChatList({ rooms = [], activeId, onSelect }) {
  return (
    <div className="grid gap-2">
      {rooms.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect?.(r.id)}
          className={
            "text-left rounded-2xl border p-4 transition " +
            (activeId === r.id ? "bg-white/10 border-white/10" : "bg-white/5 border-white/10 hover:bg-white/10")
          }
        >
          <div className="font-bold">{r.title}</div>
          <div className="text-xs text-slate-400 mt-1">{r.lastMessage || "Chưa có tin nhắn"}</div>
        </button>
      ))}
    </div>
  );
}
