// src/features/chat/pages/ChatPage.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import {
  MessageSquareText,
  UserPlus,
  Users,
  MailCheck,
  MailX,
  LogIn,
  RefreshCw,
} from "lucide-react";

import ChatList from "../components/ChatList";
import ChatRoom from "../components/ChatRoom";
import { chatApi } from "../api/chat.api";
import { friendsApi } from "../../users/api/friends.api";
import { tokenStorage } from "../../../services/tokenStorage";

import { createSocketClient } from "../socket/socketClient";
import { createCallSignaling } from "../call/call.signaling";
import IncomingCallModal from "../call/IncomingCallModal";
import CallModal from "../call/CallModal";

/* ================= Helpers ================= */

function toChatId(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
}

function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

function getUserId(u) {
  return u?.userId ?? u?.id ?? null;
}

function getUserName(u) {
  return u?.fullName || u?.username || "User";
}

function shortId(id) {
  if (!id) return "";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

function readAuth() {
  return {
    userId: localStorage.getItem("userId") || "",
  };
}

function getReqId(r) {
  return r?.requestId ?? r?.id ?? r?._id ?? null;
}
function getReqFromId(r) {
  return r?.fromUserId ?? r?.fromId ?? r?.senderId ?? r?.from?.id ?? null;
}
function getReqToId(r) {
  return r?.toUserId ?? r?.toId ?? r?.receiverId ?? r?.to?.id ?? null;
}

function toUiMessage(m, currentUserId) {
  // m can be server dto or optimistic
  const id = m._id || m.id || m.clientMessageId || `${m.chatId}-${m.createdAt || Date.now()}`;
  const createdAt = m.createdAt || m.time || null;
  return {
    id,
    _id: m._id,
    clientMessageId: m.clientMessageId,
    chatId: m.chatId,
    senderId: m.senderId,
    mine: String(m.senderId) === String(currentUserId),
    text: m.content ?? m.text ?? "",
    time: createdAt ? new Date(createdAt).toLocaleString() : "",
    createdAtMs: createdAt ? Date.parse(createdAt) : (m.createdAtMs ?? Date.now()),
    _optimistic: !!m._optimistic,
  };
}

/* ================= Component ================= */

export default function ChatPage() {
  const [auth, setAuth] = useState(readAuth());
  const currentUserId = auth.userId;

  // data
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // chat
  const [rooms, setRooms] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]); // store RAW server-like messages + optimistic

  // ui
  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [leftError, setLeftError] = useState("");

  // ===== socket/call =====
  const socketRef = useRef(null);
  const callRef = useRef(null);
  const [callState, setCallState] = useState(null);

  // keep refs to avoid stale closures
  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // dedup sets
  const seenMessageIdsRef = useRef(new Set()); // server _id or local id
  const seenClientIdsRef = useRef(new Set()); // clientMessageId

  const resetAll = useCallback(() => {
    setFriends([]);
    setIncoming([]);
    setOutgoing([]);
    setAllUsers([]);
    setRooms([]);
    setActiveChatId(null);
    setMessages([]);
    setLeftError("");
    seenMessageIdsRef.current = new Set();
    seenClientIdsRef.current = new Set();
  }, []);

  // Sync auth when localStorage changes / tab focus
  useEffect(() => {
    const sync = () => setAuth(readAuth());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  // When user changes -> reset
  useEffect(() => {
    resetAll();
  }, [currentUserId, resetAll]);

  // ================= SOCKET INIT =================
  useEffect(() => {
    // cleanup old
    if (callRef.current) {
      callRef.current.dispose?.();
      callRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect?.();
      socketRef.current = null;
    }
    setCallState(null);

    if (!currentUserId) return;

    const token = tokenStorage.get();
    if (!token) return;

    const socket = createSocketClient({ token, userId: currentUserId });
    socketRef.current = socket;

    // ===== listen realtime new messages =====
    const onNewMessage = (payload) => {
      const chatId = payload?.chatId;
      const msg = payload?.message;
      if (!chatId || !msg) return;

      // Dedup by _id then by clientMessageId
      const serverId = msg._id || msg.id;
      const clientId = msg.clientMessageId || null;

      if (serverId && seenMessageIdsRef.current.has(String(serverId))) return;
      if (clientId && seenClientIdsRef.current.has(String(clientId))) {
        // if we already have an optimistic message with this clientId, REPLACE it
        setMessages((prev) => {
          const next = prev.map((x) => {
            if (x.clientMessageId && String(x.clientMessageId) === String(clientId)) {
              return { ...msg }; // replace optimistic with server dto
            }
            return x;
          });
          return next;
        });

        if (serverId) seenMessageIdsRef.current.add(String(serverId));
        return;
      }

      if (serverId) seenMessageIdsRef.current.add(String(serverId));
      if (clientId) seenClientIdsRef.current.add(String(clientId));

      // only append if this is the active room
      if (String(chatId) !== String(activeChatIdRef.current)) return;

      setMessages((prev) => [...prev, msg]);
    };

    socket.on?.("message:new", onNewMessage);

    const call = createCallSignaling({
      socket,
      currentUserId,
      onState: (st) => setCallState(st),
    });
    callRef.current = call;

    return () => {
      socket.off?.("message:new", onNewMessage);
      call.dispose?.();
      socket.disconnect?.();
      callRef.current = null;
      socketRef.current = null;
    };
  }, [currentUserId]);

  /* ================= Load Left Panel (FULL) ================= */

  const loadLeft = useCallback(async () => {
    if (!currentUserId) {
      setLoadingLeft(false);
      return;
    }

    setLoadingLeft(true);
    setLeftError("");

    try {
      const [incomingRes, outgoingRes, friendsRes, usersRes] = await Promise.all([
        friendsApi.listIncomingRequests({ page: 1, pageSize: 50 }),
        friendsApi.listOutgoingRequests({ page: 1, pageSize: 50 }),
        friendsApi.listFriends(),
        friendsApi.listAllUsers({ page: 1, pageSize: 200 }),
      ]);

      setIncoming(normalizeList(incomingRes));
      setOutgoing(normalizeList(outgoingRes));
      setFriends(normalizeList(friendsRes));
      setAllUsers(normalizeList(usersRes));
    } catch (e) {
      console.error("Load left error:", e);
      setLeftError(e?.response?.data?.message || "Không tải được danh sách.");
      resetAll();
    } finally {
      setLoadingLeft(false);
    }
  }, [currentUserId, resetAll]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await loadLeft();
    })();
    return () => {
      alive = false;
    };
  }, [loadLeft]);

  /* ================= Relation Status ================= */

  const friendIdSet = useMemo(
    () => new Set(friends.map((u) => String(getUserId(u))).filter(Boolean)),
    [friends]
  );
  const outgoingToSet = useMemo(
    () => new Set(outgoing.map((r) => String(getReqToId(r))).filter(Boolean)),
    [outgoing]
  );
  const incomingFromSet = useMemo(
    () => new Set(incoming.map((r) => String(getReqFromId(r))).filter(Boolean)),
    [incoming]
  );

  const incomingByFromId = useMemo(() => {
    const map = new Map();
    for (const r of incoming) {
      const fromId = getReqFromId(r);
      if (fromId) map.set(String(fromId), r);
    }
    return map;
  }, [incoming]);

  const relationByUserId = useMemo(() => {
    const map = new Map();
    for (const id of friendIdSet) map.set(id, "friends");
    for (const id of outgoingToSet) map.set(id, "outgoing");
    for (const id of incomingFromSet) map.set(id, "incoming");
    return map;
  }, [friendIdSet, outgoingToSet, incomingFromSet]);

  function getRelation(userId) {
    const id = String(userId);
    return relationByUserId.get(id) || "none";
  }

  /* ================= Derived Lists ================= */

  const roomList = useMemo(() => {
    return friends
      .map((u) => {
        const peerId = getUserId(u);
        if (!peerId) return null;
        return {
          id: toChatId(currentUserId, peerId),
          title: getUserName(u),
          peer: u,
          peerId,
        };
      })
      .filter(Boolean);
  }, [friends, currentUserId]);

  useEffect(() => {
    setRooms(roomList);
    setActiveChatId((prev) => {
      if (!roomList.length) return null;
      if (prev && roomList.some((r) => r.id === prev)) return prev;
      return roomList[0].id;
    });
  }, [roomList]);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeChatId) || null,
    [rooms, activeChatId]
  );

  const candidates = useMemo(() => {
    const me = String(currentUserId);
    return allUsers.filter((u) => {
      const id = getUserId(u);
      if (!id) return false;
      return String(id) !== me;
    });
  }, [allUsers, currentUserId]);

  /* ================= Join/Leave room on activeChatId ================= */

  const prevChatIdRef = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const prev = prevChatIdRef.current;
    const next = activeChatId;

    // leave previous room
    if (prev && prev !== next) {
      socket.emit?.("chat:leave", { chatId: prev });
    }

    // join new room
    if (next) {
      socket.emit?.("chat:join", { chatId: next }, (ack) => {
        // optional debug
        // console.log("joined", next, ack);
      });
    }

    prevChatIdRef.current = next;

    return () => {
      // on unmount, leave current
      if (next) socket.emit?.("chat:leave", { chatId: next });
    };
  }, [activeChatId]);

  /* ================= Load Messages (REST history) ================= */

  useEffect(() => {
    if (!activeChatId) return;

    let alive = true;

    (async () => {
      try {
        setLoadingMsgs(true);

        // reset dedup sets for this room (keep global ids if you want, but this is safer for dev)
        seenMessageIdsRef.current = new Set();
        seenClientIdsRef.current = new Set();

        const payload = await chatApi.getMessages(activeChatId, { limit: 50 });
        if (!alive) return;

        const list = normalizeList(payload);

        // seed dedup with server ids
        for (const m of list) {
          const sid = m._id || m.id;
          const cid = m.clientMessageId;
          if (sid) seenMessageIdsRef.current.add(String(sid));
          if (cid) seenClientIdsRef.current.add(String(cid));
        }

        setMessages(list);
      } catch (e) {
        console.error("Load messages error:", e);
      } finally {
        if (alive) setLoadingMsgs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeChatId]);

  const uiMessages = useMemo(() => {
    return messages.map((m) => toUiMessage(m, currentUserId));
  }, [messages, currentUserId]);

  /* ================= Send message ================= */
  async function handleSend(text) {
    if (!activeChatId) return;

    const clientMessageId = `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    // optimistic append (so it appears immediately)
    const optimistic = {
      _optimistic: true,
      clientMessageId,
      chatId: activeChatId,
      senderId: currentUserId,
      content: text,
      createdAt: new Date().toISOString(),
    };

    // prevent duplicates with same client id
    seenClientIdsRef.current.add(String(clientMessageId));
    setMessages((prev) => [...prev, optimistic]);

    try {
      // Prefer: send via SOCKET so only 1 path persists + broadcast
      // If you still want REST, keep it, but server must broadcast via socket on save.
      const socket = socketRef.current;

      if (socket?.emit) {
        socket.emit(
          "message:send",
          {
            chatId: activeChatId,
            type: "text",
            content: text,
            clientMessageId,
          },
          (ack) => {
            if (!ack?.ok) {
              // rollback optimistic on error
              setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
              alert(ack?.error || "Không gửi được tin nhắn (socket).");
              return;
            }

            // replace optimistic with server dto
            const msg = ack.message;
            const sid = msg?._id || msg?.id;
            if (sid) seenMessageIdsRef.current.add(String(sid));

            setMessages((prev) =>
              prev.map((m) => {
                if (m.clientMessageId && m.clientMessageId === clientMessageId) return msg;
                return m;
              })
            );
          }
        );
      } else {
        // fallback REST
        const res = await chatApi.sendMessage(activeChatId, { content: text, clientMessageId });
        // If REST returns message dto, replace optimistic
        const serverMsg = res?.message || res;
        if (serverMsg) {
          const sid = serverMsg?._id || serverMsg?.id;
          if (sid) seenMessageIdsRef.current.add(String(sid));

          setMessages((prev) =>
            prev.map((m) => {
              if (m.clientMessageId && m.clientMessageId === clientMessageId) return serverMsg;
              return m;
            })
          );
        }
      }
    } catch (e) {
      console.error("Send message error:", e);
      setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
      alert(e?.response?.data?.message || "Không gửi được tin nhắn.");
    }
  }

  /* ================= Friend Actions ================= */

  async function handleAccept(requestId) {
    try {
      await friendsApi.acceptFriendRequest(requestId);
      await loadLeft();
    } catch (e) {
      console.error("Accept error:", e);
      alert(e?.response?.data?.message || "Không thể chấp nhận lời mời.");
    }
  }

  async function handleReject(requestId) {
    try {
      await friendsApi.rejectFriendRequest(requestId);
      await loadLeft();
    } catch (e) {
      console.error("Reject error:", e);
      alert(e?.response?.data?.message || "Không thể từ chối lời mời.");
    }
  }

  async function handleAcceptByUser(userId) {
    const req = incomingByFromId.get(String(userId));
    const requestId = req ? getReqId(req) : null;
    if (!requestId) return;
    await handleAccept(requestId);
  }

  async function handleAddFriend(user) {
    const toId = getUserId(user);
    if (!toId) return;

    const rel = getRelation(toId);
    if (rel === "friends" || rel === "outgoing") return;

    if (rel === "incoming") {
      await handleAcceptByUser(toId);
      return;
    }

    setOutgoing((prev) => [...prev, { id: `tmp-${Date.now()}`, toUserId: toId }]);

    try {
      await friendsApi.sendFriendRequest(toId);
      await loadLeft();
    } catch (e) {
      setOutgoing((prev) => prev.filter((r) => String(getReqToId(r)) !== String(toId)));
      const status = e?.response?.status;
      if (status === 409) {
        await loadLeft();
        return;
      }
      console.error("Send request error:", e);
      alert(e?.response?.data?.message || "Không gửi được lời mời kết bạn.");
    }
  }

  /* ================= CALL actions ================= */

  const callerUser = useMemo(() => {
    if (!callState) return null;
    const id = callState.direction === "incoming" ? callState.fromUserId : callState.toUserId;
    const all = [...friends, ...allUsers];
    return all.find((u) => String(getUserId(u)) === String(id)) || { userId: id };
  }, [callState, friends, allUsers]);

  const peerUser = useMemo(() => {
    if (activeRoom?.peer) return activeRoom.peer;
    return callerUser;
  }, [activeRoom, callerUser]);

  const onCallAudio = async () => {
    if (!activeRoom?.peerId) return;
    try {
      await callRef.current?.startCall({ toUserId: activeRoom.peerId, type: "audio" });
    } catch (e) {
      console.error(e);
      alert("Không thể bắt đầu gọi thoại. Kiểm tra quyền micro.");
    }
  };

  const onCallVideo = async () => {
    if (!activeRoom?.peerId) return;
    try {
      await callRef.current?.startCall({ toUserId: activeRoom.peerId, type: "video" });
    } catch (e) {
      console.error(e);
      alert("Không thể bắt đầu gọi video. Kiểm tra quyền camera/micro.");
    }
  };

  /* ================= UI ================= */

  if (!currentUserId) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-amber-300" />
          <div className="text-xl font-bold">Bạn chưa đăng nhập</div>
        </div>
      </GlassCard>
    );
  }

  const showIncoming = callState?.direction === "incoming" && callState?.status === "ringing";
  const showCallModal = !!callState && callState?.status !== "ringing";

  return (
    <div className="grid gap-4">
      <GlassCard className="p-4 flex items-center justify-between">
        <div>Đang đăng nhập: {shortId(currentUserId)}</div>
        <Button onClick={loadLeft} title="Tải lại">
          <RefreshCw size={16} />
        </Button>
      </GlassCard>

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        {/* LEFT */}
        <GlassCard className="p-4">
          {loadingLeft ? (
            <div>Đang tải...</div>
          ) : leftError ? (
            <div className="text-red-300">{leftError}</div>
          ) : (
            <>
              {/* Incoming */}
              <div className="font-bold mb-2">Lời mời đến ({incoming.length})</div>
              {incoming.length === 0 ? (
                <div className="opacity-70 text-sm">Không có lời mời.</div>
              ) : (
                incoming.map((r) => {
                  const requestId = getReqId(r);
                  const fromId = getReqFromId(r);

                  return (
                    <div
                      key={requestId || `${fromId}-${Math.random()}`}
                      className="flex justify-between items-center p-3 border rounded mb-2"
                    >
                      <div>User {shortId(fromId)}</div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleAccept(requestId)} title="Chấp nhận">
                          <MailCheck size={16} />
                        </Button>
                        <Button onClick={() => handleReject(requestId)} title="Từ chối">
                          <MailX size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Friends */}
              <div className="font-bold mt-6 mb-2">Bạn bè ({friends.length})</div>
              {rooms.length ? (
                <ChatList rooms={rooms} activeId={activeChatId} onSelect={setActiveChatId} />
              ) : (
                <div className="opacity-70 text-sm flex items-center gap-2">
                  <MessageSquareText size={16} />
                  Chưa có bạn bè để tạo phòng chat.
                </div>
              )}

              {/* Users */}
              <div className="font-bold mt-6 mb-2">Người dùng ({candidates.length})</div>
              {candidates.map((u) => {
                const id = getUserId(u);
                const rel = id ? getRelation(id) : "none";

                return (
                  <div
                    key={id || Math.random()}
                    className="flex justify-between items-center p-3 border rounded mb-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate">{getUserName(u)}</div>
                      <div className="text-xs opacity-70">ID: {shortId(id)}</div>
                    </div>

                    {rel === "friends" ? (
                      <Button disabled title="Đã là bạn">
                        <Users size={16} />
                      </Button>
                    ) : rel === "outgoing" ? (
                      <Button disabled title="Bạn đã gửi lời mời">Đã gửi</Button>
                    ) : rel === "incoming" ? (
                      <Button
                        onClick={() => handleAcceptByUser(id)}
                        title="Người này đã gửi cho bạn — bấm để chấp nhận"
                      >
                        <MailCheck size={16} />
                      </Button>
                    ) : (
                      <Button onClick={() => handleAddFriend(u)} title="Gửi lời mời">
                        <UserPlus size={16} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </GlassCard>

        {/* RIGHT */}
        <GlassCard className="p-4">
          {!activeChatId ? (
            <div className="opacity-70">Chọn một bạn bè để xem tin nhắn.</div>
          ) : loadingMsgs ? (
            <div>Đang tải tin nhắn...</div>
          ) : (
            <ChatRoom
              peer={{
                ...activeRoom?.peer,
                userId: activeRoom?.peerId,
              }}
              messages={uiMessages}
              onSend={handleSend}
              onCall={onCallAudio}
              onVideo={onCallVideo}
              onInfo={() => alert("TODO: Thông tin người dùng")}
            />
          )}
        </GlassCard>
      </div>

      {/* Incoming ringing modal */}
      <IncomingCallModal
        open={showIncoming}
        call={callState}
        caller={callerUser}
        onAccept={() => callRef.current?.acceptIncoming()}
        onReject={() => callRef.current?.rejectIncoming()}
      />

      {/* Active call modal */}
      <CallModal
        open={showCallModal}
        call={callState}
        peer={peerUser}
        onHangup={() => callRef.current?.hangup()}
      />
    </div>
  );
}