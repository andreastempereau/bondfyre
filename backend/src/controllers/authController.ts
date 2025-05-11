import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, profile, phoneNumber, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Check if username is provided and already exists
    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
    }

    // Create new user with profile information - let the model's pre-save hook handle password hashing
    const user = new User({
      email,
      password, // Password will be hashed by the pre-save hook in the User model
      name,
      bio: profile?.bio || "",
      age: profile?.age,
      gender: profile?.gender,
      interests: profile?.interests || [],
      photos: profile?.photos || [],
      phoneNumber,
      username,
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        _id: user._id, // Using _id instead of id to match the format used in login response
        email: user.email,
        name: user.name,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        interests: user.interests,
        photos: user.photos,
        phoneNumber: user.phoneNumber,
        username: user.username,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Check password using the model's comparePassword method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        interests: user.interests,
        photos: user.photos,
        phoneNumber: user.phoneNumber,
        username: user.username,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // User is already authenticated via middleware
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Generate a fresh token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
