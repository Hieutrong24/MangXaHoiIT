const express = require("express");
const { contentController } = require("../controllers/content.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/feed", contentController.getFeed);
router.get("/search", contentController.search);
router.get("/posts", contentController.listPosts);
router.get("/posts/recommendations", contentController.recommendPosts);
router.get("/posts/trending", contentController.trendingPosts);
router.get("/posts/:id", contentController.getPostById);
router.get("/posts/:id/comments", contentController.listComments);
router.get('/groups', contentController.listGroups);
router.get('/groups/recommendations', contentController.recommendGroups);
router.get('/groups/:id', contentController.getGroupById);
router.get('/groups/:id/posts', contentController.listGroupPosts);
router.get('/jobs', contentController.listJobs);

router.get('/groups/:id/members', contentController.listGroupMembers);
router.get('/groups/:id/stats', contentController.getGroupStats);
router.get('/groups/invitations/me', contentController.listMyGroupInvitations);
router.get('/groups/join-requests/me', contentController.listMyGroupJoinRequests);
router.post('/groups/invitations/:inviteId/respond', contentController.respondToGroupInvitation);

router.use(authMiddleware());
router.post('/groups', contentController.createGroup);
router.patch('/groups/:id', contentController.updateGroup);
router.post('/groups/:id/join', contentController.joinGroup);
router.delete('/groups/:id/leave', contentController.leaveGroup);
router.delete('/groups/:id', contentController.deleteGroup);
router.post('/groups/join-by-code', contentController.joinGroupByCode);
router.get('/groups/:id/members/:memberId/status', contentController.getMemberGroupStatus);
router.post('/groups/:id/members/:memberId/promote', contentController.promoteGroupMember);
router.post('/groups/:id/members/:memberId/ban', contentController.banGroupMember);
router.post('/groups/:id/members/:memberId/unban', contentController.unbanGroupMember);
router.delete('/groups/:id/members/:memberId', contentController.removeGroupMember);
router.post('/groups/:id/posts', contentController.createGroupPost);
router.post('/groups/:id/posts/:postId/approve', contentController.approveGroupPost);
router.post('/groups/:id/posts/:postId/reject', contentController.rejectGroupPost);
router.get('/groups/:id/invitations', contentController.listGroupInvitations);
router.post('/groups/:id/invitations', contentController.inviteGroupMember);
router.get('/groups/:id/join-requests', contentController.listGroupJoinRequests);
router.post('/groups/:id/join-requests/:requestId/respond', contentController.respondToGroupJoinRequest);
router.post('/groups/:id/transfer-ownership', contentController.transferGroupOwnership);
router.post('/groups/:id/regenerate-join-code', contentController.regenerateGroupJoinCode);
router.post("/posts", contentController.createPost);
router.post("/posts/:id/like", contentController.toggleLike);
router.post("/posts/:id/share", contentController.sharePost);
router.post("/posts/:id/comments", contentController.createComment);

module.exports = { contentRoutes: router };
