import { Request, Response } from "express";
import mongoose from "mongoose";
import { User, FriendRequest } from "../models";

// Get the current user's friends
export const getFriends = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Find the user with populated friends
    const user = await User.findById(req.user._id)
      .populate({
        path: "friends",
        select: "name username photos mutualInterests",
      })
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Return friends with status 'accepted'
    const friendsWithStatus = user.friends.map((friend) => ({
      ...friend,
      status: "accepted",
    }));

    res.json(friendsWithStatus);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending friend requests
export const getPendingRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Find pending friend requests sent to the current user
    const pendingRequests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    })
      .populate({
        path: "sender",
        select: "name username photos mutualInterests",
      })
      .lean();

    // Format the response to match the expected structure
    const formattedRequests = pendingRequests.map((request) => ({
      ...request.sender,
      _id: request.sender._id, // Ensure _id is properly copied
      status: "pending",
      requestId: request._id, // Add the request ID for reference
    }));

    res.json(formattedRequests);
  } catch (error: any) {
    console.error("Error getting pending requests:", error);
    res.status(500).json({ message: error.message });
  }
};

// Search for potential friends
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { query } = req.query;
    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Find users matching the query by name or username
    // Exclude the current user and any users that are already friends
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Not the current user
        { _id: { $nin: currentUser.friends || [] } }, // Not already friends
        {
          $or: [
            { name: new RegExp(query, "i") }, // Case insensitive match on name
            { username: new RegExp(query, "i") }, // Case insensitive match on username
          ],
        },
      ],
    }).select("_id name username photos");

    // Check if any found users have pending friend requests
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: req.user._id, recipient: { $in: users.map((u) => u._id) } },
        { recipient: req.user._id, sender: { $in: users.map((u) => u._id) } },
      ],
    });

    // Add 'status' field to indicate if there's a pending request
    const resultsWithStatus = users.map((user: any) => {
      const pendingRequest = pendingRequests.find(
        (request) =>
          (request.sender.toString() === req.user?._id.toString() &&
            request.recipient.toString() === user._id.toString()) ||
          (request.recipient.toString() === req.user?._id.toString() &&
            request.sender.toString() === user._id.toString())
      );

      return {
        ...user.toObject(),
        status: pendingRequest ? "pending" : undefined,
      };
    });

    res.json(resultsWithStatus);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Send a friend request
export const sendFriendRequest = async (
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

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already friends
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      res.status(404).json({ message: "Current user not found" });
      return;
    }

    if (currentUser.friends.includes(new mongoose.Types.ObjectId(friendId))) {
      res.status(400).json({ message: "Already friends with this user" });
      return;
    }

    // Check if already reached the max friends limit (3)
    const MAX_FRIENDS = 3;
    if (currentUser.friends.length >= MAX_FRIENDS) {
      res.status(400).json({
        message: `You've reached the maximum limit of ${MAX_FRIENDS} friends`,
      });
      return;
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient: friendId },
        { sender: friendId, recipient: req.user._id },
      ],
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === req.user._id.toString()) {
        res.status(400).json({ message: "Friend request already sent" });
      } else {
        res.status(400).json({
          message:
            "This user has already sent you a friend request. Check your pending requests.",
        });
      }
      return;
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      sender: req.user._id,
      recipient: friendId,
      status: "pending",
      createdAt: new Date(),
    });

    await friendRequest.save();

    res.status(201).json({
      message: "Friend request sent successfully",
      request: friendRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (
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

    // Find the friend request
    const friendRequest = await FriendRequest.findOne({
      sender: friendId,
      recipient: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    // Update request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: new mongoose.Types.ObjectId(friendId) },
    });

    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friends: req.user._id },
    });

    res.json({ message: "Friend request accepted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (
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

    // Find and update the friend request
    const friendRequest = await FriendRequest.findOne({
      sender: friendId,
      recipient: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    // Update request status
    friendRequest.status = "rejected";
    await friendRequest.save();

    res.json({ message: "Friend request rejected" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a friend
export const removeFriend = async (
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

    // Remove from each other's friend lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: new mongoose.Types.ObjectId(friendId) },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user._id },
    });

    // Delete any friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user._id, recipient: friendId },
        { sender: friendId, recipient: req.user._id },
      ],
    });

    res.json({ message: "Friend removed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
