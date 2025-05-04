import { Request, Response } from "express";
import { Swipe, Match, User } from "../models";

export const createSwipe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { swipedUserId, direction } = req.body;

    // Check if user has already swiped on this profile
    const existingSwipe = await Swipe.findOne({
      user: req.user._id,
      swipedUser: swipedUserId,
    });

    if (existingSwipe) {
      res
        .status(400)
        .json({ message: "You have already swiped on this profile" });
      return;
    }

    // Create new swipe
    const swipe = new Swipe({
      user: req.user._id,
      swipedUser: swipedUserId,
      direction,
    });

    await swipe.save();

    // If right swipe, check if there's a mutual match
    if (direction === "right") {
      const mutualSwipe = await Swipe.findOne({
        user: swipedUserId,
        swipedUser: req.user._id,
        direction: "right",
      });

      if (mutualSwipe) {
        // Get both users' information for the match response
        const currentUser = await User.findById(req.user._id).select(
          "name photos age gender"
        );
        const matchedUser = await User.findById(swipedUserId).select(
          "name photos age gender"
        );

        if (!currentUser || !matchedUser) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        // Create a match with status directly set to accepted
        const match = new Match({
          user: req.user._id,
          matchedUser: swipedUserId,
          matchType: "user-to-user",
          status: "accepted", // Changed from 'pending' to 'accepted'
        });

        await match.save();

        // Return match data with user information for notifications
        res.status(201).json({
          swipe,
          isMatch: true,
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
      .populate("swipedUser", "name photos age gender")
      .sort({ createdAt: -1 });

    res.json(swipes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPotentialMatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get user's profile
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get IDs of users that have already been swiped on
    const swipedUserIds = await Swipe.find({ user: req.user._id }).distinct(
      "swipedUser"
    );

    // Get IDs of users that have already swiped on the current user
    const swipedByUserIds = await Swipe.find({
      swipedUser: req.user._id,
    }).distinct("user");

    // Combine all IDs to exclude
    const excludeIds = [...swipedUserIds, ...swipedByUserIds, req.user._id];

    // Find potential matches based on gender preference and age range
    const potentialMatches = await User.find({
      _id: { $nin: excludeIds },
      gender: user.gender === "male" ? "female" : "male",
      ...(user.age
        ? {
            age: {
              $gte: user.age - 5,
              $lte: user.age + 5,
            },
          }
        : {}),
    })
      .select("name photos age gender bio interests")
      .limit(10);

    res.json(potentialMatches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
