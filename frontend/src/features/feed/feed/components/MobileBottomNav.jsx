import { Home, Compass, Plus, MessageSquareText, User } from "lucide-react";

export default function MobileBottomNav() {
  const items = [
    { label: "Feed", icon: Home, active: true },
    { label: "Explore", icon: Compass },
    { label: "New", icon: Plus, primary: true },
    { label: "Chat", icon: MessageSquareText },
    { label: "Me", icon: User },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020617] via-[#020617]/85 to-transparent" />
      <div className="relative px-3 pb-3 pt-6">
        <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-[#0f172a]/92 px-2 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="grid grid-cols-5 gap-1">
            {items.map((it) => (
              <button
                key={it.label}
                className={[
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition",
                  it.primary
                    ? "bg-cyan-400/12 text-cyan-100 shadow-[0_10px_24px_rgba(34,211,238,0.12)]"
                    : it.active
                    ? "bg-white/[0.06] text-slate-50"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                ].join(" ")}
                type="button"
              >
                <it.icon className={it.primary ? "h-5 w-5" : "h-4 w-4"} />
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
