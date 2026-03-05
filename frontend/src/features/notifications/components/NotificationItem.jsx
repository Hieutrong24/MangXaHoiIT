// src/features/notifications/components/NotificationItem.jsx
export default function NotificationItem({ n }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
      <div className="text-sm font-bold">{n.title}</div>
      <div className="mt-1 text-sm text-slate-300">{n.body}</div>
      <div className="mt-2 text-xs text-slate-400">{n.time}</div>
    </div>
  );
}
