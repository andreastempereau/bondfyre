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
          matchType: "user-to-user",
          status: "accepted",
        });

        await match.save();

        // Get user data for response
        const currentUser = await User.findById(req.user._id)
          .select("name age gender photos doubleDateFriends")
          .populate("doubleDateFriends", "_id name photos")
          .lean();

        const matchedUser = await User.findById(swipedUserId)
          .select("name age gender photos doubleDateFriends")
          .populate("doubleDateFriends", "_id name photos")
          .lean();

        // Check if both users have selected doubleDateFriends
        const userDoubleDateFriends = currentUser?.doubleDateFriends || [];
        const matchedUserDoubleDateFriends =
          matchedUser?.doubleDateFriends || [];

        if (
          userDoubleDateFriends.length > 0 &&
          matchedUserDoubleDateFriends.length > 0
        ) {
          // Look for mutual likes between the user's double date friends and the matched user's double date friends
          const doubleDateFriendsFound = [];
          const matchPairs = [
            {
              user1: new mongoose.Types.ObjectId(req.user._id),
              user2: new mongoose.Types.ObjectId(swipedUserId),
              relationship: "match",
            },
          ];

          // Get the ObjectId strings of all friends
          const userDoubleDateFriendIds = userDoubleDateFriends.map(
            (friend: any) => friend._id.toString()
          );

          const matchedUserDoubleDateFriendIds =
            matchedUserDoubleDateFriends.map((friend: any) =>
              friend._id.toString()
            );

          // Find all mutual likes between the user's friends and the matched user's friends
          for (const userFriendId of userDoubleDateFriendIds) {
            for (const matchedUserFriendId of matchedUserDoubleDateFriendIds) {
              // Check if these friends have liked each other
              const friendSwipe1 = await Swipe.findOne({
                user: userFriendId,
                swipedUser: matchedUserFriendId,
                direction: "right",
              });

              const friendSwipe2 = await Swipe.findOne({
                user: matchedUserFriendId,
                swipedUser: userFriendId,
                direction: "right",
              });

              if (friendSwipe1 && friendSwipe2) {
                // We found a mutual like between friends!
                doubleDateFriendsFound.push({
                  userFriend: userFriendId,
                  matchedUserFriend: matchedUserFriendId,
                });

                // Create or get a match for these friends
                let friendMatch = await Match.findOne({
                  $or: [
                    { user: userFriendId, matchedUser: matchedUserFriendId },
                    { user: matchedUserFriendId, matchedUser: userFriendId },
                  ],
                });

                if (!friendMatch) {
                  friendMatch = new Match({
                    user: userFriendId,
                    matchedUser: matchedUserFriendId,
                    matchType: "user-to-user",
                    status: "accepted",
                  });
                  await friendMatch.save();
                }

                // Add to match pairs
                matchPairs.push({
                  user1: new mongoose.Types.ObjectId(userFriendId),
                  user2: new mongoose.Types.ObjectId(matchedUserFriendId),
                  relationship: "match",
                });
              }
            }
          }

          // If we found at least one friend match, create a double date group chat
          if (doubleDateFriendsFound.length > 0) {
            // Collect all participants
            const participants = new Set<string>([
              req.user._id.toString(),
              swipedUserId.toString(),
            ]);

            // Add all friends from double date matches
            doubleDateFriendsFound.forEach((match) => {
              participants.add(match.userFriend);
              participants.add(match.matchedUserFriend);
            });

            // Create the group chat with all participants
            const groupChatName = `${
              currentUser?.name || "User"
            } & Friends Double Date`;

            const groupChat = new GroupChat({
              name: groupChatName,
              participants: Array.from(participants).map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
              creator: req.user._id,
              createdFromMatches: [match._id],
              matchPairs: matchPairs,
              isDoubleDateChat: true,
            });

            await groupChat.save();

            // Return match data with the group chat information
            res.status(201).json({
              swipe,
              isMatch: true,
              hasGroupChat: true,
              groupChat: {
                _id: groupChat._id,
                name: groupChat.name,
                participants: Array.from(participants),
                isDoubleDateChat: true,
              },
              matchDetails: {
                _id: match._id,
                currentUser,
                matchedUser,
                message: "You have a double date match!",
                doubleDateMatchesCount: doubleDateFriendsFound.length,
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
