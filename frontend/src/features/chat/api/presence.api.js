import { http } from '../../../services/http';

function normalizeItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function normalizeItem(payload) {
  return payload?.item || payload?.data?.item || null;
}

export const presenceApi = {
  async get(userId) {
    const res = await http.get(`/chats/presence/${encodeURIComponent(userId)}`);
    return normalizeItem(res.data);
  },

  async query(userIds = []) {
    const res = await http.post('/chats/presence/query', { userIds });
    return normalizeItems(res.data);
  },
};
