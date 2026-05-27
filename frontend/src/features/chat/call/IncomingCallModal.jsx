import Button from "../../../shared/components/Button";
import GlassCard from "../../../shared/components/GlassCard";
import { PhoneIncoming, PhoneOff, Video } from "lucide-react";
import { useMemo, useState } from "react";

function shortId(id) {
  if (!id) return "";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

export default function IncomingCallModal({ open, call, caller, onAccept, onReject }) {
  const [busy, setBusy] = useState(false);
  const callerName = caller?.fullName || caller?.username || "Người dùng";

  const title = useMemo(() => {
    return call?.type === "video" ? "Gọi video" : "Gọi thoại";
  }, [call?.type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="!border-0 w-full max-w-md overflow-hidden rounded-2xl !bg-[#161b22] p-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="px-5 py-5 text-center sm:px-6 sm:py-6">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#21262d] text-xl font-semibold text-[#f0f6fc]">
            {initials(callerName)}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#0d1117] px-3 py-1 text-xs font-medium text-[#58a6ff]">
            <PhoneIncoming size={13} />
            Cuộc gọi đến
          </div>

          <div className="mt-4 text-xl font-semibold text-[#f0f6fc]">{callerName}</div>
          <div className="mt-1 text-sm text-[#8b949e]">ID: {shortId(caller?.userId || caller?.id)}</div>
          <div className="mt-4 rounded-xl bg-[#0d1117] px-3 py-3 text-sm text-[#c9d1d9]">
            Loại cuộc gọi: <span className="font-medium text-[#f0f6fc]">{title}</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button
              title="Từ chối"
              disabled={busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  await onReject?.();
                } finally {
                  setBusy(false);
                }
              }}
              className="!h-11 !rounded-xl !bg-[#da3633]/15 !px-4 !py-3 !text-[#ff7b72] !shadow-none hover:!bg-[#da3633]/25"
            >
              <span className="flex items-center justify-center gap-2">
                <PhoneOff size={16} />
                <span>Từ chối</span>
              </span>
            </Button>

            <Button
              title="Chấp nhận"
              disabled={busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  await onAccept?.();
                } finally {
                  setBusy(false);
                }
              }}
              className="!h-11 !rounded-xl !bg-[#238636] !px-4 !py-3 !font-semibold !text-white !shadow-none hover:!bg-[#2ea043]"
            >
              <span className="flex items-center justify-center gap-2">
                <Video size={16} />
                <span>Chấp nhận</span>
              </span>
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
