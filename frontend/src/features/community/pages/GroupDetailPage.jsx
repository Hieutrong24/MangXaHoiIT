import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '../../../shared/components/GlassCard';
import Button from '../../../shared/components/Button';
import { communityApi } from '../api/community.api';
import { friendsApi } from '../../users/api/friends.api';
import GroupTabs from '../components/GroupTabs';
import ModerationPanel from '../components/ModerationPanel';
import GroupMembersTab from '../components/GroupMembersTab';
import GroupRulesTab from '../components/GroupRulesTab';
import InviteMemberModal from '../components/InviteMemberModal';
import GroupRequestsPanel from '../components/GroupRequestsPanel';
import CreateGroupModal from '../components/CreateGroupModal';
import { getCurrentUserId } from '../../../shared/utils/currentUser';
import { http } from '../../../services/http';
import { feedApi } from '../../feed/api/feed.api';
import CommentModal from '../../feed/modals/CommentModal';
import ShareModal from '../../feed/modals/ShareModal';
import { Users, Lock, Globe2, RefreshCw, BarChart3, PlusCircle, PencilLine, Heart, MessageCircle, Repeat2, Clock3, ShieldCheck } from 'lucide-react';

function cx(...classes) {
  return classes.flat().filter(Boolean).join(' ');
}

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 5)}…${s.slice(-4)}` : s;
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  return [];
}

function getPostId(post) {
  return post?._id || post?.id || '';
}

function getUserKey(user) {
  return user?.userId || user?.id || user?._id || user?.UserId || user?.Id || '';
}

function safeReadUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function getStoredUserId() {
  const storedUser = safeReadUser();
  return (
    localStorage.getItem('userId') ||
    localStorage.getItem('uid') ||
    localStorage.getItem('currentUserId') ||
    storedUser?.userId ||
    storedUser?.id ||
    storedUser?._id ||
    ''
  );
}

function buildAuthorObject(user, authorId) {
  if (!user) {
    return {
      id: authorId,
      userId: authorId,
      fullName: `User ${shortId(authorId)}`,
      username: shortId(authorId),
      avatarUrl: '',
    };
  }

  return {
    id: getUserKey(user) || authorId,
    userId: getUserKey(user) || authorId,
    username: user?.username || user?.userName || user?.Username || user?.studentCode || null,
    fullName: user?.fullName || user?.displayName || user?.name || user?.Name || null,
    avatarUrl: user?.avatarUrl || user?.avatar || user?.profilePicture || user?.photoUrl || '',
    email: user?.email || user?.Email || '',
  };
}

function deriveLiked(post) {
  const currentUserId = getStoredUserId();
  const likes = Array.isArray(post?.likes) ? post.likes.map(String) : [];
  return currentUserId ? likes.includes(String(currentUserId)) : false;
}

function deriveLikeCount(post) {
  if (typeof post?.likeCount === 'number') return post.likeCount;
  if (Array.isArray(post?.likes)) return post.likes.length;
  return 0;
}

function formatPostTime(value) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getAuthorName(post) {
  return post?.author?.fullName || post?.author?.username || post?.author?.name || `User ${shortId(post?.authorId)}`;
}

function getAuthorInitial(post) {
  return String(getAuthorName(post) || 'U').trim().slice(0, 1).toUpperCase();
}

function normalizeModerationStatus(status) {
  const value = String(status || '').trim().toLowerCase();
  return ['pending', 'approved', 'rejected'].includes(value) ? value : 'approved';
}

function normalizePost(post) {
  return {
    ...post,
    moderationStatus: normalizeModerationStatus(post?.moderationStatus),
  };
}

function mergePosts(...postLists) {
  const byId = new Map();
  postLists.flat().filter(Boolean).forEach((post) => {
    const normalized = normalizePost(post);
    const key = String(normalized._id || normalized.id || `${normalized.authorId || ''}-${normalized.createdAt || ''}-${normalized.title || ''}`);
    byId.set(key, { ...(byId.get(key) || {}), ...normalized });
  });
  return [...byId.values()].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function enrichPostsWithUsers(posts, usersMap) {
  return posts.map((post) => {
    const authorId = String(post?.authorId || post?.author || '');
    const rawUser = usersMap.get(authorId) || null;

    return {
      ...post,
      author:
        post?.author && typeof post.author === 'object'
          ? post.author
          : buildAuthorObject(rawUser, authorId),
      liked: typeof post?.liked === 'boolean' ? post.liked : deriveLiked(post),
      likeCount: deriveLikeCount(post),
    };
  });
}

async function fetchUsersMap() {
  const res = await http.get('/users', { params: { page: 1, pageSize: 500 } });
  const users = normalizeList(res.data);
  const map = new Map();
  users.forEach((user) => {
    const key = String(getUserKey(user) || '');
    if (key) map.set(key, user);
  });
  return map;
}

function GroupPostCard({ post, group, onToggleLike, onOpenComments, onOpenShare }) {
  const postId = getPostId(post);
  const liked = !!post?.liked;
  const likeCount = deriveLikeCount(post);
  const commentCount = Number(post?.commentCount || 0);
  const shareCount = Number(post?.shareCount || 0);
  const paragraphs = String(post?.content || '')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <GlassCard className="overflow-hidden border border-white/10 bg-slate-950/45 p-0">
      <div className="border-b border-white/10 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/70 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-lg font-black text-cyan-100">
              {getAuthorInitial(post)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-sm font-bold text-white">{getAuthorName(post)}</div>
                <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-200">
                  Đã duyệt
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                <span>{formatPostTime(post?.createdAt || post?.updatedAt)}</span>
                <span className="text-slate-600">/</span>
                <span>{group?.name || 'Nhóm'}</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            Group post
          </div>
        </div>
      </div>

      <article className="px-5 py-5">
        <div className="text-xl font-black leading-tight text-white sm:text-2xl">{post?.title || 'Bài viết nhóm'}</div>

        <div className="mt-4 space-y-3 text-[15px] leading-7 text-slate-200">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, idx) => (
              <p key={`${postId}-p-${idx}`} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-slate-400">Bài viết chưa có nội dung.</p>
          )}
        </div>

        {Array.isArray(post?.tags) && post.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleLike?.(post)}
            className={cx(
              'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition',
              liked
                ? 'border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15'
                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
            )}
          >
            <Heart className={cx('h-4 w-4', liked && 'fill-current')} />
            Thích
            <span className="text-xs opacity-80">{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenComments?.(post)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
          >
            <MessageCircle className="h-4 w-4 text-cyan-200" />
            Bình luận
            <span className="text-xs opacity-80">{commentCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenShare?.(post)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
          >
            <Repeat2 className="h-4 w-4 text-violet-200" />
            Chia sẻ
            <span className="text-xs opacity-80">{shareCount}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">Chỉ bài đã duyệt mới hiển thị trong nhóm</div>
      </div>
    </GlassCard>
  );
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState(new Map());
  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState(null);
  const [groupInvitations, setGroupInvitations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const [activeTab, setActiveTab] = useState('posts');
  const [composer, setComposer] = useState({ title: '', content: '', postType: 'post' });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [requestLoading, setRequestLoading] = useState({});

  const currentUserRole = String(group?.currentUserRole || '').toLowerCase();
  const isManager = !!group?.isManager || ['owner', 'admin', 'moderator'].includes(currentUserRole);
  const isOwner = currentUserRole === 'owner';
  const isMember = group?.isMember || false;
  const privacy = group?.privacy || 'public';

  async function load() {
    try {
      if (!groupId) return;
      setLoading(true);
      const g = await communityApi.getGroup(groupId);
      setGroup(g);

      const hasManagerAccess = !!g?.isManager || ['owner', 'admin', 'moderator'].includes(String(g?.currentUserRole || '').toLowerCase());
      const tasks = [
        communityApi.listMembers(groupId).catch(() => ({ items: [] })),
        communityApi.listGroupPosts(groupId, { page: 1, pageSize: 50, status: hasManagerAccess ? 'all' : undefined }).catch(() => ({ items: [] })),
      ];

      if (hasManagerAccess) {
        tasks.push(
          communityApi.getGroupStats(groupId).catch(() => null),
          communityApi.listGroupInvitations(groupId, { page: 1, pageSize: 50 }).catch(() => ({ items: [] })),
          communityApi.listGroupJoinRequests(groupId, { page: 1, pageSize: 50 }).catch(() => ({ items: [] })),
          communityApi.listGroupPosts(groupId, { page: 1, pageSize: 50, status: 'pending' }).catch(() => ({ items: [] })),
          communityApi.listGroupPosts(groupId, { page: 1, pageSize: 50, status: 'approved' }).catch(() => ({ items: [] }))
        );
      }

      const results = await Promise.all(tasks);
      setMembers(Array.isArray(results[0]?.items) ? results[0].items : []);
      const nextPosts = Array.isArray(results[1]?.items) ? results[1].items : [];
      const nextPendingPosts = hasManagerAccess && Array.isArray(results[5]?.items) ? results[5].items : [];
      const nextApprovedPosts = hasManagerAccess && Array.isArray(results[6]?.items) ? results[6].items : [];
      const mergedPosts = mergePosts(nextPosts, nextPendingPosts, nextApprovedPosts);
      const nextUsersMap = await fetchUsersMap().catch(() => new Map());
      setUsersMap(nextUsersMap);
      setPosts(enrichPostsWithUsers(mergedPosts, nextUsersMap));
      if (hasManagerAccess) {
        setStats(results[2] || null);
        setGroupInvitations(Array.isArray(results[3]?.items) ? results[3].items : []);
        setJoinRequests(Array.isArray(results[4]?.items) ? results[4].items : []);
      } else {
        setStats(null);
        setGroupInvitations([]);
        setJoinRequests([]);
      }
    } catch (e) {
      console.error('Load group error:', e);
      alert(e?.response?.data?.message || 'Không tải được thông tin nhóm');
    } finally {
      setLoading(false);
    }
  }

  async function loadFriends() {
    try {
      const res = await friendsApi.listFriends({ page: 1, pageSize: 100 });
      setFriends(Array.isArray(res?.items) ? res.items : []);
    } catch (e) {
      console.error('Load friends error:', e);
    }
  }

  useEffect(() => {
    load();
    loadFriends();
  }, [groupId]);

  async function submitPost() {
    if (!composer.title.trim() || !composer.content.trim()) {
      alert('Hãy nhập tiêu đề và nội dung');
      return;
    }
    try {
      setSubmittingPost(true);
      await communityApi.createGroupPost(groupId, { ...composer, tags: [] });
      setComposer({ title: '', content: '', postType: 'post' });
      setComposerOpen(false);
      setActiveTab('posts');
      setMessage('Đã gửi bài viết. Bài có thể cần chờ duyệt.');
      await load();
    } catch (e) {
      console.error('Submit post error:', e);
      alert(e?.response?.data?.message || 'Không đăng được bài viết');
    } finally {
      setSubmittingPost(false);
    }
  }

  async function handleCreateGroup(payload) {
    try {
      const created = await communityApi.createGroup(payload);
      setCreateOpen(false);
      setMessage('Đã tạo nhóm mới.');
      const nextGroupId = created?._id || created?.id;
      if (nextGroupId) {
        navigate(`/community/groups/${nextGroupId}`);
        return;
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Không tạo được nhóm mới');
    }
  }

  const handleInviteMembers = useCallback(
    async (memberIds) => {
      try {
        setInviting(true);
        for (const recipientId of memberIds) {
          await communityApi.inviteMember(groupId, { recipientId });
        }
        setInviteOpen(false);
        setMessage('Mời thành viên thành công.');
        await load();
      } catch (e) {
        console.error('Invite members error:', e);
        alert(e?.response?.data?.message || 'Không mời được thành viên');
      } finally {
        setInviting(false);
      }
    },
    [groupId]
  );

  const handlePromoteMember = useCallback(async (memberId, newRole) => {
    try {
      await communityApi.promoteMember(groupId, memberId, { role: newRole });
      setMessage('Đã cập nhật quyền thành viên.');
      await load();
    } catch (e) {
      console.error('Promote member error:', e);
      alert(e?.response?.data?.message || 'Không thể thay đổi quyền');
    }
  }, [groupId]);

  const handleRemoveMember = useCallback(async (memberId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa thành viên này?')) return;
    try {
      await communityApi.removeMember(groupId, memberId);
      setMessage('Đã xóa thành viên khỏi nhóm.');
      await load();
    } catch (e) {
      console.error('Remove member error:', e);
      alert(e?.response?.data?.message || 'Không thể xóa thành viên');
    }
  }, [groupId]);

  const handleBanMember = useCallback(async (memberId) => {
    if (!window.confirm('Ban thành viên này khỏi nhóm?')) return;
    try {
      await communityApi.banMember(groupId, memberId);
      setMessage('Đã ban thành viên.');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể ban thành viên');
    }
  }, [groupId]);

  const handleUnbanMember = useCallback(async (memberId) => {
    try {
      await communityApi.unbanMember(groupId, memberId);
      setMessage('Đã hủy ban thành viên.');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể hủy ban');
    }
  }, [groupId]);

  const handleTransferOwnership = useCallback(async (memberId) => {
    if (!window.confirm('Chuyển quyền chủ nhóm cho thành viên này?')) return;
    try {
      await communityApi.transferOwnership(groupId, { newOwnerId: memberId });
      setMessage('Đã chuyển quyền chủ nhóm.');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể chuyển quyền chủ nhóm');
    }
  }, [groupId]);

  const handleApprovePost = useCallback(async (postId) => {
    try {
      await communityApi.approvePost(groupId, postId);
      await load();
      setActiveTab('posts');
    } catch (e) {
      console.error('Approve post error:', e);
      alert(e?.response?.data?.message || 'Không phê duyệt được bài viết');
    }
  }, [groupId]);

  const handleRejectPost = useCallback(async (postId, payload) => {
    try {
      await communityApi.rejectPost(groupId, postId, payload);
      await load();
    } catch (e) {
      console.error('Reject post error:', e);
      alert(e?.response?.data?.message || 'Không từ chối được bài viết');
    }
  }, [groupId]);

  const handleToggleLike = useCallback(async (post) => {
    const postId = getPostId(post);
    if (!postId) return null;

    const result = await feedApi.toggleLike(postId);
    setPosts((prev) =>
      prev.map((item) => {
        if (getPostId(item) !== postId) return item;

        if (result?.post) {
          const merged = { ...item, ...result.post };
          const authorId = String(merged?.authorId || merged?.author || '');
          return {
            ...merged,
            author:
              merged?.author && typeof merged.author === 'object'
                ? merged.author
                : buildAuthorObject(usersMap.get(authorId), authorId),
            liked: typeof result?.liked === 'boolean' ? result.liked : deriveLiked(merged),
            likeCount: typeof result?.likeCount === 'number' ? result.likeCount : deriveLikeCount(merged),
          };
        }

        const currentUserId = getStoredUserId();
        const currentLikes = Array.isArray(item?.likes) ? item.likes.map(String) : [];
        const nextLiked = !item?.liked;
        const nextLikes = currentUserId
          ? nextLiked
            ? Array.from(new Set([...currentLikes, String(currentUserId)]))
            : currentLikes.filter((x) => x !== String(currentUserId))
          : currentLikes;

        return {
          ...item,
          liked: nextLiked,
          likes: nextLikes,
          likeCount: nextLikes.length,
        };
      })
    );
    return result;
  }, [usersMap]);

  const handleCommentCreated = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((item) =>
        getPostId(item) === postId
          ? { ...item, commentCount: Number(item?.commentCount || 0) + 1 }
          : item
      )
    );
  }, []);

  const handleUpdateRules = useCallback(async (payload) => {
    try {
      await communityApi.updateGroup(groupId, payload);
      setMessage('Đã cập nhật quy định nhóm.');
      await load();
    } catch (e) {
      console.error('Update rules error:', e);
      alert(e?.response?.data?.message || 'Không cập nhật được quy định');
    }
  }, [groupId]);

  async function handleJoinCurrentGroup() {
    try {
      const res = await communityApi.joinGroup(groupId, {});
      setMessage(res?.requiresApproval ? 'Đã gửi yêu cầu tham gia nhóm.' : 'Đã tham gia nhóm.');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Không tham gia được nhóm');
    }
  }

  async function handleLeaveGroup() {
    if (!window.confirm('Rời khỏi nhóm này?')) return;
    try {
      await communityApi.leaveGroup(groupId);
      navigate('/community');
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể rời nhóm');
    }
  }

  async function handleDeleteGroup() {
    if (!window.confirm('Xóa nhóm này? Hành động này không thể hoàn tác.')) return;
    try {
      await communityApi.deleteGroup(groupId);
      navigate('/community');
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể xóa nhóm');
    }
  }

  async function handleRegenerateCode() {
    if (!window.confirm('Tạo mã tham gia mới cho nhóm?')) return;
    try {
      await communityApi.regenerateJoinCode(groupId);
      setMessage('Đã tạo lại mã tham gia nhóm.');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể tạo lại mã nhóm');
    }
  }

  async function handleJoinRequestAction(requestId, action) {
    try {
      setRequestLoading((prev) => ({ ...prev, [requestId]: true }));
      await communityApi.respondToJoinRequest(groupId, requestId, action);
      setMessage(action === 'approve' ? 'Đã duyệt yêu cầu tham gia.' : 'Đã từ chối yêu cầu tham gia.');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Không xử lý được yêu cầu tham gia');
    } finally {
      setRequestLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  }

  if (!group) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-slate-400">Đang tải...</div>
      </div>
    );
  }

  const memberProfiles = members.map((m) => ({
    ...m,
    displayName: m.displayName || `User ${shortId(m.userId)}`,
  }));

  const pendingPostCount = posts.filter((p) => normalizeModerationStatus(p.moderationStatus) === 'pending').length;
  const approvedPosts = posts.filter((p) => normalizeModerationStatus(p.moderationStatus) === 'approved');
  const pendingJoinRequests = joinRequests.filter((item) => item.status === 'pending');
  const pendingInvitations = groupInvitations.filter((item) => item.status === 'pending');
  const pendingPostTotal = stats?.pendingPosts ?? stats?.pendingPostCount ?? pendingPostCount;

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-cyan-300">
              <span>{privacy === 'private' ? <Lock className="inline h-4 w-4" /> : <Globe2 className="inline h-4 w-4" />}</span>
              <span>{privacy === 'private' ? 'Nhóm riêng tư' : 'Nhóm công khai'}</span>
            </div>
            <h1 className="mt-1 text-3xl font-black text-white">{group?.name || 'Nhóm'}</h1>
            <p className="mt-2 text-sm text-slate-300">{group?.description || 'Không có mô tả'}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{group?.category || 'general'}</span>
              {group?.joinCode ? <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1">Mã: {group.joinCode}</span> : null}
              {group?.currentUserRole ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Vai trò: {group.currentUserRole}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
              <Users className="mb-1 inline h-4 w-4" /> {members.length} thành viên
            </div>
            <Button variant="ghost" onClick={() => setCreateOpen(true)}>
              <PlusCircle className="h-4 w-4" /> Tạo nhóm mới
            </Button>
            {isManager && (
              <Button variant="ghost" onClick={handleRegenerateCode}><RefreshCw className="h-4 w-4" /> Mã mới</Button>
            )}
            {isManager && (
              <Button onClick={() => setInviteOpen(true)} className="!h-10 !rounded-lg !bg-cyan-500 !px-4 !py-2 !text-sm !text-black !shadow-none hover:!bg-cyan-600">
                Mời thành viên
              </Button>
            )}
            {!isMember && (
              <Button onClick={handleJoinCurrentGroup}>{privacy === 'private' ? 'Gửi yêu cầu' : 'Tham gia nhóm'}</Button>
            )}
            {isMember && !isOwner && (
              <Button variant="ghost" onClick={handleLeaveGroup}>Rời nhóm</Button>
            )}
            {isOwner && (
              <Button className="!bg-red-500/80 hover:!bg-red-500" onClick={handleDeleteGroup}>Xóa nhóm</Button>
            )}
          </div>
        </div>
        {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div> : null}
      </GlassCard>

      {isManager && (
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400">Thống kê</div>
            <div className="mt-2 flex items-center gap-2 text-white"><BarChart3 className="h-4 w-4 text-cyan-300" /> Tổng quan nhóm</div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div>Bài viết đã duyệt: {stats?.postCount ?? group?.postCount ?? approvedPosts.length}</div>
              <div>Bài chờ duyệt: {stats?.pendingPostCount ?? pendingPostCount}</div>
              <div>Thành viên: {stats?.memberCount ?? members.length}</div>
              <div>Lời mời chờ phản hồi: {pendingInvitations.length}</div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400">Kiểm duyệt</div>
            <div className="mt-2 text-sm text-slate-300">Yêu cầu tham gia chờ duyệt: {pendingJoinRequests.length}</div>
            <div className="mt-2 text-sm text-slate-300">Mã nhóm hiện tại: {group?.joinCode || 'Ẩn với vai trò hiện tại'}</div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400">Tư cách của bạn</div>
            <div className="mt-2 text-sm text-slate-300">Vai trò: {group?.currentUserRole || 'chưa tham gia'}</div>
            <div className="mt-2 text-sm text-slate-300">Trạng thái: {group?.currentUserStatus || 'không có'}</div>
          </GlassCard>
        </div>
      )}

      <GlassCard className="p-6">
        <GroupTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          postCount={approvedPosts.length}
          memberCount={members.length}
          ruleCount={Array.isArray(group?.rules) ? group.rules.length : 0}
          pendingCount={pendingPostTotal}
          invitationCount={pendingInvitations.length}
          joinRequestCount={pendingJoinRequests.length}
          isManager={isManager}
        />

        <div className="mt-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {isMember && (
                <GlassCard className="p-5">
                  <button
                    type="button"
                    className="mb-4 flex w-full items-center gap-3 rounded-[24px] border border-white/10 bg-slate-900/70 px-4 py-4 text-left transition hover:border-cyan-400/30 hover:bg-slate-900/85"
                    onClick={() => setComposerOpen((prev) => !prev)}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 text-cyan-100">
                      <PencilLine className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white">Bạn đang suy nghĩ gì?</div>
                      <div className="mt-1 text-xs text-slate-400">Chia sẻ câu hỏi, kinh nghiệm hoặc cập nhật nhanh với mọi người trong nhóm.</div>
                    </div>
                    <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      {composerOpen ? 'Thu gọn' : 'Viết bài'}
                    </div>
                  </button>
                  {composerOpen ? (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="font-bold text-white">Đăng bài vào nhóm</div>
                        <select
                          className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white"
                          value={composer.postType}
                          onChange={(e) => setComposer({ ...composer, postType: e.target.value })}
                        >
                          <option value="post">Bài viết</option>
                          <option value="question">Hỏi đáp</option>
                          <option value="share">Chia sẻ</option>
                        </select>
                      </div>
                      <input
                        className="mb-3 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                        placeholder="Đặt tiêu đề ngắn gọn cho bài viết"
                        value={composer.title}
                        onChange={(e) => setComposer({ ...composer, title: e.target.value })}
                      />
                      <textarea
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                        rows={5}
                        placeholder="Viết điều bạn đang nghĩ, câu hỏi cần thảo luận, hoặc cập nhật bạn muốn chia sẻ..."
                        value={composer.content}
                        onChange={(e) => setComposer({ ...composer, content: e.target.value })}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button onClick={submitPost} disabled={submittingPost}>
                          {submittingPost ? 'Đang đăng...' : 'Đăng bài'}
                        </Button>
                      </div>
                    </>
                  ) : null}
                </GlassCard>
              )}

              <div className="space-y-3">
                {approvedPosts.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-4 text-sm text-slate-400">
                    Chưa có bài viết nào
                  </div>
                ) : (
                  approvedPosts.map((post) => (
                    <GroupPostCard
                      key={getPostId(post)}
                      post={post}
                      group={group}
                      onToggleLike={handleToggleLike}
                      onOpenComments={setCommentPost}
                      onOpenShare={setSharePost}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <GroupMembersTab
              group={group}
              members={memberProfiles}
              isManager={isManager}
              isOwner={isOwner}
              currentUserId={currentUserId}
              onPromote={handlePromoteMember}
              onRemove={handleRemoveMember}
              onBan={handleBanMember}
              onUnban={handleUnbanMember}
              onTransferOwnership={handleTransferOwnership}
            />
          )}

          {activeTab === 'rules' && (
            <GroupRulesTab group={group} isManager={isManager} onUpdateRules={handleUpdateRules} />
          )}

          {activeTab === 'moderation' && isManager && (
            <ModerationPanel posts={posts} isManager={isManager} onApprove={handleApprovePost} onReject={handleRejectPost} />
          )}

          {activeTab === 'requests' && isManager && (
            <GroupRequestsPanel
              title="Yêu cầu tham gia nhóm"
              items={joinRequests}
              emptyText="Không có yêu cầu tham gia nào."
              itemLabel={(item) => `Người dùng ${shortId(item.userId)} muốn tham gia`}
              onApprove={(id) => handleJoinRequestAction(id, 'approve')}
              onReject={(id) => handleJoinRequestAction(id, 'reject')}
              loadingMap={requestLoading}
            />
          )}

          {activeTab === 'invitations' && isManager && (
            <GroupRequestsPanel
              title="Lời mời đã gửi"
              items={groupInvitations}
              emptyText="Chưa có lời mời nào."
              itemLabel={(item) => `Mời ${shortId(item.recipientId)} vào nhóm với vai trò ${item.role || 'member'}`}
              loadingMap={{}}
            />
          )}
        </div>
      </GlassCard>

      <InviteMemberModal
        open={inviteOpen}
        friends={friends}
        existingMembers={memberProfiles}
        onClose={() => setInviteOpen(false)}
        onSubmit={handleInviteMembers}
        loading={inviting}
      />

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />

      <CommentModal
        open={!!commentPost}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        onCommentCreated={handleCommentCreated}
      />

      <ShareModal
        open={!!sharePost}
        post={sharePost}
        onClose={() => setSharePost(null)}
      />

      {loading ? <div className="text-center text-xs text-slate-500">Đang đồng bộ dữ liệu nhóm...</div> : null}
    </div>
  );
}