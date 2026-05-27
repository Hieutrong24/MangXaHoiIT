function createAdminController({ postService, commentService, groupService }) {
  return {
    async listPosts(req, res) {
      try {
        const data = await postService.adminListPosts(req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_LIST_POSTS_FAILED" });
      }
    },
    async moderatePost(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId || "admin";
        const current = await postService.getPost(req.params.id);
        if (!current) return res.status(404).json({ error: "NOT_FOUND" });

        const status = String(req.body.moderationStatus || "").toLowerCase();
        if (!["approved", "rejected", "pending"].includes(status)) {
          return res.status(400).json({ error: "moderationStatus invalid" });
        }
        if (current.groupId && status === "pending") {
          return res.status(400).json({ error: "group posts only support approved or rejected" });
        }
        const data = current.groupId
          ? await groupService.adminModerateGroupPost(current.groupId, req.params.id, actorId, status === "approved" ? "approve" : "reject", req.body.rejectionReason)
          : await postService.moderatePost(req.params.id, {
              moderationStatus: status,
              actorId,
              rejectionReason: req.body.rejectionReason,
            });

        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_MODERATE_POST_FAILED" });
      }
    },
    async listComments(req, res) {
      try {
        const data = await commentService.adminListComments(req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_LIST_COMMENTS_FAILED" });
      }
    },
    async deleteComment(req, res) {
      try {
        await commentService.deleteComment(req.params.id);
        res.json({ ok: true });
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_DELETE_COMMENT_FAILED" });
      }
    },
    async listGroups(req, res) {
      try {
        const data = await groupService.adminListGroups(req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_LIST_GROUPS_FAILED" });
      }
    },
    async getGroup(req, res) {
      try {
        const group = await groupService.adminGetGroup(req.params.id);
        const stats = await groupService.getGroupStats(group._id, group.ownerId);
        res.json({ group, stats });
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_GET_GROUP_FAILED" });
      }
    },
    async getGroupStats(req, res) {
      try {
        const group = await groupService.adminGetGroup(req.params.id);
        const data = await groupService.getGroupStats(group._id, group.ownerId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_GET_GROUP_STATS_FAILED" });
      }
    },
    async deleteGroup(req, res) {
      try {
        const data = await groupService.adminDeleteGroup(req.params.id);
        res.json({ ok: true, group: data });
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_DELETE_GROUP_FAILED" });
      }
    },
    async dashboard(_req, res) {
      try {
        const [posts, comments, groups] = await Promise.all([
          postService.getAdminStats(),
          commentService.getAdminStats(),
          groupService.getAdminDashboard(),
        ]);
        res.json({
          posts,
          comments,
          groups,
          overview: {
            totalPosts: Number(posts.totalPosts || 0),
            totalComments: Number(comments.totalComments || 0),
            totalGroups: Number(groups.totalGroups || 0),
            pendingPosts: Number(posts.pendingPosts || 0),
            recentPosts7d: Number(posts.recentPosts7d || 0),
            recentComments7d: Number(comments.recentComments7d || 0),
            recentGroups30d: Number(groups.recentGroups30d || 0),
          },
        });
      } catch (e) {
        res.status(400).json({ error: e.message || "ADMIN_DASHBOARD_FAILED" });
      }
    },
  };
}

module.exports = { createAdminController };
