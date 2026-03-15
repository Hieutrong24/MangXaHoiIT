// src/features/chat/call/CallModal.jsx
import { useEffect, useMemo, useRef } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { PhoneOff } from "lucide-react";

function shortId(id) {
  if (!id) return "";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

export default function CallModal({ open, call, peer, onHangup }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const isVideo = call?.type === "video";

  const statusText = useMemo(() => {
    const st = call?.status;
    if (st === "calling") return "Đang gọi…";
    if (st === "connecting") return "Đang kết nối…";
    if (st === "active") return "Đang trong cuộc gọi";
    return "—";
  }, [call?.status]);

  // ✅ attach streams to elements
  useEffect(() => {
    if (!open) return;

    const localEl = localVideoRef.current;
    const remoteEl = remoteVideoRef.current;
    const remoteAudioEl = remoteAudioRef.current;

    if (localEl && call?.localStream) {
      localEl.srcObject = call.localStream;
    }
    if (remoteEl && call?.remoteStream) {
      remoteEl.srcObject = call.remoteStream;
    }
    if (remoteAudioEl && call?.remoteStream) {
      remoteAudioEl.srcObject = call.remoteStream;
    }
  }, [open, call?.localStream, call?.remoteStream]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 grid place-items-center p-4">
      <GlassCard className="w-full max-w-4xl p-4">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {peer?.fullName || peer?.username || "Người dùng"}{" "}
              <span className="opacity-70 text-sm">(ID: {shortId(peer?.userId || peer?.id)})</span>
            </div>
            <div className="text-sm opacity-70">{statusText}</div>
          </div>

          <Button title="Kết thúc" onClick={onHangup}>
            <PhoneOff size={16} />
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          {isVideo ? (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden bg-black/30">
                <div className="text-xs opacity-70 p-2">Remote</div>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[320px] object-cover"
                />
              </div>

              <div className="rounded-xl overflow-hidden bg-black/30">
                <div className="text-xs opacity-70 p-2">You</div>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[320px] object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-black/20 p-4">
              <div className="opacity-80">Gọi thoại đang diễn ra…</div>
              {/* ✅ audio for remote in audio-call */}
              <audio ref={remoteAudioRef} autoPlay />
            </div>
          )}
        </div>
      </GlassCard>
    </div>  
  );
}