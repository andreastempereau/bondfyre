import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";

// Extend the Express Request interface to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Define JWTPayload interface for TypeScript
interface JwtPayload {
  userId: string;
  [key: string]: any;
}

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from the Authorization header and sets req.user if valid
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access token is required" });
      return;
    }

    // Get JWT secret from environment variable - ensure it's the same as in authController.ts
    // IMPORTANT: This must match exactly the one used in authController.ts
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

    try {
      // Use a type assertion for the decoded token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      try {
        // Find the user from the decoded token
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        // Set the authenticated user on the request object
        req.user = user;
        next();
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    } catch (err: any) {
      res
        .status(403)
        .json({ message: `Token verification error: ${err.message}` });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Middleware to check if the authenticated user is an admin
 * Must be used after authenticateToken middleware
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }

  next();
};
