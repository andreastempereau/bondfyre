import express from "express";
import { auth } from "../middleware";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatchStatus,
} from "../controllers";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all matches for the authenticated user
router.get("/", getMatches);

// Get a specific match
router.get("/:id", getMatch);

// Create a new match
router.post("/", createMatch);

// Update match status
router.put("/:id/status", updateMatchStatus);

export default router;
