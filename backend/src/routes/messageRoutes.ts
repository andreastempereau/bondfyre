import express from "express";
import { auth } from "../middleware";
import { getMessages, sendMessage, markMessagesAsRead } from "../controllers";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all messages for a match
router.get("/match/:matchId", getMessages);

// Send a new message
router.post("/match/:matchId", sendMessage);

// Mark messages as read
router.put("/match/:matchId/read", markMessagesAsRead);

export default router;
