export default function LoadingState({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="card loading-card">
      <div className="loader" />
      <span>{label}</span>
    </div>
  );
}
