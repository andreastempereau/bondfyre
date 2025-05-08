import { Request, Response } from "express";
import { GroupChat, Message } from "../models";
import mongoose from "mongoose";

export const getGroupChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const groupChats = await GroupChat.find({
      participants: req.user._id,
    })
      .populate("participants", "name photos")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.json(groupChats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { id } = req.params;

    const groupChat = await GroupChat.findById(id)
      .populate("participants", "name photos")
      .populate("latestMessage")
      .populate("createdFromMatches");

    if (!groupChat) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (
      !groupChat.participants.some(
        (participant: any) =>
          participant._id.toString() === req.user?._id.toString()
      )
    ) {
      res
        .status(403)
        .json({ message: "You are not a participant in this group chat" });
      return;
    }

    res.json(groupChat);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupChatMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { id } = req.params;
    const { limit = 50, before } = req.query;
    const parsedLimit = Math.min(parseInt(limit as string) || 50, 100);

    // Check if user is a participant in this group chat
    const groupChat = await GroupChat.findById(id);
    if (!groupChat) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (
      !groupChat.participants.some(
        (participant) => participant.toString() === req.user?._id.toString()
      )
    ) {
      res
        .status(403)
        .json({ message: "You are not a participant in this group chat" });
      return;
    }

    // Build query
    const query: any = { groupChat: id };
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .populate("sender", "name photos")
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    // Mark messages as read by current user
    await Message.updateMany(
      {
        groupChat: id,
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json(messages.reverse()); // Return in chronological order
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendGroupChatMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    // Check if user is a participant in this group chat
    const groupChat = await GroupChat.findById(id);
    if (!groupChat) {
      res.status(404).json({ message: "Group chat not found" });
      return;
    }

    if (
      !groupChat.participants.some(
        (participant) => participant.toString() === req.user?._id.toString()
      )
    ) {
      res
        .status(403)
        .json({ message: "You are not a participant in this group chat" });
      return;
    }

    // Create and save the message
    const message = new Message({
      sender: req.user._id,
      content,
      groupChat: id,
      readBy: [req.user._id], // Mark as read by sender
    });

    await message.save();

    // Update the group chat's lastMessage
    groupChat.latestMessage = message._id as mongoose.Types.ObjectId;
    await groupChat.save();

    // Populate sender info before returning
    await message.populate("sender", "name photos");

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
