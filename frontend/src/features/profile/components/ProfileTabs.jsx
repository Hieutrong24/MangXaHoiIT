import { cn } from "../../../shared/utils/cn";

export default function ProfileTabs({ tab = "posts", onChange, counts = {} }) {
  const tabs = [
    { key: "posts", label: "Bài viết", count: counts?.posts },
    { key: "about", label: "Giới thiệu" },
    { key: "saved", label: "Đã lưu", count: counts?.saved },
  ];

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
      {tabs.map((t) => {
        const active = tab === t.key;
        const hasCount = typeof t.count === "number";

        return (
          <button
            key={t.key}
            onClick={() => onChange?.(t.key)}
            className={cn(
              "group px-4 py-2 rounded-2xl text-sm font-extrabold transition-all inline-flex items-center gap-2",
              active
                ? "bg-gradient-to-r from-indigo-600/40 via-cyan-500/25 to-purple-600/40 border border-white/10 text-white shadow-[0_0_18px_rgba(99,102,241,0.20)]"
                : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
            )}
          >
            <span>{t.label}</span>

            {hasCount ? (
              <span
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full border transition",
                  active
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-300 group-hover:text-white"
                )}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}