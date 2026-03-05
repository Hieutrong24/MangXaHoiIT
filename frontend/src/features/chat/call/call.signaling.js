// src/features/chat/call/call.signaling.js
import {
  createPeerConnection,
  getUserMediaStream,
  attachStreamToPc,
  stopStream,
  safeSetRemoteDescription,
  safeAddIceCandidate,
} from "./webrtc";

function uid() {
  try {
    return crypto?.randomUUID?.() || `call_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `call_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

/**
 * Events cần backend relay:
 * - call:invite   { callId, fromUserId, toUserId, type, offer }
 * - call:answer   { callId, fromUserId, toUserId, answer }
 * - call:ice      { callId, fromUserId, toUserId, candidate }
 * - call:reject   { callId, fromUserId, toUserId, reason? }
 * - call:hangup   { callId, fromUserId, toUserId, reason? }
 */
export function createCallSignaling({ socket, currentUserId, onState }) {
  let call = null;
  let disposed = false;

  // ✅ handle ICE that arrives BEFORE invite/answer
  const pendingIceByCallId = new Map(); // callId -> RTCIceCandidateInit[]

  const emitState = (next) => {
    if (disposed) return;
    call = next;
    onState?.(call);
  };

  const patchState = (patch) => {
    if (disposed) return;
    call = { ...(call || {}), ...patch };
    onState?.(call);
  };

  const cleanup = () => {
    if (!call) return;

    try {
      call.pc?.close?.();
    } catch {}
    stopStream(call.localStream);
    stopStream(call.remoteStream);

    // clear pending ICE for this call
    if (call.callId) pendingIceByCallId.delete(call.callId);

    call = null;
    emitState(null);
  };

  const ensureNotDisposed = () => {
    if (disposed) throw new Error("CallSignaling disposed");
  };

  async function flushPendingIce(callId, pc) {
    const list = pendingIceByCallId.get(callId);
    if (!list?.length) return;

    for (const c of list) {
      try {
        await safeAddIceCandidate(pc, c);
      } catch {}
    }
    pendingIceByCallId.delete(callId);
  }

  function attachPcStateWatchers(pc) {
    // when disconnected/failed => cleanup UI
    const onConn = () => {
      const st = pc.connectionState;
      if (st === "failed" || st === "disconnected" || st === "closed") {
        cleanup();
      }
    };
    const onIceConn = () => {
      const st = pc.iceConnectionState;
      if (st === "failed" || st === "disconnected" || st === "closed") {
        cleanup();
      }
    };

    pc.addEventListener?.("connectionstatechange", onConn);
    pc.addEventListener?.("iceconnectionstatechange", onIceConn);

    // store for optional remove (not mandatory)
    pc.___tdmu_onConn = onConn;
    pc.___tdmu_onIceConn = onIceConn;
  }

  async function startCall({ toUserId, type }) {
    ensureNotDisposed();
    if (!toUserId) throw new Error("toUserId required");

    // đang có call => không start call mới
    if (call) throw new Error("You are already in a call.");

    const callId = uid();
    const localStream = await getUserMediaStream(type);

    const pc = createPeerConnection({
      onIceCandidate: (candidate) => {
        // candidate can be null at end of gathering
        if (!candidate) return;

        socket.emit("call:ice", {
          callId,
          fromUserId: currentUserId,
          toUserId,
          candidate,
        });
      },
      onTrack: (remoteStream) => {
        patchState({ remoteStream });
      },
    });

    attachPcStateWatchers(pc);
    attachStreamToPc(pc, localStream);

    emitState({
      callId,
      direction: "outgoing",
      type,
      status: "calling", // calling | connecting | active | ended
      toUserId,
      fromUserId: currentUserId,
      pc,
      localStream,
      remoteStream: null,
      offer: null,
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // gửi invite
    socket.emit("call:invite", {
      callId,
      fromUserId: currentUserId,
      toUserId,
      type,
      offer,
    });

    // if ICE arrived early from peer (rare), keep until remote desc set
  }

  async function acceptIncoming() {
    ensureNotDisposed();
    if (!call || call.direction !== "incoming") return;

    const { callId, fromUserId, type, offer } = call;
    if (!callId || !fromUserId || !offer) throw new Error("Invalid incoming call payload");

    const localStream = await getUserMediaStream(type);

    const pc = createPeerConnection({
      onIceCandidate: (candidate) => {
        if (!candidate) return;

        socket.emit("call:ice", {
          callId,
          fromUserId: currentUserId,
          toUserId: fromUserId,
          candidate,
        });
      },
      onTrack: (remoteStream) => {
        patchState({ remoteStream });
      },
    });

    attachPcStateWatchers(pc);
    attachStreamToPc(pc, localStream);

    patchState({
      status: "connecting",
      pc,
      localStream,
    });

    await safeSetRemoteDescription(pc, offer);

    // ✅ flush ICE queued (including those that arrived before invite)
    await flushPendingIce(callId, pc);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("call:answer", {
      callId,
      fromUserId: currentUserId,
      toUserId: fromUserId,
      answer,
    });

    patchState({ status: "active" });
  }

  function rejectIncoming(reason = "rejected") {
    ensureNotDisposed();
    if (!call || call.direction !== "incoming") return;

    socket.emit("call:reject", {
      callId: call.callId,
      fromUserId: currentUserId,
      toUserId: call.fromUserId,
      reason,
    });

    cleanup();
  }

  function hangup(reason = "hangup") {
    ensureNotDisposed();
    if (!call) return;

    const other = call.direction === "outgoing" ? call.toUserId : call.fromUserId;

    socket.emit("call:hangup", {
      callId: call.callId,
      fromUserId: currentUserId,
      toUserId: other,
      reason,
    });

    cleanup();
  }

  // ================== SOCKET HANDLERS ==================
  const onInvite = (payload) => {
    if (!payload?.callId || !payload?.fromUserId) return;

    // ensure the invite is for me
    if (payload.toUserId && String(payload.toUserId) !== String(currentUserId)) return;

    // đang có call => báo bận
    if (call) {
      socket.emit("call:reject", {
        callId: payload.callId,
        fromUserId: currentUserId,
        toUserId: payload.fromUserId,
        reason: "busy",
      });
      return;
    }

    emitState({
      callId: payload.callId,
      direction: "incoming",
      type: payload.type || "audio",
      status: "ringing",
      fromUserId: payload.fromUserId,
      toUserId: currentUserId,
      offer: payload.offer,
      pc: null,
      localStream: null,
      remoteStream: null,
    });
  };

  const onAnswer = async (payload) => {
    if (!payload?.callId || !payload?.answer) return;
    if (!call) return;
    if (payload.callId !== call.callId) return;
    if (call.direction !== "outgoing") return;
    if (!call.pc) return;

    patchState({ status: "connecting" });

    await safeSetRemoteDescription(call.pc, payload.answer);

    // ✅ flush ICE queued for this callId
    await flushPendingIce(call.callId, call.pc);

    patchState({ status: "active" });
  };

  const onIce = async (payload) => {
    if (!payload?.callId || !payload?.candidate) return;

    // nếu chưa có call (ICE đến sớm) => store by callId
    if (!call || payload.callId !== call.callId || !call.pc) {
      const arr = pendingIceByCallId.get(payload.callId) || [];
      arr.push(payload.candidate);
      pendingIceByCallId.set(payload.callId, arr);
      return;
    }

    // nếu chưa set remoteDescription => queue
    if (!call.pc.remoteDescription) {
      const arr = pendingIceByCallId.get(payload.callId) || [];
      arr.push(payload.candidate);
      pendingIceByCallId.set(payload.callId, arr);
      return;
    }

    try {
      await safeAddIceCandidate(call.pc, payload.candidate);
    } catch {
      const arr = pendingIceByCallId.get(payload.callId) || [];
      arr.push(payload.candidate);
      pendingIceByCallId.set(payload.callId, arr);
    }
  };

  const onReject = (payload) => {
    if (!payload?.callId) return;
    if (!call) return;
    if (payload.callId !== call.callId) return;
    cleanup();
  };

  const onHangup = (payload) => {
    if (!payload?.callId) return;
    if (!call) return;
    if (payload.callId !== call.callId) return;
    cleanup();
  };

  function bind() {
    socket.on?.("call:invite", onInvite);
    socket.on?.("call:answer", onAnswer);
    socket.on?.("call:ice", onIce);
    socket.on?.("call:reject", onReject);
    socket.on?.("call:hangup", onHangup);
  }

  function unbind() {
    socket.off?.("call:invite", onInvite);
    socket.off?.("call:answer", onAnswer);
    socket.off?.("call:ice", onIce);
    socket.off?.("call:reject", onReject);
    socket.off?.("call:hangup", onHangup);
  }

  function dispose() {
    disposed = true;
    try {
      unbind();
    } catch {}
    try {
      cleanup();
    } catch {}
    pendingIceByCallId.clear();
  }

  bind();

  return {
    startCall,
    acceptIncoming,
    rejectIncoming,
    hangup,
    getState: () => call,
    dispose,
  };
}