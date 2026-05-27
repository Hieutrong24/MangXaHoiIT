// src/features/chat/call/webrtc.js

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// ✅ Demo local: STUN OK. NAT khó -> cần TURN.
export function createPeerConnection({ onIceCandidate, onTrack, onConnectionState }) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  pc.onicecandidate = (e) => {
    if (e.candidate) onIceCandidate?.(e.candidate);
  };

  pc.onconnectionstatechange = () => {
    onConnectionState?.(pc.connectionState);
  };

  // ✅ fallback: gom track vào 1 MediaStream khi e.streams[0] không có
  const remoteStream = new MediaStream();

  pc.ontrack = (e) => {
    if (e.streams && e.streams[0]) {
      onTrack?.(e.streams[0]);
      return;
    }
    remoteStream.addTrack(e.track);
    onTrack?.(remoteStream);
  };

  return pc;
}

export async function getUserMediaStream(type) {
  // ✅ Video call: luôn lấy cả audio + video
  // ✅ Audio call: chỉ audio
  const constraints =
    type === "video"
      ? { audio: true, video: { width: 1280, height: 720 } }
      : { audio: true, video: false };

  return navigator.mediaDevices.getUserMedia(constraints);
}

export function attachStreamToPc(pc, stream) {
  if (!pc || !stream) return;
  stream.getTracks().forEach((t) => pc.addTrack(t, stream));
}

export function stopStream(stream) {
  if (!stream) return;
  try {
    stream.getTracks().forEach((t) => t.stop());
  } catch {}
}

export async function safeSetRemoteDescription(pc, sdp) {
  if (!pc || !sdp) return;
  const desc = sdp.type ? sdp : new RTCSessionDescription(sdp);
  await pc.setRemoteDescription(desc);
}

export async function safeAddIceCandidate(pc, candidate) {
  if (!pc || !candidate) return;
 
  try {
    await pc.addIceCandidate(candidate.candidate ? candidate : new RTCIceCandidate(candidate));
  } catch {
    // candidate đến sớm hoặc duplicate -> ignore, signaling có thể queue
  }
}