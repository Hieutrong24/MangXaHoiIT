function createGroupController({ groupService }) {
  return {
    async list(req, res) {
      try {
        const data = await groupService.listGroups(req.query, req.headers["x-user-id"] || null);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_GROUPS_FAILED" });
      }
    },
    async recommendations(req, res) {
      try {
        const userId = req.headers["x-user-id"] || req.query.viewerId || req.query.userId || null;
        const data = await groupService.recommendGroups(req.query, userId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "RECOMMEND_GROUPS_FAILED" });
      }
    },
    async create(req, res) {
      try {
        const ownerId = req.headers["x-user-id"] || req.body.ownerId;
        const data = await groupService.createGroup({ ...req.body, ownerId });
        res.status(201).json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "CREATE_GROUP_FAILED" });
      }
    },
    async getById(req, res) {
      try {
        const data = await groupService.getGroup(req.params.id, req.headers["x-user-id"] || null);
        if (!data) return res.status(404).json({ error: "NOT_FOUND" });
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "GET_GROUP_FAILED" });
      }
    },
    async update(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.updateGroup(req.params.id, actorId, req.body);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "UPDATE_GROUP_FAILED" });
      }
    },
    async join(req, res) {
      try {
        const userId = req.headers["x-user-id"] || req.body.userId;
        const data = await groupService.joinGroup(req.params.id, userId, req.body);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "JOIN_GROUP_FAILED" });
      }
    },
    async joinByCode(req, res) {
      try {
        const userId = req.headers["x-user-id"] || req.body.userId;
        const data = await groupService.joinByCode(req.body.code, userId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "JOIN_BY_CODE_FAILED" });
      }
    },
    async listMembers(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.query.actorId;
        const data = await groupService.listMembers(req.params.id, actorId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_MEMBERS_FAILED" });
      }
    },
    async promoteMember(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.promoteMember(req.params.id, actorId, req.params.memberId, req.body.role || "admin");
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "PROMOTE_MEMBER_FAILED" });
      }
    },
    async removeMember(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.removeMember(req.params.id, actorId, req.params.memberId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "REMOVE_MEMBER_FAILED" });
      }
    },
    async listPosts(req, res) {
      try {
        const data = await groupService.listGroupPosts(req.params.id, req.query, req.headers["x-user-id"] || null);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_GROUP_POSTS_FAILED" });
      }
    },
    async createPost(req, res) {
      try {
        const authorId = req.headers["x-user-id"] || req.body.authorId;
        const data = await groupService.createGroupPost(req.params.id, { ...req.body, authorId });
        res.status(201).json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "CREATE_GROUP_POST_FAILED" });
      }
    },
    async approvePost(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.moderateGroupPost(req.params.id, req.params.postId, actorId, "approve");
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "APPROVE_GROUP_POST_FAILED" });
      }
    },
    async rejectPost(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.moderateGroupPost(req.params.id, req.params.postId, actorId, "reject", req.body.rejectionReason || req.body.reason);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "REJECT_GROUP_POST_FAILED" });
      }
    },
    async listMyInvitations(req, res) {
      try {
        const userId = req.headers["x-user-id"] || req.query.userId;
        const data = await groupService.listInvitationsForUser(userId, req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_MY_INVITATIONS_FAILED" });
      }
    },
    async listGroupInvitations(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.query.actorId;
        const data = await groupService.listGroupInvitations(req.params.id, actorId, req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_GROUP_INVITATIONS_FAILED" });
      }
    },
    async inviteMember(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.inviteMember(req.params.id, actorId, req.body);
        res.status(201).json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "INVITE_MEMBER_FAILED" });
      }
    },
    async respondToInvitation(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.respondToInvitation(req.params.inviteId, actorId, req.body.action);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "RESPOND_GROUP_INVITATION_FAILED" });
      }
    },
    async listJoinRequests(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.query.actorId;
        const data = await groupService.listJoinRequests(req.params.id, actorId, req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_JOIN_REQUESTS_FAILED" });
      }
    },
    async listMyJoinRequests(req, res) {
      try {
        const userId = req.headers["x-user-id"] || req.query.userId;
        const data = await groupService.listMyJoinRequests(userId, req.query);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LIST_MY_JOIN_REQUESTS_FAILED" });
      }
    },
    async respondToJoinRequest(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.respondToJoinRequest(req.params.id, req.params.requestId, actorId, req.body.action);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "RESPOND_JOIN_REQUEST_FAILED" });
      }
    },
    async leaveGroup(req, res) {
      try {
        const userId = req.headers["x-user-id"] || req.body.userId;
        const data = await groupService.leaveGroup(req.params.id, userId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "LEAVE_GROUP_FAILED" });
      }
    },
    async deleteGroup(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.deleteGroup(req.params.id, actorId);
        res.json({ message: "Group deleted successfully", group: data });
      } catch (e) {
        res.status(400).json({ error: e.message || "DELETE_GROUP_FAILED" });
      }
    },
    async getMemberStatus(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.query.actorId;
        const userId = req.params.memberId;
        const data = await groupService.getMemberStatus(req.params.id, actorId, userId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "GET_MEMBER_STATUS_FAILED" });
      }
    },
    async banMember(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.banMember(req.params.id, actorId, req.params.memberId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "BAN_MEMBER_FAILED" });
      }
    },
    async unbanMember(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.unbanMember(req.params.id, actorId, req.params.memberId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "UNBAN_MEMBER_FAILED" });
      }
    },
    async transferOwnership(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.transferOwnership(req.params.id, actorId, req.body.newOwnerId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "TRANSFER_OWNERSHIP_FAILED" });
      }
    },
    async regenerateJoinCode(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.body.actorId;
        const data = await groupService.regenerateJoinCode(req.params.id, actorId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "REGENERATE_JOIN_CODE_FAILED" });
      }
    },
    async getGroupStats(req, res) {
      try {
        const actorId = req.headers["x-user-id"] || req.query.actorId;
        const data = await groupService.getGroupStats(req.params.id, actorId);
        res.json(data);
      } catch (e) {
        res.status(400).json({ error: e.message || "GET_GROUP_STATS_FAILED" });
      }
    },
  };
}

module.exports = { createGroupController };
