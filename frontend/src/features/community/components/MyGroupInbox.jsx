import Button from '../../../shared/components/Button';
import GlassCard from '../../../shared/components/GlassCard';

export default function MyGroupInbox({ invitations = [], joinRequests = [], onInvitationAction }) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="mb-3 text-base font-bold text-white">Lời mời của tôi</div>
        {invitations.length === 0 ? (
          <div className="text-sm text-slate-400">Không có lời mời đang chờ.</div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invite) => {
              const inviteId = invite._id || invite.id;
              return (
                <div key={inviteId} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <div className="text-sm font-semibold text-white">{invite.group?.name || 'Nhóm'}</div>
                  <div className="mt-1 text-xs text-slate-400">Vai trò được mời: {invite.role || 'member'}</div>
                  {invite.status === 'pending' ? (
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" onClick={() => onInvitationAction?.(inviteId, 'reject')}>Từ chối</Button>
                      <Button onClick={() => onInvitationAction?.(inviteId, 'accept')}>Chấp nhận</Button>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-500">Đã xử lý: {invite.status}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <div className="mb-3 text-base font-bold text-white">Yêu cầu tham gia của tôi</div>
        {joinRequests.length === 0 ? (
          <div className="text-sm text-slate-400">Bạn chưa gửi yêu cầu nào.</div>
        ) : (
          <div className="space-y-3">
            {joinRequests.map((request) => (
              <div key={request._id || request.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="text-sm font-semibold text-white">{request.group?.name || 'Nhóm'}</div>
                <div className="mt-1 text-xs text-slate-400">Trạng thái: {request.status || 'pending'}</div>
                {request.note ? <div className="mt-2 text-sm text-slate-300">{request.note}</div> : null}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
