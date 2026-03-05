import Button from "../../../shared/components/Button";
import { SlidersHorizontal } from "lucide-react";

const filters = ["Mới nhất", "Trending", "Theo dõi", "DSA", "SQL", "React"];

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function FeedFilterBar({ active = "Mới nhất", onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => {
        const isActive = active === f;

        return (
          <button
            key={f}
            onClick={() => onChange?.(f)}
            className={cx(
              "relative px-3 py-2 rounded-2xl text-xs font-extrabold tracking-tight border transition-all",
              "bg-white/5 border-white/10 hover:bg-white/10",
              "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_18px_rgba(34,211,238,0.10)]",
              isActive &&
                "bg-cyan-300/10 border-cyan-300/25 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_22px_rgba(34,211,238,0.12)]"
            )}
          >
            {f}

            {/* underline neon */}
            <span
              className={cx(
                "pointer-events-none absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full transition-opacity",
                isActive ? "opacity-100" : "opacity-0",
                "bg-gradient-to-r from-cyan-400/80 via-purple-400/70 to-pink-400/70"
              )}
            />
          </button>
        );
      })}

      <div className="flex-1" />

      <Button variant="ghost" className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Tuỳ chỉnh
      </Button>
    </div>
  );
}