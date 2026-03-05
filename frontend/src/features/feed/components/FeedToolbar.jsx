import GlassCard from "../../../shared/components/GlassCard";
import { Search } from "lucide-react";
import FeedFilterBar from "../components/FeedFilterBar";
import { cx } from "../utils/feedHelpers";

export default function FeedToolbar({ query, setQuery, activeFilter, setActiveFilter }) {
  return (
    <GlassCard className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
       

        <div className="md:flex-1">
          <FeedFilterBar active={activeFilter} onChange={setActiveFilter} />
        </div>
      </div>
    </GlassCard>
  );
}