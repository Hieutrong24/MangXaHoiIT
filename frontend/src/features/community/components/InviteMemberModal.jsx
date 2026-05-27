import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';

function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  const a = parts[0]?.[0] || 'U';
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (a + b).toUpperCase();
}

export default function InviteMemberModal({
  open,
  friends = [],
  existingMembers = [],
  onClose,
  onSubmit,
  loading = false,
}) {
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!open) {
      setKeyword('');
      setSelectedIds([]);
    }
  }, [open]);

  const existingMemberIds = useMemo(() => {
    return new Set(
      existingMembers
        .map((member) => String(member?.userId || ''))
        .filter(Boolean)
    );
  }, [existingMembers]);

  const availableFriends = useMemo(() => {
    return friends.filter((friend) => {
      const userId = String(friend?.userId || friend?.id || friend?._id || '');
      return !existingMemberIds.has(userId);
    });
  }, [friends, existingMemberIds]);

  const filteredFriends = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return availableFriends;
    return availableFriends.filter((friend) => {
      const nameText = String(friend?.fullName || friend?.username || '').toLowerCase();
      const emailText = String(friend?.email || '').toLowerCase();
      return nameText.includes(q) || emailText.includes(q);
    });
  }, [availableFriends, keyword]);

  function toggleUser(userId) {
    setSelectedIds((prev) => {
      const id = String(userId);
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (selectedIds.length === 0) {
      alert('Hãy chọn ít nhất 1 người bạn để mời vào nhóm.');
      return;
    }
    onSubmit?.(selectedIds);
  }

  return (
    <Modal
      open={open}
      title="Mời thành viên vào nhóm"
      onClose={loading ? undefined : onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-100">
              Chọn bạn bè để mời
            </div>
            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Đã chọn {selectedIds.length}
            </div>
          </div>

          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm trong danh sách bạn bè..."
          />

          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/50 p-2">
            {filteredFriends.length === 0 ? (
              <div className="rounded-xl bg-slate-900/60 px-3 py-4 text-center text-sm text-slate-400">
                {availableFriends.length === 0
                  ? 'Tất cả bạn bè đã là thành viên'
                  : 'Không có bạn bè phù hợp'}
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const userId = String(friend?.userId || friend?.id || friend?._id || '');
                const checked = selectedIds.includes(userId);
                const label = friend?.fullName || friend?.username || 'Người dùng';
                const email = friend?.email || '';

                return (
                  <label
                    key={userId}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition',
                      checked
                        ? 'border-cyan-400/40 bg-cyan-400/10'
                        : 'border-white/10 bg-slate-900/50 hover:border-white/15 hover:bg-slate-900/80',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-cyan-400"
                      checked={checked}
                      onChange={() => toggleUser(userId)}
                    />
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-sm font-semibold text-slate-100">
                      {initials(label)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        {label}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        {email || userId}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading || selectedIds.length === 0}>
            {loading ? 'Đang mời...' : 'Mời thành viên'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
