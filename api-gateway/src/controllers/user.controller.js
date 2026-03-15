const { userClient } = require("../clients/user.client");

/**
 * Tạo context chuẩn để forward xuống user-service
 */
function makeCtx(req) {
  const authHeader = req.headers?.authorization || req.authHeader || null;

  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    req.xUserId ||
    req.auth?.userId ||
    req.ctx?.userId ||
    req.headers?.["x-user-id"] ||
    req.headers?.["X-User-Id"] ||
    null;

  return {
    correlationId: req.correlationId,
    authHeader,
    userId,
    xUserId: userId,
  };
}

function requireParam(req, name) {
  const v = req.params?.[name];
  if (!v) {
    const err = new Error(`Missing param: ${name}`);
    err.status = 400;
    throw err;
  }
  return v;
}

const userController = {
  // ========================
  // PRIVATE (require login)
  // ========================

  async getMe(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await userClient.getMe(ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getUserById(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const id = requireParam(req, "id");
      const data = await userClient.getUserById(id, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async followUser(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const id = requireParam(req, "id");
      const data = await userClient.followUser(id, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async unfollowUser(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const id = requireParam(req, "id");
      const data = await userClient.unfollowUser(id, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async sendFriendRequest(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const toUserId = requireParam(req, "toUserId");
      const data = await userClient.sendFriendRequest(toUserId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async acceptFriendRequest(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const requestId = requireParam(req, "requestId");
      const data = await userClient.acceptFriendRequest(requestId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async rejectFriendRequest(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const requestId = requireParam(req, "requestId");
      const data = await userClient.rejectFriendRequest(requestId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async cancelFriendRequest(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const requestId = requireParam(req, "requestId");
      const data = await userClient.cancelFriendRequest(requestId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listIncomingRequests(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await userClient.listIncomingRequests(req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listOutgoingRequests(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await userClient.listOutgoingRequests(req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listFriends(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await userClient.listFriends(req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listSuggestions(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await userClient.listSuggestions(req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  // ========================
  // PUBLIC (no login required)
  // ========================

  async listAllUsersPublic(req, res, next) {
    try {
      const data = await userClient.getAllUser(req.query, {}); // public
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listAllUsers(req, res, next) {
    // ✅ bản private: có auth + userId
    try {
      const ctx = makeCtx(req);
      const data = await userClient.getAllUser(req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { userController };