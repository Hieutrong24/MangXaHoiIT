// src/features/notifications/api/notifications.api.js
import { http } from "../../../services/http";

export const notificationsApi = {
  async list(params = {}) {
    const res = await http.get("/notifications", { params });
    return res.data;
  },
  async markRead(id) {
    const res = await http.post(`/notifications/${encodeURIComponent(id)}/read`);
    return res.data;
  },
};
