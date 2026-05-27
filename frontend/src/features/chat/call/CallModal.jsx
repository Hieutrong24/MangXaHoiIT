import { useEffect, useMemo, useRef } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { PhoneOff, Mic, Video } from "lucide-react";

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

export default function CallModal({ open, call, peer, onHangup }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const isVideo = call?.type === "video";
  const peerName = peer?.fullName || peer?.username || "Người dùng";

  const statusText = useMemo(() => {
    const st = call?.status;
    if (st === "calling") return "Đang gọi…";
    if (st === "connecting") return "Đang kết nối…";
    if (st === "active") return "Đang trong cuộc gọi";
    return "—";
  }, [call?.status]);

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
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#05030a]/80 p-3 backdrop-blur-sm sm:p-4">
      <GlassCard className="!border-0 w-full max-w-4xl overflow-hidden rounded-2xl !bg-[#140f24] p-0 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col gap-4 bg-[#140f24] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-[#f5f3ff] sm:text-lg">
              {peerName}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#a79dbd] sm:text-sm">
              <span className="rounded-full bg-[#0d0a18] px-3 py-1 text-[#d6d0e5]">
                ID: {shortId(peer?.userId || peer?.id)}
              </span>
              <span className="rounded-full bg-[#6d28d9]/15 px-3 py-1 text-[#c4b5fd]">
                {statusText}
              </span>
            </div>
          </div>

          <Button
            title="Kết thúc"
            onClick={onHangup}
            className="!h-10 !rounded-lg !bg-[#2a163f] !px-4 !py-2 !text-[#f0abfc] !shadow-none hover:!bg-[#341a4d]"
          >
            <span className="flex items-center gap-2">
              <PhoneOff size={15} />
              <span>Kết thúc</span>
            </span>
          </Button>
        </div>

        <div className="bg-[#0d0a18] p-4 sm:p-5">
          {isVideo ? (
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="block h-[320px] w-full bg-black object-cover sm:h-[480px]"
              />

              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-[#120d1f]/75 px-3 py-1.5 text-xs text-[#f5f3ff] backdrop-blur-sm">
                <Video size={12} />
                Cuộc gọi video
              </div>

              <div className="absolute bottom-3 right-3 w-[38%] max-w-[220px] min-w-[120px] overflow-hidden rounded-xl bg-[#1a1330] shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                <div className="px-3 py-2 text-xs text-[#b3a8ca]">Bạn</div>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="block h-[120px] w-full bg-black object-cover sm:h-[160px]"
                />
              </div>
            </div>
          ) : (
            <div className="grid min-h-[320px] place-items-center rounded-2xl bg-[#140f24] px-6 py-10 text-center sm:min-h-[360px]">
              <div>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-[#211735] text-2xl font-semibold text-[#f5f3ff] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  {initials(peerName)}
                </div>

                <div className="mt-4 text-xl font-semibold text-[#f5f3ff]">
                  {peerName}
                </div>

                <div className="mt-2 text-sm text-[#a79dbd]">
                  Gọi thoại đang diễn ra…
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0d0a18] px-3 py-1.5 text-sm text-[#ddd6fe]">
                  <Mic size={13} className="text-[#c084fc]" />
                  Âm thanh đang hoạt động
                </div>
              </div>

              <audio ref={remoteAudioRef} autoPlay />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}