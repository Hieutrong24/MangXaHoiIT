import GlassCard from "../../../shared/components/GlassCard";
import Input from "../../../shared/components/Input";
import { useSearchParams } from "react-router-dom";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  return (
    <div className="grid gap-4">
      <GlassCard className="p-5">
        <div className="text-xl font-extrabold tracking-tight">Tìm kiếm</div>
        <div className="mt-3">
          <Input defaultValue={q} placeholder="Nhập từ khoá..." />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="text-sm text-slate-300">
          Kết quả cho: <span className="font-bold text-slate-100">{q || "(trống)"}</span>
        </div>
      </GlassCard>
    </div>
  );
}
