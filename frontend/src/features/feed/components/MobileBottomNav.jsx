import { Home, Compass, Plus, MessageSquareText, User } from "lucide-react";

export default function MobileBottomNav() {
  const items = [
    { label: "Feed", icon: Home },
    { label: "Explore", icon: Compass },
    { label: "New", icon: Plus },
    { label: "Chat", icon: MessageSquareText },
    { label: "Me", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="w-full px-4 pb-4">
        <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
          <div className="grid grid-cols-5">
            {items.map((it) => (
              <button
                key={it.label}
                className="py-3 flex flex-col items-center gap-1 text-[10px] font-bold text-slate-200/80 hover:text-cyan-200 transition"
              >
                <it.icon className="h-5 w-5" />
                {it.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}