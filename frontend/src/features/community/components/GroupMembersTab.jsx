import { useMemo } from 'react';
import Button from '../../../shared/components/Button';
import { Crown, Shield, Trash2, Ban, UserCheck, ArrowUpCircle } from 'lucide-react';

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 5)}…${s.slice(-4)}` : s;
}

const roleColors = {
  owner: { bg: 'bg-amber-500/15', text: 'text-amber-300', icon: Crown },
  admin: { bg: 'bg-blue-500/15', text: 'text-blue-300', icon: Shield },
  moderator: { bg: 'bg-violet-500/15', text: 'text-violet-300', icon: Shield },
  member: { bg: 'bg-slate-500/15', text: 'text-slate-300', icon: null },
};

const roleLabel = {
  owner: 'Chủ',
  admin: 'Admin',
  moderator: 'Điều phối',
  member: 'Thành viên',
};

export default function GroupMembersTab({
  group = {},
  members = [],
  isManager = false,
  isOwner = false,
  currentUserId = null,
  onPromote,
  onRemove,
  onBan,
  onUnban,
  onTransferOwnership,
}) {
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
      const statusOrder = { active: 0, banned: 1 };
      const roleCompare = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
      if (roleCompare !== 0) return roleCompare;
      return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    });
  }, [members]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-white">Thành viên ({sortedMembers.length})</div>
      </div>

      <div className="space-y-2">
        {sortedMembers.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
            Chưa có thành viên
          </div>
        ) : (
          sortedMembers.map((member) => {
            const role = member.role || 'member';
            const color = roleColors[role] || roleColors.member;
            const Icon = color.icon;
            const isCurrentUser = String(member.userId) === String(currentUserId);
            const memberIsOwner = role === 'owner';
            const memberIsBanned = String(member.status || 'active') === 'banned';
            const canManageThisMember = isManager && !memberIsOwner && !isCurrentUser;

            return (
              <div
                key={member.userId}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        {member.displayName || `User ${shortId(member.userId)}`}
                      </div>
                      {isCurrentUser && (
                        <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[11px] text-cyan-300">
                          Bạn
                        </span>
                      )}
                      {memberIsBanned && (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] text-red-300">
                          Đã ban
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-400">
                      {member.email || shortId(member.userId)}
                    </div>
                  </div>

                  <span className={`${color.bg} ${color.text} inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold`}>
                    {Icon && <Icon size={14} />}
                    {roleLabel[role] || role}
                  </span>
                </div>

                {canManageThisMember && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!memberIsBanned && role !== 'admin' && (
                      <Button
                        onClick={() => onPromote?.(member.userId, 'admin')}
                        className="!h-8 !rounded-lg !bg-blue-500/15 !px-3 !py-1 !text-xs !text-blue-300 !shadow-none hover:!bg-blue-500/25"
                      >
                        Admin
                      </Button>
                    )}
                    {!memberIsBanned && role !== 'moderator' && (
                      <Button
                        onClick={() => onPromote?.(member.userId, 'moderator')}
                        className="!h-8 !rounded-lg !bg-violet-500/15 !px-3 !py-1 !text-xs !text-violet-300 !shadow-none hover:!bg-violet-500/25"
                      >
                        Điều phối
                      </Button>
                    )}
                    {!memberIsBanned && role !== 'member' && (
                      <Button
                        onClick={() => onPromote?.(member.userId, 'member')}
                        className="!h-8 !rounded-lg !bg-slate-500/15 !px-3 !py-1 !text-xs !text-slate-300 !shadow-none hover:!bg-slate-500/25"
                      >
                        Về thành viên
                      </Button>
                    )}
                    {!memberIsBanned ? (
                      <Button
                        onClick={() => onBan?.(member.userId)}
                        className="!h-8 !rounded-lg !bg-red-500/15 !px-3 !py-1 !text-xs !text-red-300 !shadow-none hover:!bg-red-500/25"
                        title="Ban khỏi nhóm"
                      >
                        <Ban size={14} /> Ban
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onUnban?.(member.userId)}
                        className="!h-8 !rounded-lg !bg-emerald-500/15 !px-3 !py-1 !text-xs !text-emerald-300 !shadow-none hover:!bg-emerald-500/25"
                        title="Hủy ban"
                      >
                        <UserCheck size={14} /> Hủy ban
                      </Button>
                    )}
                    {isOwner && !memberIsBanned && (
                      <Button
                        onClick={() => onTransferOwnership?.(member.userId)}
                        className="!h-8 !rounded-lg !bg-amber-500/15 !px-3 !py-1 !text-xs !text-amber-300 !shadow-none hover:!bg-amber-500/25"
                        title="Chuyển quyền chủ nhóm"
                      >
                        <ArrowUpCircle size={14} /> Chuyển chủ
                      </Button>
                    )}
                    <Button
                      onClick={() => onRemove?.(member.userId)}
                      className="!h-8 !rounded-lg !bg-red-500/15 !px-3 !py-1 !text-xs !text-red-300 !shadow-none hover:!bg-red-500/25"
                      title="Xóa khỏi nhóm"
                    >
                      <Trash2 size={14} /> Xóa
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
