import { Request, Response } from "express";
import { User, IUser } from "../models";
import mongoose from "mongoose";

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { name, bio, interests, photos } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (interests) user.interests = interests;
    if (photos) user.photos = photos;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      interests: user.interests,
      photos: user.photos,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("friends", "name photos")
      .populate("doubleDateFriends", "name photos");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { name, bio, interests, age, gender, username } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (interests) updateData.interests = interests;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (username) {
      // Option 1: Use type assertion with a more specific type
      const existingUser = (await User.findOne({ username })) as
        | (IUser & { _id: mongoose.Types.ObjectId })
        | null;

      // Option 2: Type guard approach
      if (existingUser && mongoose.isValidObjectId(existingUser._id)) {
        if (existingUser._id.toString() !== req.user._id.toString()) {
          res.status(400).json({ message: "Username already taken" });
          return;
        }
      }
      updateData.username = username;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoubleDateFriends = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id)
      .select("doubleDateFriends")
      .populate("doubleDateFriends", "name photos username");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user.doubleDateFriends);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addDoubleDateFriend = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { friendId } = req.body;

    if (!friendId) {
      res.status(400).json({ message: "Friend ID is required" });
      return;
    }

    // Validate that friendId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      res.status(400).json({ message: "Invalid friend ID format" });
      return;
    }

    // Check if the friend exists and is actually a friend
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if this person is actually a friend
    if (!user.friends.includes(new mongoose.Types.ObjectId(friendId))) {
      res
        .status(400)
        .json({ message: "This user is not in your friends list" });
      return;
    }

    // Check if already in double date friends
    if (
      user.doubleDateFriends.includes(new mongoose.Types.ObjectId(friendId))
    ) {
      res
        .status(400)
        .json({ message: "This friend is already in your double date list" });
      return;
    }

    // Check if we've reached the maximum of 3 double date friends
    if (user.doubleDateFriends.length >= 3) {
      res.status(400).json({
        message:
          "You can only have up to 3 friends for double dates. Remove one before adding another.",
      });
      return;
    }

    // Add to double date friends
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { doubleDateFriends: friendId } },
      { new: true }
    )
      .select("doubleDateFriends")
      .populate("doubleDateFriends", "name photos username");

    res.json(updatedUser?.doubleDateFriends || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeDoubleDateFriend = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { friendId } = req.params;

    if (!friendId) {
      res.status(400).json({ message: "Friend ID is required" });
      return;
    }

    // Validate that friendId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      res.status(400).json({ message: "Invalid friend ID format" });
      return;
    }

    // Remove from double date friends
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { doubleDateFriends: friendId } },
      { new: true }
    )
      .select("doubleDateFriends")
      .populate("doubleDateFriends", "name photos username");

    res.json(updatedUser?.doubleDateFriends || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
