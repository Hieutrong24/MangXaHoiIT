import { http } from '../../../services/http';

export const chatApi = {
  async listGroups() {
    const res = await http.get('/chats/groups');
    return res.data?.data ?? res.data;
  },

  async createGroup(body) {
    const res = await http.post('/chats/groups', body);
    return res.data?.data ?? res.data;
  },

  async getGroup(chatId) {
    const res = await http.get(`/chats/groups/${encodeURIComponent(chatId)}`);
    return res.data?.data ?? res.data;
  },

  async getGroupMembers(chatId) {
    const res = await http.get(`/chats/groups/${encodeURIComponent(chatId)}/members`);
    return res.data?.data ?? res.data;
  },

  async addGroupMembers(chatId, body) {
    const res = await http.post(`/chats/groups/${encodeURIComponent(chatId)}/members`, body);
    return res.data?.data ?? res.data;
  },

  async leaveGroup(chatId) {
    const res = await http.post(`/chats/groups/${encodeURIComponent(chatId)}/leave`, {});
    return res.data?.data ?? res.data;
  },

  async getMessages(chatId, params = {}) {
    const res = await http.get(`/chats/${encodeURIComponent(chatId)}/messages`, { params });
    return res.data?.data ?? res.data;
  },

  async sendMessage(chatId, body) {
    const res = await http.post(`/chats/${encodeURIComponent(chatId)}/messages`, body);
    return res.data?.data ?? res.data;
  },
};
