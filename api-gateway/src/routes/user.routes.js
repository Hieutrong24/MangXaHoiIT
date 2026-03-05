const express = require("express");
const { userController } = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// ===== PUBLIC =====
router.get("/public", userController.listAllUsersPublic);

// ===== PRIVATE (need login) =====
router.use(authMiddleware());

// me trước
router.get("/me", userController.getMe);

// list users (private)
router.get("/", userController.listAllUsers);

// friends đặt TRƯỚC /:id
router.get("/friends", userController.listFriends);
router.get("/friends/suggestions", userController.listSuggestions);

// friend-requests
router.post("/friend-requests/:toUserId", userController.sendFriendRequest);
router.post("/friend-requests/:requestId/accept", userController.acceptFriendRequest);
router.post("/friend-requests/:requestId/reject", userController.rejectFriendRequest);
router.post("/friend-requests/:requestId/cancel", userController.cancelFriendRequest);

router.get("/friend-requests/incoming", userController.listIncomingRequests);
router.get("/friend-requests/outgoing", userController.listOutgoingRequests);

// follow/unfollow trước /:id
router.post("/:id/follow", userController.followUser);
router.post("/:id/unfollow", userController.unfollowUser);

router.get("/:id", userController.getUserById);

module.exports = { userRoutes: router };