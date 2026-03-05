import { http } from "../../../services/http";

export const friendsApi = {
  async listFriends(params = {}) {
    const res = await http.get("/users/friends", { params });
    return res.data?.data ?? res.data;
  },

  async listSuggestions(params = {}) {
    const res = await http.get("/users/friends/suggestions", { params });
    return res.data?.data ?? res.data;
  },

  // gửi lời mời
  async sendFriendRequest(toUserId, body = {}) {
    const res = await http.post(
      `/users/friend-requests/${encodeURIComponent(toUserId)}`,
      body // ✅ có thể { message: "..." } hoặc {}
    );
    return res.data?.data ?? res.data;
  },

  // incoming/outgoing
  async listIncomingRequests(params = {}) {
    const res = await http.get("/users/friend-requests/incoming", { params });
    return res.data?.data ?? res.data;
  },

  async listOutgoingRequests(params = {}) {
    const res = await http.get("/users/friend-requests/outgoing", { params });
    return res.data?.data ?? res.data;
  },

  // accept/reject/cancel
  async acceptFriendRequest(requestId) {
    const res = await http.post(`/users/friend-requests/${encodeURIComponent(requestId)}/accept`, {});
    return res.data?.data ?? res.data;
  },

  async rejectFriendRequest(requestId) {
    const res = await http.post(`/users/friend-requests/${encodeURIComponent(requestId)}/reject`, {});
    return res.data?.data ?? res.data;
  },

  async cancelFriendRequest(requestId) {
    const res = await http.post(`/users/friend-requests/${encodeURIComponent(requestId)}/cancel`, {});
    return res.data?.data ?? res.data;
  },

  async listAllUsers(params = {}) {
    const res = await http.get("/users", { params });
    return res.data?.data ?? res.data;
  },
};