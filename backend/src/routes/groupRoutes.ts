import express from "express";
import { auth } from "../middleware/auth";
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
} from "../controllers";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a new group
router.post("/", createGroup);

// Get all groups for the authenticated user
router.get("/", getGroups);

// Get a specific group
router.get("/:id", getGroup);

// Update a group
router.put("/:id", updateGroup);

// Delete a group
router.delete("/:id", deleteGroup);

export default router;
