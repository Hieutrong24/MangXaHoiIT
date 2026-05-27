import { http } from '../../../services/http';

export const usersAdminApi = {
  async list(params) {
    const res = await http.get('/admin/users', { params });
    return res.data;
  },
  async get(userId) {
    const res = await http.get(`/admin/users/${encodeURIComponent(userId)}`);
    return res.data;
  },
  async lock(userId, body) {
    const res = await http.patch(`/admin/users/${encodeURIComponent(userId)}/lock`, body);
    return res.data;
  },
  async unlock(userId, body) {
    const res = await http.patch(`/admin/users/${encodeURIComponent(userId)}/unlock`, body);
    return res.data;
  },
  async remove(userId, body) {
    const res = await http.delete(`/admin/users/${encodeURIComponent(userId)}`, { data: body });
    return res.data;
  },
  async activityLogs(params) {
    const res = await http.get('/admin/users/activity-logs', { params });
    return res.data;
  },
  async activityDashboard(params) {
    const res = await http.get('/admin/users/activity-dashboard', { params });
    return res.data;
  },
};
