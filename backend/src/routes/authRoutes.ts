import express from "express";
import {
  login,
  register,
  resetPassword,
  refreshToken,
  checkUsername,
} from "../controllers";

const router = express.Router();

// Root path handler for /api/auth
router.get("/", (_req, res) => {
  res.status(200).json({ message: "Auth API is working" });
});

router.post("/", (_req, res) => {
  res.status(200).json({ message: "Auth API POST endpoint" });
});

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/token/refresh", refreshToken);
router.get("/check-username", checkUsername);

export default router;
