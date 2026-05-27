import Button from '../../../shared/components/Button';
import GlassCard from '../../../shared/components/GlassCard';

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 5)}…${s.slice(-4)}` : s;
}

export default function GroupRequestsPanel({
  title,
  items = [],
  emptyText,
  itemLabel,
  onApprove,
  onReject,
  loadingMap = {},
}) {
  return (
    <div className="space-y-3">
      <div className="text-lg font-bold text-white">{title}</div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        items.map((item) => {
          const itemId = item._id || item.id;
          return (
            <GlassCard key={itemId} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{itemLabel(item)}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Trạng thái: {item.status || 'pending'}
                  </div>
                  {item.note ? <div className="mt-2 text-sm text-slate-300">{item.note}</div> : null}
                </div>
                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onReject?.(itemId)}
                      disabled={loadingMap[itemId]}
                      className="!h-8 !rounded-lg !bg-red-500/15 !px-3 !py-1 !text-xs !text-red-300 !shadow-none hover:!bg-red-500/25"
                    >
                      Từ chối
                    </Button>
                    <Button onClick={() => onApprove?.(itemId)} disabled={loadingMap[itemId]}>
                      Duyệt
                    </Button>
                  </div>
                )}
              </div>
              {item.userId ? (
                <div className="mt-2 text-xs text-slate-500">User: {shortId(item.userId)}</div>
              ) : null}
              {item.recipientId ? (
                <div className="mt-2 text-xs text-slate-500">Người nhận: {shortId(item.recipientId)}</div>
              ) : null}
            </GlassCard>
          );
        })
      )}
    </div>
  );
}
