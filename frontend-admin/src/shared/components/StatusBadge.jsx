const labels = {
  active: 'Đang hoạt động',
  locked: 'Bị khóa',
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
  accepted: 'Đã chấp nhận',
  queued: 'Đang chờ',
  running: 'Đang chạy',
  reviewing: 'Đang duyệt',
  shortlisted: 'Vào danh sách ngắn',
  rejected: 'Từ chối',
  hired: 'Đã tuyển',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
  hidden: 'Ẩn',
  sample: 'Mẫu',
  inactive: 'Ngưng hoạt động',
  public: 'Công khai',
  private: 'Riêng tư',
  delivered: 'Đã gửi',
  failed: 'Thất bại',
  partial: 'Một phần',
  deleted: 'Đã xóa',
  unknown: 'Không xác định',
};

export default function StatusBadge({ value }) {
  const normalized = String(value || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return <span className={`badge badge-${normalized}`}>{labels[normalized] || value || labels.unknown}</span>;
}
