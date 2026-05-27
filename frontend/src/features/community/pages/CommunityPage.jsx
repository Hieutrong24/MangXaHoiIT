import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, MessagesSquare, PlusCircle, Sparkles, Lock, Globe2 } from "lucide-react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import { communityApi } from "../api/community.api";
import CreateGroupModal from "../components/CreateGroupModal";
import JoinGroupModal from "../components/JoinGroupModal";
import MyGroupInbox from "../components/MyGroupInbox";

export default function CommunityPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [message, setMessage] = useState('');
  const [myInvitations, setMyInvitations] = useState([]);
  const [myJoinRequests, setMyJoinRequests] = useState([]);
  const [actingGroupId, setActingGroupId] = useState('');
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);
  const [pendingJoinGroupIds, setPendingJoinGroupIds] = useState([]);

  function markGroupUiState(groupId, patch) {
    const normalizedId = String(groupId);
    setGroups((prev) =>
      prev.map((item) =>
        String(item._id || item.id) === normalizedId ? { ...item, ...patch } : item
      )
    );
  }

  async function load() {
    setLoading(true);
    try {
      const [groupData, invitationData, joinRequestData] = await Promise.all([
        communityApi.listGroups({ page: 1, pageSize: 20 }),
        communityApi.listMyInvitations({ page: 1, pageSize: 20 }).catch(() => ({ items: [] })),
        communityApi.listMyJoinRequests({ page: 1, pageSize: 20 }).catch(() => ({ items: [] })),
      ]);
      setGroups(Array.isArray(groupData?.items) ? groupData.items : []);
      setMyInvitations(Array.isArray(invitationData?.items) ? invitationData.items : []);
      setMyJoinRequests(Array.isArray(joinRequestData?.items) ? joinRequestData.items : []);
      setJoinedGroupIds((prev) => [
        ...new Set([
          ...prev,
          ...(Array.isArray(groupData?.items)
            ? groupData.items.filter((item) => item?.isMember).map((item) => String(item._id || item.id))
            : []),
        ]),
      ]);
      setPendingJoinGroupIds((prev) => [
        ...new Set([
          ...prev,
          ...(Array.isArray(joinRequestData?.items)
            ? joinRequestData.items
                .filter((item) => item?.status === 'pending')
                .map((item) => String(item.groupId || item.group?._id || item.group?.id))
            : []),
        ]),
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(payload) {
    try {
      await communityApi.createGroup(payload);
      setMessage('Tạo nhóm thành công.');
      setOpenCreate(false);
      load();
    } catch (e) { setMessage(e?.response?.data?.message || e.message || 'Không tạo được nhóm'); }
  }

  async function handleJoin(code) {
    try {
      const joinedGroup = await communityApi.joinByCode(code);
      setMessage('Tham gia nhóm thành công.');
      setOpenJoin(false);
      if (joinedGroup?._id || joinedGroup?.id) {
        markGroupUiState(joinedGroup._id || joinedGroup.id, {
          isMember: true,
          currentUserStatus: 'active',
          pendingJoinRequest: false,
        });
        setJoinedGroupIds((prev) => [...new Set([...prev, String(joinedGroup._id || joinedGroup.id)])]);
        setPendingJoinGroupIds((prev) => prev.filter((id) => id !== String(joinedGroup._id || joinedGroup.id)));
      }
      load();
    } catch (e) { setMessage(e?.response?.data?.message || e.message || 'Không tham gia được nhóm'); }
  }

  async function handleJoinGroup(group) {
    const groupId = String(group._id || group.id);
    try {
      setActingGroupId(groupId);
      const res = await communityApi.joinGroup(groupId, {});
      setMessage(res?.requiresApproval ? 'Đã gửi yêu cầu tham gia nhóm.' : 'Đã tham gia nhóm.');
      markGroupUiState(
        groupId,
        res?.requiresApproval
          ? { pendingJoinRequest: true }
          : { isMember: true, currentUserStatus: 'active', pendingJoinRequest: false }
      );
      if (res?.requiresApproval) {
        setPendingJoinGroupIds((prev) => [...new Set([...prev, groupId])]);
      } else {
        setJoinedGroupIds((prev) => [...new Set([...prev, groupId])]);
        setPendingJoinGroupIds((prev) => prev.filter((id) => id !== groupId));
      }
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || e.message || 'Không tham gia được nhóm');
    } finally {
      setActingGroupId('');
    }
  }

  async function handleInvitationAction(inviteId, action) {
    try {
      await communityApi.respondToInvitation(inviteId, action);
      setMessage(action === 'accept' ? 'Đã chấp nhận lời mời.' : 'Đã từ chối lời mời.');
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || e.message || 'Không xử lý được lời mời');
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <GlassCard className="overflow-hidden p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Cộng đồng học tập</div>
              <h1 className="mt-2 text-3xl font-black text-white">Nhóm học, hỏi đáp, chia sẻ lab và sản phẩm cá nhân</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">Đồng bộ đầy đủ với luồng nhóm mới: lời mời, yêu cầu tham gia, quản trị thành viên, nhóm riêng tư và duyệt bài.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpenJoin(true)}>Tham gia bằng mã</Button>
              <Button onClick={() => setOpenCreate(true)}><PlusCircle className="h-4 w-4" /> Tạo nhóm</Button>
            </div>
          </div>
          {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div> : null}
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2">
          {(loading ? Array.from({ length: 4 }, (_, i) => ({ _id: i, name: 'Đang tải...', description: '', members: [], memberCount: 0 })) : groups).map((group) => {
            const groupId = group._id || group.id;
            const isMember = !!group.isMember || joinedGroupIds.includes(String(groupId));
            const isPendingJoinRequest =
              (!!group.pendingJoinRequest || pendingJoinGroupIds.includes(String(groupId))) ||
              myJoinRequests.some(
                (item) =>
                  String(item.groupId || item.group?._id || item.group?.id) === String(groupId) &&
                  item.status === 'pending'
              );
            const privacy = group.privacy || group.visibility || 'public';
            const memberCount = group.memberCount || group.memberIds?.length || group.members?.length || 0;
            return (
              <GlassCard key={groupId} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-extrabold text-white">{group.name}</div>
                    <div className="mt-1 text-sm text-slate-400 line-clamp-3">{group.description || 'Nhóm học tập và chia sẻ kiến thức.'}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{privacy === 'private' ? <Lock className="mr-1 inline h-3.5 w-3.5" /> : <Globe2 className="mr-1 inline h-3.5 w-3.5" />}{privacy}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{group.category || 'study'}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{memberCount} thành viên</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{group.postCount || 0} bài viết</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">{Array.isArray(group.topics) ? group.topics.slice(0, 3).join(' • ') : ''}</div>
                  <div className="flex items-center gap-2">
                    {isMember && !loading ? (
                      <Button variant="ghost" disabled>
                        Đã tham gia
                      </Button>
                    ) : null}
                    {!isMember && isPendingJoinRequest && !loading ? (
                      <Button variant="ghost" disabled>
                        Đã gửi yêu cầu
                      </Button>
                    ) : null}
                    {!isMember && !isPendingJoinRequest && !loading ? (
                      <Button disabled={actingGroupId === String(groupId)} onClick={() => handleJoinGroup(group)}>
                        {actingGroupId === String(groupId) ? 'Đang xử lý...' : privacy === 'private' ? 'Gửi yêu cầu' : 'Tham gia'}
                      </Button>
                    ) : null}
                    <Link className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" to={`/community/groups/${groupId}`}>Vào nhóm</Link>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 text-white"><Users className="h-5 w-5 text-cyan-300" /> <span className="font-bold">Tính năng nổi bật</span></div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><Sparkles className="mb-2 h-4 w-4 text-amber-300" /> Nhóm công khai hoặc riêng tư, có thể tham gia bằng mã hoặc gửi yêu cầu chờ duyệt.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><MessagesSquare className="mb-2 h-4 w-4 text-cyan-300" /> Quản trị đầy đủ: duyệt bài, mời thành viên, ban/hủy ban, chuyển chủ nhóm và đổi mã tham gia.</div>
          </div>
        </GlassCard>

        <MyGroupInbox invitations={myInvitations} joinRequests={myJoinRequests} onInvitationAction={handleInvitationAction} />
      </div>

      <CreateGroupModal open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreate} />
      <JoinGroupModal open={openJoin} onClose={() => setOpenJoin(false)} onSubmit={handleJoin} />
    </div>
  );
}
