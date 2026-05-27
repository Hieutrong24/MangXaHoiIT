import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Button from '../../../shared/components/Button';
import { LogIn, RefreshCw, UsersRound, MessageSquarePlus } from 'lucide-react';

import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import ChatInfoModal from '../components/ChatInfoModal';
import AddGroupMembersModal from '../components/AddGroupMembersModal';
import { chatApi } from '../api/chat.api';
import { presenceApi } from '../api/presence.api';
import { friendsApi } from '../../users/api/friends.api';
import { tokenStorage } from '../../../services/tokenStorage';
import { createSocketClient } from '../socket/socketClient';
import { initCallManager, getCallManager } from '../call/callManager';
import { getCurrentUser, getCurrentUserId } from '../../../shared/utils/currentUser';

function toChatId(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
}

function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  return [];
}

function getUserId(u) {
  return u?.userId ?? u?.id ?? u?._id ?? null;
}

function getUserName(u) {
  return u?.fullName || u?.username || u?.name || 'Người dùng';
}

function getUserEmail(u) {
  return u?.email || '';
}

function getUserAvatar(u) {
  return u?.avatarUrl || u?.avatar || u?.photoUrl || '';
}

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 5)}…${s.slice(-4)}` : s;
}

function getReqId(r) {
  return r?.requestId ?? r?.id ?? r?._id ?? null;
}
function getReqFromId(r) {
  return r?.fromUserId ?? r?.fromId ?? r?.senderId ?? r?.from?.id ?? r?.from?.userId ?? null;
}
function getReqToId(r) {
  return r?.toUserId ?? r?.toId ?? r?.receiverId ?? r?.to?.id ?? r?.to?.userId ?? null;
}

function toUiMessage(m, currentUserId) {
  const id = m._id || m.id || m.clientMessageId || `${m.chatId}-${m.createdAt || Date.now()}`;
  const createdAt = m.createdAt || m.time || null;
  return {
    id,
    _id: m._id || m.id,
    clientMessageId: m.clientMessageId,
    chatId: m.chatId,
    senderId: m.senderId,
    mine: String(m.senderId) === String(currentUserId),
    text: m.content ?? m.text ?? '',
    time: createdAt ? new Date(createdAt).toLocaleString() : '',
    createdAtMs: createdAt ? Date.parse(createdAt) : m.createdAtMs ?? Date.now(),
    _optimistic: !!m._optimistic,
  };
}

function previewOfMessage(msg) {
  const raw = String(msg?.content || msg?.text || '').trim();
  if (!raw) return 'Tin nhắn mới';
  return raw.length > 80 ? `${raw.slice(0, 77)}...` : raw;
}

function sortRooms(list) {
  return [...list].sort((a, b) => {
    const ta = Number(b.lastActivityMs || 0);
    const tb = Number(a.lastActivityMs || 0);
    if (ta !== tb) return ta - tb;
    return String(a.title || '').localeCompare(String(b.title || ''), 'vi');
  });
}

function collectUsersFromRequests(requests = []) {
  const result = [];
  requests.forEach((item) => {
    if (item?.from && typeof item.from === 'object') result.push(item.from);
    if (item?.to && typeof item.to === 'object') result.push(item.to);
    if (item?.user && typeof item.user === 'object') result.push(item.user);
  });
  return result;
}

function SectionTitle({ title, count, action }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</div>
      <div className="flex items-center gap-2">
        {action}
        <div className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{count}</div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-full bg-[var(--surface-card)] px-3 py-1.5 text-xs text-[var(--text-secondary)] sm:text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="ml-2 font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function TextAction({ children, onClick, disabled = false, tone = 'default', title }) {
  const toneClass = {
    default: 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--surface-card)]',
    primary: 'bg-[#1f6feb]/15 text-[#58a6ff] hover:bg-[#1f6feb]/25',
    success: 'bg-[#238636]/15 text-[#3fb950] hover:bg-[#238636]/25',
    danger: 'bg-[#da3633]/15 text-[#ff7b72] hover:bg-[#da3633]/25',
    muted: 'bg-[var(--surface-muted)] text-[var(--text-muted)]',
  };

  return (
    <Button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        '!h-8 !rounded-lg !px-3 !py-1.5 !text-xs !font-medium !shadow-none sm:!h-9 sm:!text-sm',
        toneClass[tone],
      ].join(' ')}
    >
      {children}
    </Button>
  );
}

function SideCard({ children, className = '' }) {
  return <section className={`rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-3 sm:p-4 ${className}`}>{children}</section>;
}

export default function ChatPage() {
  const currentUserId = getCurrentUserId();
  const currentUser = getCurrentUser();
  const token = tokenStorage.get();

  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [presenceMap, setPresenceMap] = useState({});

  const [rooms, setRooms] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [leftError, setLeftError] = useState('');
  const [sending, setSending] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);

  const socketRef = useRef(null);
  const roomsRef = useRef([]);
  const activeChatIdRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());
  const seenClientIdsRef = useRef(new Set());

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const resetAll = useCallback(() => {
    setFriends([]);
    setIncoming([]);
    setOutgoing([]);
    setAllUsers([]);
    setGroups([]);
    setPresenceMap({});
    setRooms([]);
    setActiveChatId(null);
    setMessages([]);
    setLeftError('');
    seenMessageIdsRef.current = new Set();
    seenClientIdsRef.current = new Set();
  }, []);

  useEffect(() => {
    resetAll();
  }, [currentUserId, resetAll]);

  const userDirectory = useMemo(() => {
    const map = new Map();
    const merged = [
      currentUser,
      ...allUsers,
      ...friends,
      ...collectUsersFromRequests(incoming),
      ...collectUsersFromRequests(outgoing),
    ];

    merged.forEach((item) => {
      const userId = getUserId(item);
      if (!userId) return;
      const old = map.get(String(userId)) || {};
      map.set(String(userId), {
        ...old,
        ...item,
        userId: String(userId),
        fullName: item?.fullName || old?.fullName,
        username: item?.username || old?.username,
        email: item?.email || old?.email,
        avatarUrl: getUserAvatar(item) || old?.avatarUrl,
      });
    });

    return map;
  }, [allUsers, currentUser, friends, incoming, outgoing]);

  const subscribePresence = useCallback((userIds) => {
    const socket = socketRef.current;
    if (!socket || !Array.isArray(userIds) || userIds.length === 0) return () => {};

    const ids = [...new Set(userIds.map((id) => String(id || '')).filter(Boolean))];
    if (!ids.length) return () => {};

    const onPresenceUpdate = (item) => {
      if (!item?.userId) return;
      setPresenceMap((prev) => ({
        ...prev,
        [String(item.userId)]: item,
      }));
    };

    socket.emit('presence:subscribe', { userIds: ids }, (ack) => {
      if (ack?.ok && Array.isArray(ack.items)) {
        const next = {};
        ack.items.forEach((item) => {
          if (item?.userId) next[String(item.userId)] = item;
        });
        setPresenceMap((prev) => ({ ...prev, ...next }));
      }
    });

    ids.forEach((id) => socket.on(`presence:user:${id}`, onPresenceUpdate));

    return () => {
      socket.emit('presence:unsubscribe', { userIds: ids });
      ids.forEach((id) => socket.off(`presence:user:${id}`, onPresenceUpdate));
    };
  }, []);

  const loadLeft = useCallback(async () => {
    if (!currentUserId) {
      setLoadingLeft(false);
      return;
    }

    setLoadingLeft(true);
    setLeftError('');

    try {
      const [friendsRes, incomingRes, outgoingRes, usersRes, groupsRes] = await Promise.all([
        friendsApi.listFriends({ page: 1, pageSize: 100 }),
        friendsApi.listIncomingRequests({ page: 1, pageSize: 100 }),
        friendsApi.listOutgoingRequests({ page: 1, pageSize: 100 }),
        friendsApi.listAllUsers({ page: 1, pageSize: 100 }),
        chatApi.listGroups(),
      ]);

      const nextFriends = normalizeList(friendsRes);
      const nextIncoming = normalizeList(incomingRes);
      const nextOutgoing = normalizeList(outgoingRes);
      const nextUsers = normalizeList(usersRes).filter(
        (user) => String(getUserId(user)) !== String(currentUserId)
      );
      const nextGroups = normalizeList(groupsRes).map((group) => ({
        ...group,
        id: group?.chatId || group?.id,
      }));

      setFriends(nextFriends);
      setIncoming(nextIncoming);
      setOutgoing(nextOutgoing);
      setAllUsers(nextUsers);
      setGroups(nextGroups);

      const presenceIds = nextFriends.map(getUserId).filter(Boolean);
      if (presenceIds.length) {
        const presenceItems = await presenceApi.query(presenceIds);
        const nextPresence = {};
        presenceItems.forEach((item) => {
          if (item?.userId) nextPresence[String(item.userId)] = item;
        });
        setPresenceMap((prev) => ({ ...prev, ...nextPresence }));
      }
    } catch (e) {
      console.error('Load chat left panel error:', e);
      setLeftError('Không tải được dữ liệu chat hoặc nhóm chat.');
    } finally {
      setLoadingLeft(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadLeft();
  }, [loadLeft]);

  useEffect(() => {
    if (!currentUserId || !token) return undefined;

    initCallManager({ token, userId: currentUserId });
    const socket = createSocketClient({ token, userId: currentUserId });
    socketRef.current = socket;
    if (!socket) return undefined;

    const onNewMessage = (payload) => {
      const chatId = payload?.chatId;
      const msg = payload?.message;
      if (!chatId || !msg) return;

      const serverId = msg._id || msg.id;
      const clientId = msg.clientMessageId || null;
      const knownRoom = roomsRef.current.some((room) => String(room.id) === String(chatId));

      setRooms((prev) =>
        sortRooms(
          prev.map((room) => {
            if (String(room.id) !== String(chatId)) return room;
            return {
                  ...room,
                  lastMessage: previewOfMessage(msg),
                  lastActivityMs: msg?.createdAt ? Date.parse(msg.createdAt) : Date.now(),
                };
          })
        )
      );

      if (!knownRoom) {
        loadLeft();
      }

      if (String(chatId) !== String(activeChatIdRef.current)) return;

      setMessages((prev) => {
        let next = [...prev];

        if (clientId) {
          const optimisticIndex = next.findIndex(
            (item) => item?.clientMessageId && String(item.clientMessageId) === String(clientId)
          );
          if (optimisticIndex >= 0) {
            next[optimisticIndex] = { ...msg };
            if (serverId) seenMessageIdsRef.current.add(String(serverId));
            return next;
          }
        }

        if (serverId) {
          const exists = next.some((item) => String(item?._id || item?.id) === String(serverId));
          if (exists) return next;
          seenMessageIdsRef.current.add(String(serverId));
        }

        if (clientId) seenClientIdsRef.current.add(String(clientId));
        next.push(msg);
        return next;
      });
    };

    const onNotification = (event) => {
      const type = String(event?.detail?.type || event?.detail?.typeKey || '').toLowerCase();
      if (
        type.includes('friend_request') ||
        type.includes('group_invite') ||
        type.includes('group_member') ||
        type.includes('message')
      ) {
        loadLeft();
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('chat:new-message', onNewMessage);
    window.addEventListener('social:notification:new', onNotification);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('chat:new-message', onNewMessage);
      window.removeEventListener('social:notification:new', onNotification);
    };
  }, [currentUserId, token, loadLeft]);

  useEffect(() => {
    const ids = friends.map(getUserId).filter(Boolean);
    return subscribePresence(ids);
  }, [friends, subscribePresence]);

  useEffect(() => {
    const directRooms = friends.map((friend) => {
      const peerId = getUserId(friend);
      const chatId = toChatId(currentUserId, peerId);
      return {
        id: chatId,
        type: 'direct',
        userId: peerId,
        peerId,
        title: getUserName(friend),
        email: getUserEmail(friend),
        avatarUrl: getUserAvatar(friend),
        lastMessage: '',
        secondaryText: getUserEmail(friend) || `ID: ${shortId(peerId)}`,
        metaText: 'Chat 1-1',
        online: !!presenceMap[String(peerId)]?.online,
        lastActivityMs: 0,
      };
    });

    const groupRooms = groups.map((group) => ({
      id: group?.chatId || group?.id,
      type: 'group',
      title: group?.name || 'Nhóm chat',
      description: group?.description || '',
      avatarUrl: group?.avatarUrl || '',
      memberCount: Number(group?.memberCount || group?.members?.length || 0),
      members: Array.isArray(group?.members) ? group.members : [],
      canManage: !!group?.canManage,
      lastMessage: group?.lastMessagePreview || '',
      secondaryText: group?.description || 'Nhóm chat',
      metaText: `${Number(group?.memberCount || group?.members?.length || 0)} thành viên`,
      online: false,
      lastActivityMs: group?.lastMessageAt ? Date.parse(group.lastMessageAt) : 0,
    }));

    setRooms(sortRooms([...groupRooms, ...directRooms]));
  }, [friends, groups, presenceMap, currentUserId]);

  useEffect(() => {
    if (!rooms.length) {
      if (activeChatId) setActiveChatId(null);
      return;
    }
    const exists = rooms.some((room) => String(room.id) === String(activeChatId));
    if (!exists) setActiveChatId(rooms[0].id);
  }, [rooms, activeChatId]);

  const activeRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(activeChatId)) || null,
    [rooms, activeChatId]
  );

  useEffect(() => {
    let ignore = false;

    async function loadMessages() {
      if (!activeRoom?.id) {
        setMessages([]);
        return;
      }

      setLoadingMsgs(true);
      seenMessageIdsRef.current = new Set();
      seenClientIdsRef.current = new Set();

      try {
        const socket = socketRef.current;
        socket?.emit?.('chat:join', { chatId: activeRoom.id });

        const data = await chatApi.getMessages(activeRoom.id, { limit: 50 });
        const items = normalizeList(data?.items || data);
        if (ignore) return;

        items.forEach((item) => {
          const serverId = item._id || item.id;
          const clientId = item.clientMessageId || null;
          if (serverId) seenMessageIdsRef.current.add(String(serverId));
          if (clientId) seenClientIdsRef.current.add(String(clientId));
        });

        setMessages(items);
      } catch (e) {
        console.error('Load messages error:', e);
        if (!ignore) setMessages([]);
      } finally {
        if (!ignore) setLoadingMsgs(false);
      }
    }

    loadMessages();

    return () => {
      ignore = true;
      socketRef.current?.emit?.('chat:leave', { chatId: activeRoom?.id });
    };
  }, [activeRoom?.id]);

  const uiMessages = useMemo(
    () => messages.map((message) => toUiMessage(message, currentUserId)),
    [messages, currentUserId]
  );

  const incomingByFromId = useMemo(() => {
    const map = new Map();
    incoming.forEach((request) => {
      const fromId = getReqFromId(request);
      if (fromId) map.set(String(fromId), request);
    });
    return map;
  }, [incoming]);

  const outgoingToIdSet = useMemo(() => {
    return new Set(outgoing.map((request) => String(getReqToId(request))).filter(Boolean));
  }, [outgoing]);

  const friendIdSet = useMemo(() => {
    return new Set(friends.map((friend) => String(getUserId(friend))).filter(Boolean));
  }, [friends]);

  const candidates = useMemo(() => {
    return allUsers.filter((user) => String(getUserId(user)) !== String(currentUserId));
  }, [allUsers, currentUserId]);

  const groupMembersForInfo = useMemo(() => {
    if (!activeRoom || activeRoom.type !== 'group') return [];
    return (activeRoom.members || []).map((member) => {
      const profile = userDirectory.get(String(member?.userId)) || {};
      return {
        ...member,
        displayName: getUserName(profile) || `User ${shortId(member?.userId)}`,
        email: getUserEmail(profile),
      };
    });
  }, [activeRoom, userDirectory]);

  const getRelation = useCallback(
    (userId) => {
      const id = String(userId || '');
      if (!id) return 'none';
      if (friendIdSet.has(id)) return 'friends';
      if (outgoingToIdSet.has(id)) return 'outgoing';
      if (incomingByFromId.has(id)) return 'incoming';
      return 'none';
    },
    [friendIdSet, outgoingToIdSet, incomingByFromId]
  );

  const handleSend = useCallback(
    async (text) => {
      if (!activeRoom?.id || !currentUserId) return;

      const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimistic = {
        chatId: activeRoom.id,
        senderId: currentUserId,
        content: text,
        clientMessageId,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };

      seenClientIdsRef.current.add(String(clientMessageId));
      setMessages((prev) => [...prev, optimistic]);
      setSending(true);
      setRooms((prev) =>
        sortRooms(
          prev.map((room) =>
            room.id === activeRoom.id
              ? {
                  ...room,
                  lastMessage: previewOfMessage(optimistic),
                  lastActivityMs: Date.now(),
                }
              : room
          )
        )
      );

      try {
        const data = await chatApi.sendMessage(activeRoom.id, { content: text, clientMessageId });
        const nextMessage = data?.message || data;
        setMessages((prev) =>
          prev.map((item) =>
            item.clientMessageId && String(item.clientMessageId) === String(clientMessageId)
              ? { ...nextMessage }
              : item
          )
        );
      } catch (e) {
        console.error('Send message error:', e);
        setMessages((prev) => prev.filter((item) => item.clientMessageId !== clientMessageId));
        alert('Không gửi được tin nhắn.');
      } finally {
        setSending(false);
      }
    },
    [activeRoom, currentUserId]
  );

  const handleAccept = useCallback(
    async (requestId) => {
      if (!requestId) return;
      try {
        await friendsApi.acceptFriendRequest(requestId);
        await loadLeft();
      } catch (e) {
        console.error('Accept friend request error:', e);
        alert('Không thể chấp nhận lời mời.');
      }
    },
    [loadLeft]
  );

  const handleReject = useCallback(
    async (requestId) => {
      if (!requestId) return;
      try {
        await friendsApi.rejectFriendRequest(requestId);
        await loadLeft();
      } catch (e) {
        console.error('Reject friend request error:', e);
        alert('Không thể từ chối lời mời.');
      }
    },
    [loadLeft]
  );

  const handleAcceptByUser = useCallback(
    async (fromUserId) => {
      const req = incomingByFromId.get(String(fromUserId));
      const requestId = getReqId(req);
      if (!requestId) return;
      await handleAccept(requestId);
    },
    [incomingByFromId, handleAccept]
  );

  const handleAddFriend = useCallback(
    async (user) => {
      const toId = getUserId(user);
      if (!toId) return;

      const rel = getRelation(toId);
      if (rel === 'friends' || rel === 'outgoing') return;

      if (rel === 'incoming') {
        await handleAcceptByUser(toId);
        return;
      }

      try {
        await friendsApi.sendFriendRequest(toId);
        await loadLeft();
      } catch (e) {
        console.error('Send request error:', e);
        alert(e?.response?.data?.message || 'Không gửi được lời mời kết bạn.');
      }
    },
    [getRelation, handleAcceptByUser, loadLeft]
  );

  const handleCreateGroup = useCallback(
    async (payload) => {
      try {
        setCreatingGroup(true);
        const data = await chatApi.createGroup(payload);
        const group = data?.group || data;
        setCreateGroupOpen(false);
        setActiveChatId(group?.chatId || group?.id || null);
        await loadLeft();
      } catch (e) {
        console.error('Create group error:', e);
        alert(e?.response?.data?.message || e?.response?.data?.error || 'Không tạo được nhóm chat.');
      } finally {
        setCreatingGroup(false);
      }
    },
    [loadLeft]
  );

  const handleAddGroupMembers = useCallback(
    async (payload) => {
      if (!activeRoom?.id || activeRoom.type !== 'group') return;

      try {
        setAddingMembers(true);
        const data = await chatApi.addGroupMembers(activeRoom.id, payload);
        setAddMembersOpen(false);
        await loadLeft();
      } catch (e) {
        console.error('Add group members error:', e);
        alert(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            'Không thêm được thành viên vào nhóm.'
        );
      } finally {
        setAddingMembers(false);
      }
    },
    [activeRoom, loadLeft]
  );

  const onCallAudio = async () => {
    if (!activeRoom?.peerId) return;
    try {
      await getCallManager()?.startCall?.({ toUserId: activeRoom.peerId, type: 'audio' });
    } catch (e) {
      console.error(e);
      alert('Không thể bắt đầu gọi thoại. Kiểm tra quyền micro.');
    }
  };

  const onCallVideo = async () => {
    if (!activeRoom?.peerId) return;
    try {
      await getCallManager()?.startCall?.({ toUserId: activeRoom.peerId, type: 'video' });
    } catch (e) {
      console.error(e);
      alert('Không thể bắt đầu gọi video. Kiểm tra quyền camera/micro.');
    }
  };

  if (!currentUserId) {
    return (
      <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-6 text-[var(--text-secondary)] shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-primary)]">
            <LogIn className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">Bạn chưa đăng nhập</div>
            <div className="mt-1 text-sm text-[var(--text-muted)]">Hãy đăng nhập để truy cập khu vực trò chuyện.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-transparent p-3 text-[var(--text-secondary)] sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl bg-transparent sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <SummaryPill label="Bạn bè" value={friends.length} />
              <SummaryPill label="Nhóm chat" value={groups.length} />
              <SummaryPill label="Lời mời đến" value={incoming.length} />
              <SummaryPill label="Phòng chat" value={rooms.length} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setCreateGroupOpen(true)}
                title="Tạo nhóm chat"
                className="!h-9 !rounded-lg !bg-[#1f6feb] !px-3 !py-2 !text-sm !text-black !shadow-none hover:!bg-[#388bfd]"
              >
                <span className="flex items-center gap-2">
                  <UsersRound size={15} />
                  <span>Tạo nhóm</span>
                </span>
              </Button>

              <Button
                onClick={loadLeft}
                title="Làm mới"
                className="!h-9 !rounded-lg !bg-[var(--surface-muted)] !px-3 !py-2 !text-sm !text-black !shadow-none hover:!bg-[var(--surface-card)]"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} />
                  <span>Làm mới</span>
                </span>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-start">
            <aside className="space-y-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-auto">
              {loadingLeft ? (
                <SideCard>
                  <div className="text-sm text-[var(--text-muted)]">Đang tải...</div>
                </SideCard>
              ) : leftError ? (
                <SideCard>
                  <div className="text-sm text-[#ff7b72]">{leftError}</div>
                </SideCard>
              ) : (
                <>
                  <SideCard>
                    <SectionTitle title="Nhóm chat" count={groups.length} action={
                      <button
                        type="button"
                        onClick={() => setCreateGroupOpen(true)}
                        className="rounded-lg bg-[#1f6feb]/15 p-1.5 text-[#79c0ff] transition hover:bg-[#1f6feb]/25"
                        title="Tạo nhóm chat"
                      >
                        <MessageSquarePlus size={14} />
                      </button>
                    } />
                    {groups.length === 0 ? (
                      <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-muted)]">
                        Chưa có nhóm chat. Hãy tạo nhóm mới.
                      </div>
                    ) : (
                      <ChatList
                        rooms={rooms.filter((room) => room.type === 'group')}
                        activeId={activeChatId}
                        onSelect={setActiveChatId}
                      />
                    )}
                  </SideCard>

                  <SideCard>
                    <SectionTitle title="Lời mời đến" count={incoming.length} />
                    {incoming.length === 0 ? (
                      <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-muted)]">Không có lời mời</div>
                    ) : (
                      <div className="space-y-2">
                        {incoming.map((r) => {
                          const requestId = getReqId(r);
                          const fromId = getReqFromId(r);
                          const profile = userDirectory.get(String(fromId)) || r?.from || {};
                          return (
                            <div key={requestId || `${fromId}-incoming`} className="rounded-xl bg-[var(--surface-muted)] px-3 py-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                                    {getUserName(profile)}
                                  </div>
                                  <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                    {getUserEmail(profile) || `ID: ${shortId(fromId)}`}
                                  </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                  <TextAction tone="success" onClick={() => handleAccept(requestId)} title="Chấp nhận">
                                    Chấp nhận
                                  </TextAction>
                                  <TextAction tone="danger" onClick={() => handleReject(requestId)} title="Từ chối">
                                    Từ chối
                                  </TextAction>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SideCard>

                  <SideCard>
                    <SectionTitle title="Bạn bè" count={friends.length} />
                    {friends.length ? (
                      <ChatList
                        rooms={rooms.filter((room) => room.type === 'direct')}
                        activeId={activeChatId}
                        onSelect={setActiveChatId}
                      />
                    ) : (
                      <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-muted)]">Chưa có bạn bè</div>
                    )}
                  </SideCard>

                  <SideCard>
                    <SectionTitle title="Người dùng" count={candidates.length} />
                    <div className="space-y-2">
                      {candidates.map((u) => {
                        const id = getUserId(u);
                        const rel = id ? getRelation(id) : 'none';

                        return (
                          <div key={id || Math.random()} className="rounded-xl bg-[var(--surface-muted)] px-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-[var(--text-primary)]">{getUserName(u)}</div>
                                <div className="mt-1 truncate text-xs text-[var(--text-muted)]">{getUserEmail(u) || `ID: ${shortId(id)}`}</div>
                              </div>

                              {rel === 'friends' ? (
                                <TextAction disabled tone="muted" title="Đã là bạn">
                                  Bạn bè
                                </TextAction>
                              ) : rel === 'outgoing' ? (
                                <TextAction disabled tone="muted" title="Bạn đã gửi lời mời">
                                  Đã gửi
                                </TextAction>
                              ) : rel === 'incoming' ? (
                                <TextAction tone="success" onClick={() => handleAcceptByUser(id)} title="Người này đã gửi cho bạn">
                                  Chấp nhận
                                </TextAction>
                              ) : (
                                <TextAction tone="primary" onClick={() => handleAddFriend(u)} title="Gửi lời mời">
                                  Kết bạn
                                </TextAction>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SideCard>
                </>
              )}
            </aside>

            <main>
              {!activeChatId ? (
                <div className="grid min-h-[540px] place-items-center rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-8 text-center text-sm text-[var(--text-primary)] xl:min-h-[620px]">
                  Chọn một cuộc trò chuyện hoặc tạo nhóm mới
                </div>
              ) : loadingMsgs ? (
                <div className="grid min-h-[540px] place-items-center rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-card)] text-sm text-[var(--text-primary)] xl:min-h-[620px]">
                  Đang tải tin nhắn...
                </div>
              ) : (
                <ChatRoom
                  room={activeRoom}
                  messages={uiMessages}
                  onSend={handleSend}
                  sending={sending}
                  onCall={onCallAudio}
                  onVideo={onCallVideo}
                  onInfo={() => setInfoOpen(true)}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      <CreateGroupChatModal
        open={createGroupOpen}
        friends={friends}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        loading={creatingGroup}
      />

      <ChatInfoModal
        open={infoOpen}
        room={activeRoom}
        members={groupMembersForInfo}
        onClose={() => setInfoOpen(false)}
        onAddMembers={() => setAddMembersOpen(true)}
        canManageMembers={activeRoom?.type === 'group' && activeRoom?.canManage}
      />

      <AddGroupMembersModal
        open={addMembersOpen}
        friends={friends}
        existingMembers={activeRoom?.members || []}
        onClose={() => setAddMembersOpen(false)}
        onSubmit={handleAddGroupMembers}
        loading={addingMembers}
      />
    </>
  );
}
