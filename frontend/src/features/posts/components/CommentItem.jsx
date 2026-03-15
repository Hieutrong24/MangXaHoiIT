// src/features/posts/components/CommentItem.jsx
export default function CommentItem({ c }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">@{c.author}</div>
        <div className="text-xs text-slate-400">{c.time}</div>
      </div>
      <div className="mt-2 text-sm text-slate-200">{c.text}</div>
    </div>
  );
}
