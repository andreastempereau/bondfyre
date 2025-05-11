import express from "express";
import { auth } from "../middleware";
import {
  addDoubleDateFriend,
  getDoubleDateFriends,
  getUserProfile,
  removeDoubleDateFriend,
  updateUserProfile,
} from "../controllers";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

// Double date friends routes
router.get("/double-date-friends", getDoubleDateFriends);
router.post("/double-date-friends", addDoubleDateFriend);
router.delete("/double-date-friends/:friendId", removeDoubleDateFriend);

export default router;
