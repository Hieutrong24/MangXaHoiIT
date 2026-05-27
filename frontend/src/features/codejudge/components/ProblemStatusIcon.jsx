import { Check, CircleDashed, Minus } from "lucide-react";

export default function ProblemStatusIcon({ status }) {
  if (status === "Đã AC") {
    return <Check className="h-4 w-4 text-emerald-400" />;
  }
  if (status === "Đã thử") {
    return <CircleDashed className="h-4 w-4 text-amber-300" />;
  }
  return <Minus className="h-4 w-4 text-slate-500" />;
}
