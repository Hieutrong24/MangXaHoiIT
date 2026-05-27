const FormData = require("form-data");

const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CONTENT_SERVICE_URL,
  serviceName: SERVICE_NAMES.CONTENT,
});

const contentClient = {
  async listPosts(query, ctx) {
    const res = await http.get("/api/posts", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async getFeed(query, ctx) {
    const res = await http.get("/api/feed", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async recommendPosts(query, ctx) {
    const res = await http.get("/api/posts/recommendations", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async search(query, ctx) {
    const res = await http.get("/api/search", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async trendingPosts(query, ctx) {
    const res = await http.get("/api/posts/trending", {
      params: query,
      __ctx: ctx,
    });
    return res.data;
  },

  async createPost(body, ctx) {
    const res = await http.post("/api/posts", body, {
      __ctx: ctx,
    });
    return res.data;
  },

  async getPostById(id, ctx) {
    const res = await http.get(`/api/posts/${encodeURIComponent(id)}`, {
      __ctx: ctx,
    });
    return res.data;
  },

  async toggleLike(postId, ctx) {
    const res = await http.post(
      `/api/posts/${encodeURIComponent(postId)}/like`,
      {},
      { __ctx: ctx }
    );
    return res.data;
  },

  async sharePost(postId, ctx) {
    const res = await http.post(
      `/api/posts/${encodeURIComponent(postId)}/share`,
      {},
      { __ctx: ctx }
    );
    return res.data;
  },

  async listComments(postId, query, ctx) {
    const res = await http.get(
      `/api/posts/${encodeURIComponent(postId)}/comments`,
      {
        params: query,
        __ctx: ctx,
      }
    );
    return res.data;
  },

  async createComment(postId, body, ctx) {
    const res = await http.post(
      `/api/posts/${encodeURIComponent(postId)}/comments`,
      body,
      { __ctx: ctx }
    );
    return res.data;
  },

  async listGroups(query, ctx) {
    const res = await http.get("/api/groups", { params: query, __ctx: ctx });
    return res.data;
  },

  async recommendGroups(query, ctx) {
    const res = await http.get("/api/groups/recommendations", { params: query, __ctx: ctx });
    return res.data;
  },

  async createGroup(body, ctx) {
    const res = await http.post("/api/groups", body, { __ctx: ctx });
    return res.data;
  },

  async joinGroupByCode(body, ctx) {
    const res = await http.post("/api/groups/join-by-code", body, { __ctx: ctx });
    return res.data;
  },

  async getGroupById(id, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async listGroupPosts(id, query, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(id)}/posts`, { params: query, __ctx: ctx });
    return res.data;
  },

  async createGroupPost(id, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(id)}/posts`, body, { __ctx: ctx });
    return res.data;
  },

  async approveGroupPost(groupId, postId, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/posts/${encodeURIComponent(postId)}/approve`, {}, { __ctx: ctx });
    return res.data;
  },

  async rejectGroupPost(groupId, postId, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/posts/${encodeURIComponent(postId)}/reject`, body, { __ctx: ctx });
    return res.data;
  },

  async listGroupMembers(id, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(id)}/members`, { __ctx: ctx });
    return res.data;
  },

  async getMemberGroupStatus(groupId, memberId, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/status`, { __ctx: ctx });
    return res.data;
  },

  async promoteGroupMember(groupId, memberId, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/promote`, body, { __ctx: ctx });
    return res.data;
  },

  async removeGroupMember(groupId, memberId, ctx) {
    const res = await http.delete(`/api/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`, { __ctx: ctx });
    return res.data;
  },

  async banGroupMember(groupId, memberId, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/ban`, {}, { __ctx: ctx });
    return res.data;
  },

  async unbanGroupMember(groupId, memberId, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}/unban`, {}, { __ctx: ctx });
    return res.data;
  },

  async updateGroup(id, body, ctx) {
    const res = await http.patch(`/api/groups/${encodeURIComponent(id)}`, body, { __ctx: ctx });
    return res.data;
  },

  async joinGroup(id, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(id)}/join`, body, { __ctx: ctx });
    return res.data;
  },

  async leaveGroup(id, ctx) {
    const res = await http.delete(`/api/groups/${encodeURIComponent(id)}/leave`, { __ctx: ctx });
    return res.data;
  },

  async deleteGroup(id, ctx) {
    const res = await http.delete(`/api/groups/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async getGroupStats(id, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(id)}/stats`, { __ctx: ctx });
    return res.data;
  },

  async listMyGroupInvitations(query, ctx) {
    const res = await http.get('/api/groups/invitations/me', { params: query, __ctx: ctx });
    return res.data;
  },

  async listMyGroupJoinRequests(query, ctx) {
    const res = await http.get('/api/groups/join-requests/me', { params: query, __ctx: ctx });
    return res.data;
  },

  async listGroupInvitations(groupId, query, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(groupId)}/invitations`, { params: query, __ctx: ctx });
    return res.data;
  },

  async inviteGroupMember(groupId, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/invitations`, body, { __ctx: ctx });
    return res.data;
  },

  async listGroupJoinRequests(groupId, query, ctx) {
    const res = await http.get(`/api/groups/${encodeURIComponent(groupId)}/join-requests`, { params: query, __ctx: ctx });
    return res.data;
  },

  async respondToGroupJoinRequest(groupId, requestId, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/join-requests/${encodeURIComponent(requestId)}/respond`, body, { __ctx: ctx });
    return res.data;
  },

  async respondToGroupInvitation(inviteId, body, ctx) {
    const res = await http.post(`/api/groups/invitations/${encodeURIComponent(inviteId)}/respond`, body, { __ctx: ctx });
    return res.data;
  },

  async transferGroupOwnership(groupId, body, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/transfer-ownership`, body, { __ctx: ctx });
    return res.data;
  },

  async regenerateGroupJoinCode(groupId, ctx) {
    const res = await http.post(`/api/groups/${encodeURIComponent(groupId)}/regenerate-join-code`, {}, { __ctx: ctx });
    return res.data;
  },

  async listJobs(query, ctx) {
    const res = await http.get("/api/jobs", { params: query, __ctx: ctx });
    return res.data;
  },

  async uploadToContentService(file, kind = "auto", ctx = {}) {
    if (!file) {
      throw new Error("Missing file");
    }

    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname || "upload.bin",
      contentType: file.mimetype || "application/octet-stream",
      knownLength: file.size,
    });
    form.append("kind", kind || "auto");

    const headers = {
      ...form.getHeaders(),
    };

    if (ctx?.authHeader) {
      headers.Authorization = ctx.authHeader;
    }

    if (ctx?.correlationId) {
      headers["x-correlation-id"] = ctx.correlationId;
    }

    if (ctx?.user?.id || ctx?.user?.userId || ctx?.user?._id) {
      headers["x-user-id"] = ctx.user.id || ctx.user.userId || ctx.user._id;
    }

    const res = await http.post("/api/uploads/cloudinary", form, {
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      __ctx: ctx,
    });

    return res.data;
  },

  async adminCreateJob(body, ctx) {
    const res = await http.post("/api/jobs", body, { __ctx: ctx });
    return res.data;
  },

  async adminUpdateJob(id, body, ctx) {
    const res = await http.patch(`/api/jobs/${encodeURIComponent(id)}`, body, { __ctx: ctx });
    return res.data;
  },

  async adminDeleteJob(id, ctx) {
    const res = await http.delete(`/api/jobs/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async adminGetJob(id, ctx) {
    const res = await http.get(`/api/jobs/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async adminListJobApplications(query, ctx) {
    const res = await http.get("/api/jobs/admin/applications", { params: query, __ctx: ctx });
    return res.data;
  },

  async adminUpdateApplicationStatus(applicationId, body, ctx) {
    const res = await http.patch(`/api/jobs/applications/${encodeURIComponent(applicationId)}`, { ...body, actorId: "system" }, { __ctx: ctx });
    return res.data;
  },

  async adminGetJobsDashboard(ctx) {
    const res = await http.get("/api/jobs/admin/dashboard", { __ctx: ctx });
    return res.data;
  },

  async adminGetContentDashboard(ctx) {
    const res = await http.get("/api/admin/dashboard", { __ctx: ctx });
    return res.data;
  },

  async adminListPosts(query = {}, ctx) {
    const res = await http.get("/api/admin/posts", { params: query, __ctx: ctx });
    return res.data;
  },

  async adminModeratePost(id, body, ctx) {
    const res = await http.patch(`/api/admin/posts/${encodeURIComponent(id)}/moderation`, body, { __ctx: ctx });
    return res.data;
  },

  async adminListComments(query = {}, ctx) {
    const res = await http.get("/api/admin/comments", { params: query, __ctx: ctx });
    return res.data;
  },

  async adminDeleteComment(id, ctx) {
    const res = await http.delete(`/api/admin/comments/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async adminListGroups(query = {}, ctx) {
    const res = await http.get("/api/admin/groups", { params: query, __ctx: ctx });
    return res.data;
  },

  async adminGetGroup(id, ctx) {
    const res = await http.get(`/api/admin/groups/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },

  async adminGetGroupStats(id, ctx) {
    const res = await http.get(`/api/admin/groups/${encodeURIComponent(id)}/stats`, { __ctx: ctx });
    return res.data;
  },

  async adminDeleteGroup(id, ctx) {
    const res = await http.delete(`/api/admin/groups/${encodeURIComponent(id)}`, { __ctx: ctx });
    return res.data;
  },
};

module.exports = { contentClient };
