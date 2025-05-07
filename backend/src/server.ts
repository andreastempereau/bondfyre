import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import {
  authRoutes,
  userRoutes,
  groupRoutes,
  matchRoutes,
  messageRoutes,
  swipeRoutes,
  discoveryRoutes,
  friendRoutes,
  groupChatRoutes,
} from "./routes";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/2uo";
const NODE_ENV = process.env.NODE_ENV || "development";

// Configure allowed origins based on environment
const allowedOrigins =
  NODE_ENV === "production"
    ? ["https://yourdomain.com", "https://*.yourdomain.com"]
    : [
        "http://localhost8080",
        "exp://*",
        "http://*",
        "https://63a1-2a09-bac1-36c0-00-29e-18.ngrok-free.app",
      ];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/group-chats", groupChatRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", environment: NODE_ENV });
});

// Error handling for unsupported routes
app.use((_req, res, _next) => {
  console.log("Route not found");
  // Log the request method and path
  console.log(
    `${new Date().toISOString()} - Route not found: ${_req.method} ${_req.path}`
  );

  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Export app for testing
export default app;
