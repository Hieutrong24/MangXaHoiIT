const { chatClient } = require("../clients/chat.client");

function makeCtx(req) {
  const authHeader = req.headers?.authorization || req.authHeader || null;
  const userId = req.user?.id || req.user?.userId || null;

  return {
    correlationId: req.correlationId,
    authHeader,
    xUserId: userId,
  };
}

const chatController = {
  async listGroups(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.listGroups(ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async createGroup(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.createGroup(req.body, ctx);
      res.status(201).json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getGroupDetail(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.getGroupDetail(req.params.chatId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async updateGroup(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.updateGroup(req.params.chatId, req.body, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listGroupMembers(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.listGroupMembers(req.params.chatId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async addGroupMembers(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.addGroupMembers(req.params.chatId, req.body, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async removeGroupMember(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.removeGroupMember(
        req.params.chatId,
        req.params.memberUserId,
        ctx
      );
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async updateGroupMemberRole(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.updateGroupMemberRole(
        req.params.chatId,
        req.params.memberUserId,
        req.body,
        ctx
      );
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async leaveGroup(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.leaveGroup(req.params.chatId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getMessages(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.getMessages(req.params.chatId, req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.sendMessage(req.params.chatId, req.body, ctx);
      res.status(201).json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getPresence(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.getPresence(req.params.userId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async queryPresence(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await chatClient.queryPresence(req.body?.userIds || [], ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { chatController };
