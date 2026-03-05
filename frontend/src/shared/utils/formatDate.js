// src/shared/utils/formatDate.js
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}
