const { userClient } = require("../clients/user.client");
const { notificationClient } = require('../clients/notification.client');
const {
  buildFriendRequestSentEvent,
  buildFriendRequestAcceptedEvent,
} = require('../utils/socialEvent.helper');

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
    user: req.user,
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

async function publishBestEffort(eventName, payload, ctx) {
  if (!eventName) return;
  try {
    await notificationClient.publishEvent(eventName, payload, ctx);
  } catch (error) {
    console.warn('[user.controller] publishBestEffort warning:', error.message);
  }
}

const userController = {
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


  async getMeProfileFull(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const data = await userClient.getMeProfileFull(ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      if (e?.response?.status === 404 && ctx?.userId) {
        try {
          const data = await userClient.getProfileFull(ctx.userId, ctx);
          return res.json({ success: true, data, correlationId: req.correlationId });
        } catch (fallbackError) {
          return next(fallbackError);
        }
      }
      next(e);
    }
  },

  async getSettings(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const userId = ctx.userId;
      const data = await userClient.getSettings(userId, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const userId = ctx.userId;
      const data = await userClient.updateSettings(userId, req.body, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getProfileFull(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const id = requireParam(req, "id");
      const data = await userClient.getProfileFull(id, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async getTrustSafety(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const id = requireParam(req, "id");
      const data = await userClient.getTrustSafety(id, req.query, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },


  async getProfileFullByUsername(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const username = requireParam(req, "username");
      const data = await userClient.getProfileFullByUsername(username, ctx);
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async updateProfileFull(req, res, next) {
    try {
      const ctx = makeCtx(req);
      const id = requireParam(req, "id");
      const data = await userClient.updateProfileFull(id, req.body, ctx);
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

      const event = buildFriendRequestSentEvent({ upstreamData: data, req, toUserId });
      await publishBestEffort(event.eventName, event.payload, ctx);

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

      const event = buildFriendRequestAcceptedEvent({ upstreamData: data, req, requestId });
      await publishBestEffort(event.eventName, event.payload, ctx);

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

  async listAllUsersPublic(req, res, next) {
    try {
      const data = await userClient.getAllUser(req.query, {});
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async listAllUsers(req, res, next) {
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
