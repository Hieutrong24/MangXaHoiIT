// src/features/chat/call/IncomingCallModal.jsx
import Button from "../../../shared/components/Button";
import GlassCard from "../../../shared/components/GlassCard";
import { PhoneOff, Video } from "lucide-react";
import { useMemo, useState } from "react";

function shortId(id) {
  if (!id) return "";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

export default function IncomingCallModal({ open, call, caller, onAccept, onReject }) {
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => {
    const type = call?.type === "video" ? "Gọi video" : "Gọi thoại";
    return type;
  }, [call?.type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 grid place-items-center p-4">
      <GlassCard className="w-full max-w-xl p-6">
        <div className="text-xl font-bold mb-3">Cuộc gọi đến</div>

        <div className="opacity-90">
          <div className="font-semibold">
            {caller?.fullName || caller?.username || "Người dùng"}{" "}
            <span className="opacity-70">(ID: {shortId(caller?.userId || caller?.id)})</span>
          </div>
          <div className="text-sm opacity-70 mt-1">Loại: {title}</div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
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
          >
            <PhoneOff size={16} />
          </Button>

          <Button
            title="Chấp nhận"
            disabled={busy}
            onClick={async () => {
              try {
                setBusy(true);
                await onAccept?.(); // ✅ await để bắt lỗi permission/webrtc
              } finally {
                setBusy(false);
              }
            }}
          >
            <Video size={16} />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}