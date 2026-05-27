// src/features/search/components/SearchResults.jsx
import GlassCard from "../../../shared/components/GlassCard";

export default function SearchResults({ items = [] }) {
  if (items.length === 0) {
    return <div className="text-sm text-slate-400">Không có kết quả.</div>;
  }

  return (
    <div className="grid gap-3">
      {items.map((it) => (
        <a key={it.id} href={`/posts/${it.id}`}>
          <GlassCard className="p-4 hover:bg-white/10 transition">
            <div className="font-extrabold">{it.title}</div>
            <div className="text-sm text-slate-300 mt-1">{it.excerpt}</div>
          </GlassCard>
        </a>
      ))}
    </div>
  );
}
