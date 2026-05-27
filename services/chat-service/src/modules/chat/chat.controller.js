const express = require('express');

function getUserIdFromReq(req) {
  return req.headers['x-user-id'] || req.headers['x-userid'] || null;
}

function normalizeUserIds(input) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((item) => String(item || '').trim()).filter(Boolean))];
}

function requireUserId(req, res) {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    res.status(401).json({ error: 'x-user-id required' });
    return null;
  }
  return String(userId);
}

function buildChatRouter({ chatService, presenceService }) {
  const router = express.Router();

  router.get('/health', (_req, res) => res.json({ ok: true }));

  router.get('/admin/dashboard', async (_req, res) => {
    try {
      const data = await chatService.adminGetDashboard();
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/admin/groups', async (req, res) => {
    try {
      const data = await chatService.adminListGroups(req.query);
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/admin/groups/:chatId', async (req, res) => {
    try {
      const group = await chatService.adminGetGroupDetail(req.params.chatId);
      res.json({ group });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/admin/groups/:chatId/messages', async (req, res) => {
    try {
      const data = await chatService.adminListMessages(req.params.chatId, {
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 30,
        beforeId: req.query.beforeId ? String(req.query.beforeId) : null,
      });
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/admin/groups/:chatId', async (req, res) => {
    try {
      const group = await chatService.adminDeleteGroup(req.params.chatId);
      res.json({ group, deleted: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/admin/messages/:messageId', async (req, res) => {
    try {
      const message = await chatService.adminDeleteMessage(req.params.messageId);
      res.json({ message, deleted: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/groups', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const items = await chatService.listGroupsForUser(userId);
      res.json({ items });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/groups', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const group = await chatService.createGroup({
        createdBy: userId,
        name: req.body?.name,
        description: req.body?.description || '',
        avatarUrl: req.body?.avatarUrl || '',
        memberIds: normalizeUserIds(req.body?.memberIds || []),
      });
      res.status(201).json({ group });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/groups/:chatId', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const group = await chatService.getGroupDetail(req.params.chatId, userId);
      res.json({ group });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.patch('/groups/:chatId', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const group = await chatService.updateGroup(req.params.chatId, userId, {
        name: req.body?.name,
        description: req.body?.description,
        avatarUrl: req.body?.avatarUrl,
      });
      res.json({ group });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/groups/:chatId/members', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const items = await chatService.listGroupMembers(req.params.chatId, userId);
      res.json({ items });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/groups/:chatId/members', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const group = await chatService.addGroupMembers(
        req.params.chatId,
        userId,
        normalizeUserIds(req.body?.memberIds || [])
      );
      res.json({ group });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/groups/:chatId/members/:memberUserId', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const result = await chatService.removeGroupMember(
        req.params.chatId,
        userId,
        req.params.memberUserId
      );
      res.json({ group: result });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.patch('/groups/:chatId/members/:memberUserId/role', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const group = await chatService.updateGroupMemberRole(
        req.params.chatId,
        userId,
        req.params.memberUserId,
        req.body?.role
      );
      res.json({ group });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/groups/:chatId/leave', async (req, res) => {
    try {
      const userId = requireUserId(req, res);
      if (!userId) return;
      const result = await chatService.leaveGroup(req.params.chatId, userId);
      res.json({ result });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/chats/:chatId/messages', async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
      const beforeId = req.query.beforeId ? String(req.query.beforeId) : null;
      const viewerId = getUserIdFromReq(req);

      const data = await chatService.listMessages(chatId, { limit, beforeId, viewerId });
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/chats/:chatId/messages', async (req, res) => {
    try {
      const senderId = requireUserId(req, res);
      if (!senderId) return;

      const chatId = req.params.chatId;
      const dto = await chatService.sendMessage({
        chatId,
        senderId,
        type: req.body?.type || 'text',
        content: req.body?.content,
        meta: req.body?.meta || {},
        clientMessageId: req.body?.clientMessageId || null,
      });

      res.status(201).json({ message: dto });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/presence/:userId', (req, res) => {
    if (!presenceService) {
      return res.status(503).json({ error: 'presence service unavailable' });
    }

    return res.json({
      item: presenceService.getPresence(req.params.userId),
    });
  });

  router.post('/presence/query', (req, res) => {
    if (!presenceService) {
      return res.status(503).json({ error: 'presence service unavailable' });
    }

    const userIds = normalizeUserIds(req.body?.userIds || []);
    return res.json({
      items: presenceService.getMany(userIds),
    });
  });

  return router;
}

module.exports = { buildChatRouter };
