import { Clock3 } from "lucide-react";

export default function MessageBubble({ m }) {
  const mine = m.mine;

  return (
    <div className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm shadow-[0_6px_18px_rgba(0,0,0,0.12)] sm:max-w-[78%]",
          mine ? "rounded-br-md bg-[#1f6feb]/20 text-[#f0f6fc]" : "rounded-bl-md bg-[#161b22] text-[#c9d1d9]",
        ].join(" ")}
      >
        {!mine && m.author ? (
          <div className="mb-1 text-[11px] font-medium text-[#58a6ff]">@{m.author}</div>
        ) : null}

        <div className="whitespace-pre-wrap break-words text-[13px] leading-6 text-inherit sm:text-sm">
          {m.text}
        </div>

        <div
          className={[
            "mt-1.5 flex items-center justify-end gap-1.5 text-[11px]",
            mine ? "text-[#c9d1d9]/70" : "text-[#8b949e]",
          ].join(" ")}
        >
          {m._optimistic ? <span className="text-[10px] uppercase tracking-[0.08em]">Đang gửi</span> : null}
          <Clock3 size={10} />
          <span>{m.time}</span>
        </div>
      </div>
    </div>
  );
}
