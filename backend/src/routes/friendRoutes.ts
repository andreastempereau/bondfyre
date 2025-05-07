import express from "express";
import {
  getFriends,
  getPendingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../controllers/friendController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get friends
router.get("/", getFriends);

// Get pending friend requests
router.get("/pending", getPendingRequests);

// Search for potential friends
router.get("/search", searchUsers);

// Send a friend request
router.post("/request/:friendId", sendFriendRequest);

// Accept a friend request
router.post("/accept/:friendId", acceptFriendRequest);

// Reject a friend request
router.post("/reject/:friendId", rejectFriendRequest);

// Remove a friend
router.delete("/:friendId", removeFriend);

export default router;
