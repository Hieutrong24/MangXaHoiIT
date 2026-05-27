import GlassCard from "../../../shared/components/GlassCard";
import { Link } from "react-router-dom";

const tags = ["dsa", "sql", "oop", "csharp", "react", "docker", "linux", "networking"];

export default function TagsPage() {
  return (
    <GlassCard className="p-6">
      <div className="text-xl font-extrabold tracking-tight">Chủ đề</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t}
            to={`/tags/${t}`}
            className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition"
          >
            #{t}
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
