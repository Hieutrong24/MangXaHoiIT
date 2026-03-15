// src/features/chat/components/MessageBubble.jsx
export default function MessageBubble({ m }) {
  const mine = m.mine;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm border " +
          (mine
            ? "bg-gradient-to-r from-violet-500/30 via-cyan-500/20 to-emerald-500/20 border-white/10"
            : "bg-white/5 border-white/10")
        }
      >
        {!mine && <div className="text-xs text-slate-400 mb-1">@{m.author}</div>}
        <div className="text-slate-100">{m.text}</div>
        <div className="mt-1 text-[11px] text-slate-400">{m.time}</div>
      </div>
    </div>
  );
}
