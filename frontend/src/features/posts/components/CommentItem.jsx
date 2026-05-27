function getCommentAuthor(c) {
  return (
    c?.author?.fullName ||
    c?.author?.username ||
    c?.author?.name ||
    c?.fullName ||
    c?.username ||
    c?.authorName ||
    "unknown"
  );
}

function getCommentTime(c) {
  return c?.time || c?.createdAt || "";
}

function getCommentText(c) {
  return c?.text || c?.content || "";
}

export default function CommentItem({ c }) {
  const author = getCommentAuthor(c);
  const time = getCommentTime(c);
  const text = getCommentText(c);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold">@{author}</div>
        <div className="text-xs text-slate-400">{time}</div>
      </div>
      <div className="mt-2 text-sm text-slate-200">{text}</div>
    </div>
  );
}