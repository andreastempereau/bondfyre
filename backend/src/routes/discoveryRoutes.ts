import express from "express";
import { auth } from "../middleware";
import { discoverGroups, discoverUsers } from "../controllers";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Discover groups using advanced algorithms
router.get("/groups", discoverGroups);

// Discover users using advanced algorithms
router.get("/users", discoverUsers);

export default router;
