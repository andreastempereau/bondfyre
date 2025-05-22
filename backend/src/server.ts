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
    ? [
        "https://bondfyre-production.up.railway.app",
        "https://*.bondfyre-production.up.railway.app",
      ]
    : [
        "http://localhost:8080",
        "http://localhost:3000",
        "exp://*",
        "http://*",
        "https://*",
      ];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request middleware
app.use((_req, _res, next) => {
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
  res.status(404).json({ message: "Route not found" });
});

// Add error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      error: NODE_ENV === "development" ? err : {},
    });
  }
);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    app.listen(PORT, () => {
      // Server started
      console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Export app for testing
export default app;
