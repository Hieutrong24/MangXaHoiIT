import { useState } from 'react';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import { Check, X } from 'lucide-react';

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 5)}…${s.slice(-4)}` : s;
}

function normalizeModerationStatus(status) {
  return String(status || '').trim().toLowerCase();
}

export default function ModerationPanel({
  posts = [],
  isManager = false,
  onApprove,
  onReject,
}) {
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectForm, setShowRejectForm] = useState({});
  const [loading, setLoading] = useState({});

  const pendingPosts = posts.filter((p) => normalizeModerationStatus(p.moderationStatus) === 'pending');

  async function handleApprove(postId) {
    if (!onApprove) return;
    try {
      setLoading((prev) => ({ ...prev, [postId]: true }));
      await onApprove(postId);
    } finally {
      setLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function handleReject(postId) {
    if (!onReject) return;
    try {
      setLoading((prev) => ({ ...prev, [postId]: true }));
      await onReject(postId, { reason: rejectReason[postId] || 'Bài viết không phù hợp' });
      setRejectReason((prev) => ({ ...prev, [postId]: '' }));
      setShowRejectForm((prev) => ({ ...prev, [postId]: false }));
    } finally {
      setLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

  if (!isManager) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
        Bạn không có quyền duyệt bài viết
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-white">
          Bài viết chờ duyệt ({pendingPosts.length})
        </div>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
          Không có bài viết nào chờ duyệt
        </div>
      ) : (
        <div className="space-y-3">
          {pendingPosts.map((post) => (
            <div
              key={post._id || post.id}
              className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
            >
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{post.title}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Tác giả: {shortId(post.authorId)} • Loại: {post.postType || 'post'}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-800/50 p-3 text-sm text-slate-300">
                  <div className="line-clamp-3">{post.content}</div>
                </div>

                {showRejectForm[post._id || post.id] ? (
                  <div className="space-y-2 rounded-lg bg-red-500/10 p-3">
                    <textarea
                      value={rejectReason[post._id || post.id] || ''}
                      onChange={(e) => setRejectReason((prev) => ({ ...prev, [post._id || post.id]: e.target.value }))}
                      placeholder="Lý do từ chối bài viết..."
                      rows={2}
                      className="w-full rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setShowRejectForm((prev) => ({ ...prev, [post._id || post.id]: false }))}
                        variant="ghost"
                        className="!h-8 !px-3 !text-xs"
                        disabled={loading[post._id || post.id]}
                      >
                        Huỷ
                      </Button>
                      <Button
                        onClick={() => handleReject(post._id || post.id)}
                        className="!h-8 !rounded-lg !bg-red-500/20 !px-3 !text-xs !text-red-300 !shadow-none hover:!bg-red-500/30"
                        disabled={loading[post._id || post.id]}
                      >
                        {loading[post._id || post.id] ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(post._id || post.id)}
                      className="flex-1 !h-8 !rounded-lg !bg-green-500/20 !px-3 !text-xs !text-green-300 !shadow-none hover:!bg-green-500/30"
                      disabled={loading[post._id || post.id]}
                    >
                      <Check size={14} />
                      {loading[post._id || post.id] ? 'Đang xử lý...' : 'Phê duyệt'}
                    </Button>
                    <Button
                      onClick={() => setShowRejectForm((prev) => ({ ...prev, [post._id || post.id]: true }))}
                      className="flex-1 !h-8 !rounded-lg !bg-red-500/20 !px-3 !text-xs !text-red-300 !shadow-none hover:!bg-red-500/30"
                      disabled={loading[post._id || post.id]}
                    >
                      <X size={14} />
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
