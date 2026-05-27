const express = require("express");

function buildGroupRoutes({ groupController }) {
  const router = express.Router();

  router.get("/", groupController.list);
  router.post("/", groupController.create);
  router.get("/recommendations", groupController.recommendations);
  router.get("/invitations/me", groupController.listMyInvitations);
  router.get("/join-requests/me", groupController.listMyJoinRequests);
  router.post("/join-by-code", groupController.joinByCode);
  router.post("/invitations/:inviteId/respond", groupController.respondToInvitation);

  router.get("/:id/members", groupController.listMembers);
  router.get("/:id/members/:memberId/status", groupController.getMemberStatus);
  router.post("/:id/members/:memberId/promote", groupController.promoteMember);
  router.post("/:id/members/:memberId/ban", groupController.banMember);
  router.post("/:id/members/:memberId/unban", groupController.unbanMember);
  router.delete("/:id/members/:memberId", groupController.removeMember);

  router.get("/:id/posts", groupController.listPosts);
  router.post("/:id/posts", groupController.createPost);
  router.post("/:id/posts/:postId/approve", groupController.approvePost);
  router.post("/:id/posts/:postId/reject", groupController.rejectPost);

  router.get("/:id/invitations", groupController.listGroupInvitations);
  router.post("/:id/invitations", groupController.inviteMember);

  router.get("/:id/join-requests", groupController.listJoinRequests);
  router.post("/:id/join-requests/:requestId/respond", groupController.respondToJoinRequest);

  router.get("/:id/stats", groupController.getGroupStats);
  router.post("/:id/transfer-ownership", groupController.transferOwnership);
  router.post("/:id/regenerate-join-code", groupController.regenerateJoinCode);
  router.delete("/:id/leave", groupController.leaveGroup);

  router.get("/:id", groupController.getById);
  router.patch("/:id", groupController.update);
  router.delete("/:id", groupController.deleteGroup);
  router.post("/:id/join", groupController.join);

  return router;
}

module.exports = { buildGroupRoutes };
