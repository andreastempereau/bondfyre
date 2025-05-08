import express from "express";
import { authMiddleware } from "../middleware";
import {
  addDoubleDateFriend,
  getDoubleDateFriends,
  getUserProfile,
  removeDoubleDateFriend,
  updateUserProfile,
} from "../controllers";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// Double date friends routes
router.get("/double-date-friends", authMiddleware, getDoubleDateFriends);
router.post("/double-date-friends", authMiddleware, addDoubleDateFriend);
router.delete(
  "/double-date-friends/:friendId",
  authMiddleware,
  removeDoubleDateFriend
);

export default router;
