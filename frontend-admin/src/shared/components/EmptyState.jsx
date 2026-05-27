export default function EmptyState({ title = 'Không có dữ liệu', description = 'Hiện chưa có bản ghi phù hợp.' }) {
  return (
    <div className="card empty-state">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
    </div>
  );
}
