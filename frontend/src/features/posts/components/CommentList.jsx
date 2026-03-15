// src/features/posts/components/CommentList.jsx
import CommentItem from "./CommentItem";

export default function CommentList({ comments = [] }) {
  return (
    <div className="grid gap-2">
      {comments.length === 0 ? (
        <div className="text-sm text-slate-400">Chưa có bình luận.</div>
      ) : (
        comments.map((c) => <CommentItem key={c.id} c={c} />)
      )}
    </div>
  );
}
