import { http } from "../../../services/http";
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

function getUserId() {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("uid") ||
    localStorage.getItem("currentUserId") ||
    JSON.parse(localStorage.getItem("user") || "null")?.id ||
    JSON.parse(localStorage.getItem("user") || "null")?._id ||
    ""
  );
}

export const communityApi = {
  listGroups(params = {}) { return http.get('/content/groups', { params }).then(unwrap); },
  recommendGroups(params = {}) {
    const userId = getUserId();
    return http.get('/content/groups/recommendations', {
      params,
      headers: userId ? { 'x-user-id': userId } : {},
    }).then(unwrap);
  },
  getGroup(id) { return http.get(`/content/groups/${encodeURIComponent(id)}`).then(unwrap); },
  createGroup(payload) { return http.post('/content/groups', payload).then(unwrap); },
  updateGroup(id, payload) { return http.patch(`/content/groups/${encodeURIComponent(id)}`, payload).then(unwrap); },
  joinGroup(id, payload = {}) { return http.post(`/content/groups/${encodeURIComponent(id)}/join`, payload).then(unwrap); },
  leaveGroup(id) { return http.delete(`/content/groups/${encodeURIComponent(id)}/leave`).then(unwrap); },
  deleteGroup(id) { return http.delete(`/content/groups/${encodeURIComponent(id)}`).then(unwrap); },
  joinByCode(code) { return http.post('/content/groups/join-by-code', { code }).then(unwrap); },
  getGroupStats(id) { return http.get(`/content/groups/${encodeURIComponent(id)}/stats`).then(unwrap); },
  regenerateJoinCode(id) { return http.post(`/content/groups/${encodeURIComponent(id)}/regenerate-join-code`, {}).then(unwrap); },
  transferOwnership(id, payload) { return http.post(`/content/groups/${encodeURIComponent(id)}/transfer-ownership`, payload).then(unwrap); },

  // Members
  listMembers(groupId, params = {}) { return http.get(`/content/groups/${encodeURIComponent(groupId)}/members`, { params }).then(unwrap); },
  getMemberStatus(groupId, memberId) { return http.get(`/content/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/status`).then(unwrap); },
  inviteMember(groupId, payload) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/invitations`, payload).then(unwrap); },
  promoteMember(groupId, memberId, payload) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/promote`, payload).then(unwrap); },
  removeMember(groupId, memberId) { return http.delete(`/content/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`).then(unwrap); },
  banMember(groupId, memberId) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/ban`, {}).then(unwrap); },
  unbanMember(groupId, memberId) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/unban`, {}).then(unwrap); },

  // Invitations
  listMyInvitations(params = {}) { return http.get('/content/groups/invitations/me', { params }).then(unwrap); },
  listGroupInvitations(groupId, params = {}) { return http.get(`/content/groups/${encodeURIComponent(groupId)}/invitations`, { params }).then(unwrap); },
  respondToInvitation(inviteId, action) { return http.post(`/content/groups/invitations/${encodeURIComponent(inviteId)}/respond`, { action }).then(unwrap); },

  // Join requests
  listMyJoinRequests(params = {}) { return http.get('/content/groups/join-requests/me', { params }).then(unwrap); },
  listGroupJoinRequests(groupId, params = {}) { return http.get(`/content/groups/${encodeURIComponent(groupId)}/join-requests`, { params }).then(unwrap); },
  respondToJoinRequest(groupId, requestId, action) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/join-requests/${encodeURIComponent(requestId)}/respond`, { action }).then(unwrap); },

  // Posts
  listGroupPosts(id, params = {}) { return http.get(`/content/groups/${encodeURIComponent(id)}/posts`, { params }).then(unwrap); },
  createGroupPost(id, payload) { return http.post(`/content/groups/${encodeURIComponent(id)}/posts`, payload).then(unwrap); },
  approvePost(groupId, postId) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/posts/${encodeURIComponent(postId)}/approve`, {}).then(unwrap); },
  rejectPost(groupId, postId, payload) { return http.post(`/content/groups/${encodeURIComponent(groupId)}/posts/${encodeURIComponent(postId)}/reject`, payload).then(unwrap); },
};
