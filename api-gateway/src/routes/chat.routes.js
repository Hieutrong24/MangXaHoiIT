const express = require("express");
const { chatController } = require("../controllers/chat.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware());

router.get('/groups', chatController.listGroups);
router.post('/groups', chatController.createGroup);
router.get('/groups/:chatId', chatController.getGroupDetail);
router.patch('/groups/:chatId', chatController.updateGroup);
router.get('/groups/:chatId/members', chatController.listGroupMembers);
router.post('/groups/:chatId/members', chatController.addGroupMembers);
router.delete('/groups/:chatId/members/:memberUserId', chatController.removeGroupMember);
router.patch('/groups/:chatId/members/:memberUserId/role', chatController.updateGroupMemberRole);
router.post('/groups/:chatId/leave', chatController.leaveGroup);

router.get('/presence/:userId', chatController.getPresence);
router.post('/presence/query', chatController.queryPresence);
router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = { chatRoutes: router };
