import { http } from "../../../services/http";

export const chatApi = {
  async getMessages(chatId, params = {}) {
    const res = await http.get(
      `/chats/${encodeURIComponent(chatId)}/messages`,
      { params }
    );
    return res.data?.data ?? res.data;
  },

  async sendMessage(chatId, body) {
    const res = await http.post(
      `/chats/${encodeURIComponent(chatId)}/messages`,
      body
    );
    return res.data?.data ?? res.data;
  },
};