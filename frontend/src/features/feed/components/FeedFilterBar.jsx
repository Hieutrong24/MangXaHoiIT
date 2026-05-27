import Button from "../../../shared/components/Button";
import { SlidersHorizontal, Search } from "lucide-react";

const filters = ["Mới nhất", "Trending", "Theo dõi", "DSA", "SQL", "React"];

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function FeedFilterBar({
  active = "Mới nhất",
  onChange,
  query = "",
  onQueryChange,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Tìm bài viết, tag hoặc tác giả..."
            className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/30 focus:bg-slate-950"
          />
        </div>

        <Button
          variant="ghost"
          className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-slate-200 hover:bg-white/[0.08] xl:self-auto"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-300" />
            Tuỳ chỉnh
          </span>
        </Button>
      </div>

      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2 px-1">
          {filters.map((f) => {
            const isActive = active === f;

            return (
              <button
                key={f}
                onClick={() => onChange?.(f)}
                className={cx(
                  "relative rounded-2xl border px-4 py-2.5 text-xs font-semibold tracking-wide transition-all",
                  "bg-slate-900/70 text-slate-300 border-white/10 hover:border-slate-600 hover:bg-slate-800/90",
                  isActive &&
                    "border-cyan-400/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_10px_24px_rgba(34,211,238,0.10)]"
                )}
                type="button"
              >
                {f}
                <span
                  className={cx(
                    "pointer-events-none absolute inset-x-3 bottom-0 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
