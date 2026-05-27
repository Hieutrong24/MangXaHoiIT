const { contentClient } = require("../clients/content.client");
const { userClient } = require("../clients/user.client");
const { notificationClient } = require('../clients/notification.client');
const { buildCommentEvent, buildShareEvent } = require('../utils/socialEvent.helper');

function ctxFromReq(req) {
  const rawAuthHeader = req.headers?.authorization || req.headers?.Authorization || null;
  const rawUserId = req.headers?.["x-user-id"] || req.headers?.["X-User-Id"] || null;
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader || rawAuthHeader,
    user: req.user,
    xUserId: req.user?.id || req.user?.userId || rawUserId || null,
  };
}

async function publishBestEffort(eventName, payload, ctx) {
  if (!eventName || !payload?.recipientId || !payload?.actorId) return;
  try {
    await notificationClient.publishEvent(eventName, payload, ctx);
  } catch (error) {
    console.warn('[content.controller] publishBestEffort warning:', error.message);
  }
}

function itemsOf(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function userIdOf(item) {
  return item?.userId || item?.id || item?._id || item?.UserId || null;
}

function compactCsv(values) {
  return [...new Set(values.map((x) => String(x || "").trim()).filter(Boolean))].join(",");
}

async function buildSocialRankingContext(ctx) {
  const viewerId = ctx?.xUserId || ctx?.user?.id || ctx?.user?.userId || null;
  if (!viewerId) return {};

  const out = { viewerId };

  try {
    const [friends, profile] = await Promise.all([
      userClient.listFriends({ page: 1, pageSize: 100 }, ctx).catch(() => null),
      userClient.getProfileFull(viewerId, ctx).catch(() => null),
    ]);

    const friendIds = itemsOf(friends).map(userIdOf).filter(Boolean);
    out.friendIds = compactCsv(friendIds);
    out.followingIds = out.friendIds;

    const interests = [
      profile?.major,
      profile?.className,
      profile?.department,
      ...(Array.isArray(profile?.tags) ? profile.tags : []),
    ].filter(Boolean);

    out.interests = compactCsv(interests);
    out.major = profile?.major || "";
    out.className = profile?.className || "";
    out.department = profile?.department || "";
  } catch (error) {
    console.warn("[content.controller] ranking context warning:", error.message);
  }

  return out;
}

const contentController = {
  async listPosts(req, res, next) {
    try { const data = await contentClient.listPosts(req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async getFeed(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const rankingContext = await buildSocialRankingContext(ctx);
      const data = await contentClient.getFeed({ ...req.query, ...rankingContext }, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    }
    catch (e) { next(e); }
  },
  async recommendPosts(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const rankingContext = await buildSocialRankingContext(ctx);
      const data = await contentClient.recommendPosts({ ...req.query, ...rankingContext }, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async search(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const rankingContext = await buildSocialRankingContext(ctx);
      const data = await contentClient.search({ ...req.query, ...rankingContext }, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async trendingPosts(req, res, next) {
    try {
      const data = await contentClient.trendingPosts(req.query, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async createPost(req, res, next) {
    try { const data = await contentClient.createPost(req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async getPostById(req, res, next) {
    try { const data = await contentClient.getPostById(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async toggleLike(req, res, next) {
    try { const data = await contentClient.toggleLike(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async sharePost(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const data = await contentClient.sharePost(req.params.id, ctx);
      const event = buildShareEvent({ upstreamData: data, req });
      await publishBestEffort(event.eventName, event.payload, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listComments(req, res, next) {
    try { const data = await contentClient.listComments(req.params.id, req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async createComment(req, res, next) {
    try {
      const authorId = req.user?.id || req.user?.userId || req.user?._id || req.body.authorId;
      const ctx = ctxFromReq(req);
      const data = await contentClient.createComment(req.params.id, { ...req.body, authorId }, ctx);
      const event = buildCommentEvent({ upstreamData: data, req });
      await publishBestEffort(event.eventName, event.payload, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async listGroups(req, res, next) {
    try { const data = await contentClient.listGroups(req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async recommendGroups(req, res, next) {
    try {
      const ctx = ctxFromReq(req);
      const rankingContext = await buildSocialRankingContext(ctx);
      const data = await contentClient.recommendGroups({ ...req.query, ...rankingContext }, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) { next(e); }
  },
  async createGroup(req, res, next) {
    try { const data = await contentClient.createGroup(req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async joinGroupByCode(req, res, next) {
    try { const data = await contentClient.joinGroupByCode(req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async getGroupById(req, res, next) {
    try { const data = await contentClient.getGroupById(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listGroupPosts(req, res, next) {
    try { const data = await contentClient.listGroupPosts(req.params.id, req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async createGroupPost(req, res, next) {
    try { const data = await contentClient.createGroupPost(req.params.id, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async approveGroupPost(req, res, next) {
    try { const data = await contentClient.approveGroupPost(req.params.id, req.params.postId, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async rejectGroupPost(req, res, next) {
    try { const data = await contentClient.rejectGroupPost(req.params.id, req.params.postId, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listGroupMembers(req, res, next) {
    try { const data = await contentClient.listGroupMembers(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async getMemberGroupStatus(req, res, next) {
    try { const data = await contentClient.getMemberGroupStatus(req.params.id, req.params.memberId, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async promoteGroupMember(req, res, next) {
    try { const data = await contentClient.promoteGroupMember(req.params.id, req.params.memberId, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async removeGroupMember(req, res, next) {
    try { const data = await contentClient.removeGroupMember(req.params.id, req.params.memberId, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async banGroupMember(req, res, next) {
    try { const data = await contentClient.banGroupMember(req.params.id, req.params.memberId, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async unbanGroupMember(req, res, next) {
    try { const data = await contentClient.unbanGroupMember(req.params.id, req.params.memberId, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async updateGroup(req, res, next) {
    try { const data = await contentClient.updateGroup(req.params.id, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async joinGroup(req, res, next) {
    try { const data = await contentClient.joinGroup(req.params.id, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async leaveGroup(req, res, next) {
    try { const data = await contentClient.leaveGroup(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async deleteGroup(req, res, next) {
    try { const data = await contentClient.deleteGroup(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async getGroupStats(req, res, next) {
    try { const data = await contentClient.getGroupStats(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listMyGroupInvitations(req, res, next) {
    try { const data = await contentClient.listMyGroupInvitations(req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listMyGroupJoinRequests(req, res, next) {
    try { const data = await contentClient.listMyGroupJoinRequests(req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listGroupInvitations(req, res, next) {
    try { const data = await contentClient.listGroupInvitations(req.params.id, req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async inviteGroupMember(req, res, next) {
    try { const data = await contentClient.inviteGroupMember(req.params.id, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listGroupJoinRequests(req, res, next) {
    try { const data = await contentClient.listGroupJoinRequests(req.params.id, req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async respondToGroupJoinRequest(req, res, next) {
    try { const data = await contentClient.respondToGroupJoinRequest(req.params.id, req.params.requestId, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async respondToGroupInvitation(req, res, next) {
    try { const data = await contentClient.respondToGroupInvitation(req.params.inviteId, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async transferGroupOwnership(req, res, next) {
    try { const data = await contentClient.transferGroupOwnership(req.params.id, req.body, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async regenerateGroupJoinCode(req, res, next) {
    try { const data = await contentClient.regenerateGroupJoinCode(req.params.id, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
  async listJobs(req, res, next) {
    try { const data = await contentClient.listJobs(req.query, ctxFromReq(req)); res.json({ success: true, data, correlationId: req.correlationId }); }
    catch (e) { next(e); }
  },
};

module.exports = { contentController };
