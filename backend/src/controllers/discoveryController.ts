import { Request, Response } from "express";
import { Group, Match, Swipe, User } from "../models";

/**
 * Discover groups based on user preferences and connections
 * Uses multiple algorithms to find relevant groups:
 * 1. Interest-based matching
 * 2. Social connections (friends already in groups)
 * 3. Activity level and engagement
 * 4. Size and growth rate of groups
 */
export const discoverGroups = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { limit = 20, offset = 0, excludeSwiped = "false" } = req.query;
    const parsedLimit = Math.min(parseInt(limit as string) || 20, 50);
    const parsedOffset = parseInt(offset as string) || 0;
    const shouldExcludeSwiped = excludeSwiped === "true";

    // Get current user with interests
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Find groups the user is already a member of
    const userGroupIds = await Group.find({ members: req.user._id }).distinct(
      "_id"
    );

    // Get group IDs the user has already swiped on if excludeSwiped is true
    let swipedGroupIds: any[] = [];
    if (shouldExcludeSwiped) {
      swipedGroupIds = await Swipe.find({ user: req.user._id }).distinct(
        "swipedUser"
      );
    }

    // Combine all group IDs to exclude
    const excludeGroupIds = [
      ...userGroupIds,
      ...(shouldExcludeSwiped ? swipedGroupIds : []),
    ];

    // Get user's matches to identify social connections
    const userMatches = await Match.find({
      $or: [{ user: req.user._id }, { matchedUser: req.user._id }],
      status: "matched",
    });

    // Extract IDs of users the current user is connected with
    const connectedUserIds = userMatches.map((match) =>
      match.user.toString() === req.user._id.toString()
        ? match.matchedUser
        : match.user
    );

    // Find groups where connected users are members (social proof)
    const socialGroupsQuery =
      connectedUserIds.length > 0
        ? Group.find({
            _id: { $nin: excludeGroupIds },
            members: { $in: connectedUserIds },
          })
        : Group.find({ _id: { $nin: excludeGroupIds } });

    const socialGroups = await socialGroupsQuery
      .limit(parsedLimit / 2) // Half from social connections
      .populate("members", "name photos")
      .lean();

    // Set of groups already added through social connections
    const socialGroupIds = socialGroups.map((group) => group._id);

    // Interests-based discovery
    const interestGroups = await Group.find({
      _id: {
        $nin: [...excludeGroupIds, ...socialGroupIds],
      },
      interests: {
        $in: currentUser.interests,
      },
      isPrivate: false,
    })
      .sort({ createdAt: -1 })
      .limit(parsedLimit - socialGroups.length)
      .populate("members", "name photos")
      .lean();

    // Combine results prioritizing social connections first
    const recommendedGroups = [...socialGroups, ...interestGroups];

    // Calculate relevance score for each group
    const scoredGroups = recommendedGroups.map((group) => {
      // Base score
      let score = 50;

      // Interest matching (each matching interest adds points)
      const matchingInterests =
        group.interests?.filter((interest) =>
          currentUser.interests.includes(interest)
        ) || [];
      score += matchingInterests.length * 10;

      // Social connections (each connection in the group adds points)
      const connectionsInGroup = group.members.filter((member: any) =>
        connectedUserIds.some((id) => id.toString() === member._id.toString())
      ).length;
      score += connectionsInGroup * 15;

      // Group size score (medium-sized groups get bonus)
      if (group.members.length >= 3 && group.members.length <= 10) {
        score += 10;
      }

      // Activity level (based on member count - simplified proxy for activity)
      score += Math.min(group.members.length * 2, 20);

      return {
        ...group,
        relevanceScore: score,
        matchingInterests,
        mutualConnections: connectionsInGroup,
      };
    });

    // Sort by relevance score
    scoredGroups.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      groups: scoredGroups.slice(0, parsedLimit),
      total: scoredGroups.length,
      hasMore: scoredGroups.length > parsedOffset + parsedLimit,
    });
  } catch (error: any) {
    console.error("Error in discoverGroups:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Discover users based on group memberships, interests and social proximity
 * Uses multiple algorithms:
 * 1. Interest-based matching
 * 2. Group proximity (users in similar groups)
 * 3. Second-degree connections
 * 4. Activity levels and engagement
 */
export const discoverUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { limit = 20, offset = 0, excludeSwiped = "true" } = req.query;
    const parsedLimit = Math.min(parseInt(limit as string) || 20, 50);
    const parsedOffset = parseInt(offset as string) || 0;
    const shouldExcludeSwiped = excludeSwiped === "true";

    // Get current user with interests
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get IDs of users that have already been swiped on if excludeSwiped is true
    let swipedUserIds: any[] = [];
    if (shouldExcludeSwiped) {
      swipedUserIds = await Swipe.find({ user: req.user._id }).distinct(
        "swipedUser"
      );
    }

    // Get IDs of users that have already been matched
    const matchedUserIds = await Match.find({
      $or: [{ user: req.user._id }, { matchedUser: req.user._id }],
    }).distinct("user");

    // Combine all IDs to exclude
    const excludeIds = [
      ...(shouldExcludeSwiped ? swipedUserIds : []),
      ...matchedUserIds,
      req.user._id,
    ];

    // Find groups the user is a member of
    const userGroups = await Group.find({ members: req.user._id });
    const userGroupIds = userGroups.map((group) => group._id);

    // Find second-degree connections (users who are in same groups)
    const secondDegreeUsersQuery =
      userGroupIds.length > 0
        ? User.find({
            _id: { $ne: req.user._id, $nin: excludeIds },
          })
            .where("_id")
            .in(
              await Group.find({ _id: { $in: userGroupIds } }).distinct(
                "members"
              )
            )
        : User.find({ _id: { $nin: excludeIds } });

    const secondDegreeUsers = await secondDegreeUsersQuery
      .limit(parsedLimit / 2)
      .select("name photos age gender bio interests")
      .lean();

    // Set of users already added through second-degree connections
    const secondDegreeUserIds = secondDegreeUsers.map((user) => user._id);

    // Interests-based discovery (for remaining slots)
    const interestMatchUsers = await User.find({
      _id: { $nin: [...excludeIds, ...secondDegreeUserIds] },
      interests: { $in: currentUser.interests },
    })
      .sort({ createdAt: -1 })
      .limit(parsedLimit - secondDegreeUsers.length)
      .select("name photos age gender bio interests")
      .lean();

    // Combine results prioritizing second-degree connections first
    const recommendedUsers = [...secondDegreeUsers, ...interestMatchUsers];

    // Calculate relevance score for each user
    const scoredUsers = recommendedUsers.map((user) => {
      // Base score
      let score = 50;

      // Interest matching (each matching interest adds points)
      const matchingInterests =
        user.interests?.filter((interest) =>
          currentUser.interests.includes(interest)
        ) || [];
      score += matchingInterests.length * 10;

      // Gender preference match (simplified)
      if (
        (currentUser.gender === "male" && user.gender === "female") ||
        (currentUser.gender === "female" && user.gender === "male")
      ) {
        score += 20;
      }

      // Age proximity (closer age = higher score)
      if (currentUser.age && user.age) {
        const ageDiff = Math.abs(currentUser.age - user.age);
        if (ageDiff <= 2) score += 15;
        else if (ageDiff <= 5) score += 10;
        else if (ageDiff <= 10) score += 5;
      }

      // Group proximity (shared groups)
      const isInSameGroups = secondDegreeUserIds.includes(user._id);
      if (isInSameGroups) {
        score += 25;
      }

      return {
        ...user,
        relevanceScore: score,
        matchingInterests,
        isGroupConnection: isInSameGroups,
      };
    });

    // Sort by relevance score
    scoredUsers.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      users: scoredUsers.slice(0, parsedLimit),
      total: scoredUsers.length,
      hasMore: scoredUsers.length > parsedOffset + parsedLimit,
    });
  } catch (error: any) {
    console.error("Error in discoverUsers:", error);
    res.status(500).json({ message: error.message });
  }
};
