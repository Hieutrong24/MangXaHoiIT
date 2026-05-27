import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { Plus } from 'lucide-react';

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

export default function ChatInfoModal({
  open,
  room,
  members = [],
  onClose,
  onAddMembers,
  canManageMembers = false,
}) {
  const isGroup = room?.type === 'group';

  return (
    <Modal open={open} title={isGroup ? 'Thông tin nhóm chat' : 'Thông tin cuộc trò chuyện'} onClose={onClose}>
      {!room ? null : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="text-lg font-bold text-slate-50">{room.title || 'Phòng chat'}</div>
            <div className="mt-2 space-y-1 text-sm text-slate-300">
              <div>ID: {shortId(room.id)}</div>
              {isGroup ? <div>Thành viên: {room.memberCount || members.length}</div> : null}
              {room.secondaryText ? <div>{room.secondaryText}</div> : null}
              {room.description ? <div>Mô tả: {room.description}</div> : null}
              {room.email ? <div>Email: {room.email}</div> : null}
            </div>
          </div>

          {isGroup ? (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-100">Danh sách thành viên</div>
                {canManageMembers && (
                  <Button
                    onClick={onAddMembers}
                    className="!h-7 !rounded-lg !bg-cyan-500/15 !px-2 !py-1 !text-xs !text-cyan-300 !shadow-none hover:!bg-cyan-500/25"
                    title="Thêm thành viên"
                  >
                    <span className="flex items-center gap-1">
                      <Plus size={14} />
                      <span>Thêm</span>
                    </span>
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.userId} className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-100">{member.displayName}</div>
                        <div className="truncate text-xs text-slate-400">{member.email || shortId(member.userId)}</div>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[11px] font-semibold uppercase text-cyan-300">
                        {member.role || 'member'}
                      </span>
                    </div>
                  </div>
                ))}
                {members.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-4 text-sm text-slate-400">
                    Chưa có dữ liệu thành viên.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
