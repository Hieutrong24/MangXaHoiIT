import GlassCard from "../../../shared/components/GlassCard";
import FeedFilterBar from "../components/FeedFilterBar";

export default function FeedToolbar({ query, setQuery, activeFilter, setActiveFilter }) {
  return (
    <GlassCard className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-5">
      <FeedFilterBar
        active={activeFilter}
        onChange={setActiveFilter}
        query={query}
        onQueryChange={setQuery}
      />
    </GlassCard>
  );
}
