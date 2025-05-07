import { Request, Response } from "express";
import mongoose from "mongoose";
import { Swipe, Match, User, GroupChat } from "../models";

export const createSwipe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { userId: swipedUserId, direction } = req.body;

    if (!swipedUserId || !direction) {
      res.status(400).json({
        message: "Missing required fields: userId and direction",
      });
      return;
    }

    // Check if users are the same
    if (req.user._id.toString() === swipedUserId) {
      res.status(400).json({ message: "Cannot swipe on yourself" });
      return;
    }

    // Check if swipe already exists
    const existingSwipe = await Swipe.findOne({
      user: req.user._id,
      swipedUser: swipedUserId,
    });

    if (existingSwipe) {
      res.status(400).json({ message: "You have already swiped on this user" });
      return;
    }

    // Create new swipe
    const swipe = new Swipe({
      user: req.user._id,
      swipedUser: swipedUserId,
      direction,
    });

    await swipe.save();

    // If it's a like, check for mutual like (match)
    if (direction === "right") {
      const mutualSwipe = await Swipe.findOne({
        user: swipedUserId,
        swipedUser: req.user._id,
        direction: "right",
      });

      if (mutualSwipe) {
        // Create a match
        const match = new Match({
          user: req.user._id,
          matchedUser: swipedUserId,
          createdAt: new Date(),
        });

        await match.save();

        // Get user data for response
        const currentUser = await User.findById(req.user._id)
          .select("name age gender photos")
          .lean();
        const matchedUser = await User.findById(swipedUserId)
          .select("name age gender photos")
          .lean();

        // Now check for friend matches between both users
        // First, get both users with their friends populated
        const userWithFriends = await User.findById(req.user._id)
          .select("friends")
          .populate("friends", "_id")
          .lean();

        const matchedUserWithFriends = await User.findById(swipedUserId)
          .select("friends")
          .populate("friends", "_id")
          .lean();

        if (
          userWithFriends?.friends?.length &&
          matchedUserWithFriends?.friends?.length
        ) {
          // Check for existing mutual likes between friends
          const userFriendIds = userWithFriends.friends.map((friend) =>
            friend._id.toString()
          );
          const matchedUserFriendIds = matchedUserWithFriends.friends.map(
            (friend) => friend._id.toString()
          );

          // Find swipes where user's friends liked matched user's friends
          const userFriendsSwipes = await Swipe.find({
            user: { $in: userFriendIds },
            swipedUser: { $in: matchedUserFriendIds },
            direction: "right",
          });

          // Find swipes where matched user's friends liked user's friends
          const matchedUserFriendsSwipes = await Swipe.find({
            user: { $in: matchedUserFriendIds },
            swipedUser: { $in: userFriendIds },
            direction: "right",
          });

          // Find mutual friend matches
          const friendMatches = [];
          for (const userFriendSwipe of userFriendsSwipes) {
            const reciprocalSwipe = matchedUserFriendsSwipes.find(
              (swipe) =>
                swipe.user.toString() ===
                  userFriendSwipe.swipedUser.toString() &&
                swipe.swipedUser.toString() === userFriendSwipe.user.toString()
            );

            if (reciprocalSwipe) {
              // We found a mutual match between friends
              friendMatches.push({
                user1: userFriendSwipe.user.toString(),
                user2: reciprocalSwipe.user.toString(),
              });

              // Create a match record for these friends if it doesn't exist
              const existingFriendMatch = await Match.findOne({
                $or: [
                  {
                    user: userFriendSwipe.user,
                    matchedUser: reciprocalSwipe.user,
                  },
                  {
                    user: reciprocalSwipe.user,
                    matchedUser: userFriendSwipe.user,
                  },
                ],
              });

              if (!existingFriendMatch) {
                const friendMatch = new Match({
                  user: userFriendSwipe.user,
                  matchedUser: reciprocalSwipe.user,
                  createdAt: new Date(),
                });
                await friendMatch.save();
              }
            }
          }

          // If we have at least one friend match, create a group chat
          if (friendMatches.length > 0) {
            // Collect all unique participants
            const participants = new Set<string>([
              req.user._id.toString(),
              swipedUserId.toString(),
            ]);

            // Add all users from friend matches
            friendMatches.forEach((friendMatch) => {
              participants.add(friendMatch.user1);
              participants.add(friendMatch.user2);
            });

            // Create a group chat name based on the original match
            const groupChatName = `${currentUser?.name || "User"} & Friends`;

            // Create the group chat
            const groupChat = new GroupChat({
              name: groupChatName,
              participants: Array.from(participants).map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              creator: req.user._id,
              createdFromMatchCount: friendMatches.length + 1, // +1 for the original match
              isAutoCreated: true,
            });

            await groupChat.save();

            // Return match data with the additional group chat information
            res.status(201).json({
              swipe,
              isMatch: true,
              hasGroupChat: true,
              groupChat: {
                _id: groupChat._id,
                name: groupChat.name,
                participants: Array.from(participants).length,
              },
              matchDetails: {
                _id: match._id,
                currentUser,
                matchedUser,
                message: "You have a new match with a group chat!",
                friendMatchesCount: friendMatches.length,
              },
            });
            return;
          }
        }

        // No friend matches, return regular match data
        res.status(201).json({
          swipe,
          isMatch: true,
          hasGroupChat: false,
          matchDetails: {
            _id: match._id,
            currentUser,
            matchedUser,
            message: "You have a new match!",
          },
        });
        return;
      }
    }

    res.status(201).json({ swipe });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSwipes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const swipes = await Swipe.find({ user: req.user._id })
      .populate("swipedUser", "name photos")
      .sort({ createdAt: -1 });

    res.json(swipes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSwipe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { id } = req.params;

    const swipe = await Swipe.findById(id);

    if (!swipe) {
      res.status(404).json({ message: "Swipe not found" });
      return;
    }

    if (swipe.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Not authorized to delete this swipe" });
      return;
    }

    await swipe.deleteOne();

    res.json({ message: "Swipe deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
