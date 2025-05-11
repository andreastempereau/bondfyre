import express from "express";
import { auth } from "../middleware";
import { createSwipe, getSwipes } from "../controllers";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a new swipe
router.post("/", createSwipe);

// Get all swipes for the authenticated user
router.get("/", getSwipes);

// Get potential matches for the authenticated user
// router.get("/potential", getPotentialMatches);

export default router;
