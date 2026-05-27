import { http } from '../../services/http';

export const securityAdminApi = {
  async listAccounts(params) {
    const res = await http.get('/admin/auth/accounts', { params });
    return res.data;
  },
  async getAccount(userId) {
    const res = await http.get(`/admin/auth/accounts/${encodeURIComponent(userId)}`);
    return res.data;
  },
  async lockAccount(userId, body) {
    const res = await http.patch(`/admin/users/${encodeURIComponent(userId)}/lock`, body);
    return res.data;
  },
  async unlockAccount(userId, body) {
    const res = await http.patch(`/admin/users/${encodeURIComponent(userId)}/unlock`, body);
    return res.data;
  },
  async updateRoles(userId, body) {
    const res = await http.put(`/admin/auth/accounts/${encodeURIComponent(userId)}/roles`, body);
    return res.data;
  },
  async listAuditLogs(params) {
    const res = await http.get('/admin/auth/audit-logs', { params });
    return res.data;
  },
};

export const contentAdminApi = {
  async dashboard() {
    const res = await http.get('/admin/content/dashboard');
    return res.data;
  },
  async listPosts(params) {
    const res = await http.get('/admin/content/posts', { params });
    return res.data;
  },
  async moderatePost(postId, body) {
    const res = await http.patch(`/admin/content/posts/${encodeURIComponent(postId)}/moderation`, body);
    return res.data;
  },
  async listComments(params) {
    const res = await http.get('/admin/content/comments', { params });
    return res.data;
  },
  async deleteComment(commentId) {
    const res = await http.delete(`/admin/content/comments/${encodeURIComponent(commentId)}`);
    return res.data;
  },
  async listGroups(params) {
    const res = await http.get('/admin/content/groups', { params });
    return res.data;
  },
  async getGroup(groupId) {
    const res = await http.get(`/admin/content/groups/${encodeURIComponent(groupId)}`);
    return res.data;
  },
  async getGroupStats(groupId) {
    const res = await http.get(`/admin/content/groups/${encodeURIComponent(groupId)}/stats`);
    return res.data;
  },
  async deleteGroup(groupId) {
    const res = await http.delete(`/admin/content/groups/${encodeURIComponent(groupId)}`);
    return res.data;
  },
};

export const communicationAdminApi = {
  async chatDashboard() {
    const res = await http.get('/admin/chat/dashboard');
    return res.data;
  },
  async listChatGroups(params) {
    const res = await http.get('/admin/chat/groups', { params });
    return res.data;
  },
  async getChatGroup(chatId) {
    const res = await http.get(`/admin/chat/groups/${encodeURIComponent(chatId)}`);
    return res.data;
  },
  async listChatMessages(chatId, params) {
    const res = await http.get(`/admin/chat/groups/${encodeURIComponent(chatId)}/messages`, { params });
    return res.data;
  },
  async deleteChatGroup(chatId) {
    const res = await http.delete(`/admin/chat/groups/${encodeURIComponent(chatId)}`);
    return res.data;
  },
  async deleteChatMessage(messageId) {
    const res = await http.delete(`/admin/chat/messages/${encodeURIComponent(messageId)}`);
    return res.data;
  },
  async notificationsDashboard() {
    const res = await http.get('/admin/notifications/dashboard');
    return res.data;
  },
  async listNotifications(params) {
    const res = await http.get('/admin/notifications', { params });
    return res.data;
  },
  async broadcastNotification(body) {
    const res = await http.post('/admin/notifications/broadcast', body);
    return res.data;
  },
};

export const learningAdminApi = {
  async dashboard() {
    const res = await http.get('/admin/learning/dashboard');
    return res.data;
  },
  async listPaths(params) {
    const res = await http.get('/admin/learning/paths', { params });
    return res.data;
  },
  async listLessons(params) {
    const res = await http.get('/admin/learning/lessons', { params });
    return res.data;
  },
  async listQuizzes(params) {
    const res = await http.get('/admin/learning/quizzes', { params });
    return res.data;
  },
  async listChallenges(params) {
    const res = await http.get('/admin/learning/challenges', { params });
    return res.data;
  },
  async listBadges(params) {
    const res = await http.get('/admin/learning/badges', { params });
    return res.data;
  },
};
