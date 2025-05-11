import express from "express";
import { auth } from "../middleware";
import {
  getGroupChatById,
  getGroupChatMessages,
  getGroupChats,
  sendGroupChatMessage,
} from "../controllers";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all group chats for the authenticated user
router.get("/", getGroupChats);

// Get a specific group chat
router.get("/:id", getGroupChatById);

// Get all messages for a group chat
router.get("/:id/messages", getGroupChatMessages);

// Send a message to a group chat
router.post("/:id/messages", sendGroupChatMessage);

export default router;
