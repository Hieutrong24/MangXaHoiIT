import { http } from '../../../services/http';

function unwrap(payload) {
  return payload?.data ?? payload;
}

export const notificationsApi = {
  async list(params = {}) {
    const res = await http.get('/notifications', { params });
    return unwrap(res.data);
  },

  async unreadCount() {
    const res = await http.get('/notifications/unread-count');
    return unwrap(res.data);
  },

  async markRead(id) {
    const res = await http.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return unwrap(res.data);
  },

  async markAllRead() {
    const res = await http.patch('/notifications/read-all');
    return unwrap(res.data);
  },

  async remove(id) {
    const res = await http.delete(`/notifications/${encodeURIComponent(id)}`);
    return unwrap(res.data);
  },

  async getPreferences() {
    const res = await http.get('/notifications/preferences/me');
    return unwrap(res.data);
  },

  async updatePreferences(payload) {
    const res = await http.put('/notifications/preferences/me', payload);
    return unwrap(res.data);
  },
};
