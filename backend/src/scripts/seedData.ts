import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/User";
import { Group } from "../models/Group";
import { Match } from "../models/Match";
import { Swipe } from "../models/Swipe";
import { Message } from "../models/Message";
import { GroupChat } from "../models/GroupChat";
import { FriendRequest } from "../models/FriendRequest";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bondfyre")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Helper function to generate a random array of elements from a source array
const getRandomSubset = <T>(array: T[], max: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * max) + 1;
  return shuffled.slice(0, count);
};

// Generate a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Clear all collections before seeding
const clearCollections = async () => {
  try {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Match.deleteMany({});
    await Swipe.deleteMany({});
    await Message.deleteMany({});
    await GroupChat.deleteMany({});
    await FriendRequest.deleteMany({});
    console.log("All collections cleared");
  } catch (error) {
    console.error("Error clearing collections:", error);
    process.exit(1);
  }
};

// Create dummy users
const createUsers = async (count: number) => {
  console.log(`Creating ${count} users...`);
  const users = [];

  const genders = ["male", "female", "other"];
  const interestOptions = [
    "hiking",
    "movies",
    "reading",
    "cooking",
    "travel",
    "photography",
    "music",
    "dancing",
    "gaming",
    "yoga",
    "fitness",
    "art",
    "technology",
    "fashion",
    "sports",
  ];

  const hashedPassword = await bcrypt.hash("password123", 10);

  for (let i = 0; i < count; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const interests = getRandomSubset(interestOptions, 5);

    // Generate 1-3 photos
    const photos = Array.from({ length: getRandomInt(1, 3) }, () =>
      faker.image.urlLoremFlickr({
        category: gender === "other" ? "people" : gender,
      })
    );

    const user = new User({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword, // Same password for all users for easier testing
      age: getRandomInt(18, 50),
      gender,
      bio: faker.lorem.paragraph(),
      interests,
      photos,
      username: faker.internet.username(),
      phoneNumber: faker.phone.number(),
    });

    const savedUser = await user.save();
    users.push(savedUser);
  }

  console.log(`Created ${users.length} users`);
  return users;
};

// Create friend requests and add friends
const createFriendships = async (users: any[]) => {
  console.log("Creating friendships...");
  const friendRequests = [];

  // Each user sends 1-3 friend requests
  for (const user of users) {
    const otherUsers = users.filter(
      (u) => u._id && user._id && u._id.toString() !== user._id.toString()
    );
    const requestCount = getRandomInt(1, 3);

    const recipients = getRandomSubset(otherUsers, requestCount);

    for (const recipient of recipients) {
      // Random status with bias toward accepted
      const randomNum = Math.random();
      let status = "pending";

      if (randomNum < 0.7) {
        status = "accepted";
      } else if (randomNum < 0.9) {
        status = "rejected";
      }

      try {
        const friendRequest = new FriendRequest({
          sender: user._id,
          recipient: recipient._id,
          status,
        });

        await friendRequest.save();
        friendRequests.push(friendRequest);

        // If accepted, add to friends array for both users
        if (status === "accepted") {
          await User.findByIdAndUpdate(user._id, {
            $addToSet: { friends: recipient._id },
          });

          await User.findByIdAndUpdate(recipient._id, {
            $addToSet: { friends: user._id },
          });
        }
      } catch (error) {
        // Skip duplicate friend requests
        console.log("Skipping duplicate friend request");
      }
    }
  }

  console.log(`Created ${friendRequests.length} friend requests`);
  return friendRequests;
};

// Create groups
const createGroups = async (users: any[]) => {
  console.log("Creating groups...");
  const groups = [];

  // Create a group for about 60% of users
  const groupCreators = getRandomSubset(users, Math.floor(users.length * 0.6));

  for (const creator of groupCreators) {
    // Get friends for this user
    const user = await User.findById(creator._id).populate("friends");

    if (!user?.friends || user.friends.length === 0) {
      continue; // Skip if user has no friends
    }

    // Add 1-3 friends to the group
    const memberIds = getRandomSubset(
      user.friends as mongoose.Types.ObjectId[],
      Math.min(3, user.friends.length)
    );

    // Always include the creator
    memberIds.push(user._id as any);

    const interestOptions = [
      "clubbing",
      "concerts",
      "bowling",
      "escape rooms",
      "karaoke",
      "board games",
      "wine tasting",
      "comedy shows",
      "dining out",
      "beach days",
    ];

    const group = new Group({
      name: faker.company.name() + " Group",
      bio: faker.lorem.paragraph(),
      interests: getRandomSubset(interestOptions, 4),
      photos: [faker.image.urlLoremFlickr({ category: "nightlife" })],
      members: memberIds,
      createdBy: user._id,
      inviteCode: faker.string.alphanumeric(8),
    });

    const savedGroup = await group.save();
    groups.push(savedGroup);
  }

  console.log(`Created ${groups.length} groups`);
  return groups;
};

// Create swipes
const createSwipes = async (users: any[]) => {
  console.log("Creating swipes...");
  const swipes = [];

  // Each user swipes on several other users
  for (const user of users) {
    const otherUsers = users.filter(
      (u) => u._id.toString() !== user._id.toString()
    );
    const swipeCount = getRandomInt(5, 15);

    const swipedUsers = getRandomSubset(otherUsers, swipeCount);

    for (const swipedUser of swipedUsers) {
      try {
        const direction = Math.random() < 0.7 ? "right" : "left"; // 70% right swipes

        const swipe = new Swipe({
          user: user._id,
          swipedUser: swipedUser._id,
          direction,
        });

        await swipe.save();
        swipes.push(swipe);
      } catch (error) {
        // Skip duplicate swipes
        console.log("Skipping duplicate swipe");
      }
    }
  }

  console.log(`Created ${swipes.length} swipes`);
  return swipes;
};

// Create matches
const createMatches = async (_users: any[], groups: any[]) => {
  console.log("Creating matches...");
  const matches = [];

  // Find mutual right swipes
  const rightSwipes = await Swipe.find({ direction: "right" });

  // Create a map of user ID to users they swiped right on
  const userSwipes = new Map<string, string[]>();

  rightSwipes.forEach((swipe) => {
    const userId = swipe.user.toString();
    const swipedUserId = swipe.swipedUser.toString();

    if (!userSwipes.has(userId)) {
      userSwipes.set(userId, []);
    }

    userSwipes.get(userId)?.push(swipedUserId);
  });

  // Find mutual swipes
  for (const [userId, swipedUserIds] of userSwipes.entries()) {
    for (const swipedUserId of swipedUserIds) {
      // Check if there's a mutual right swipe
      if (userSwipes.get(swipedUserId)?.includes(userId)) {
        try {
          // Check if this match already exists
          const existingMatch = await Match.findOne({
            $or: [
              { user: userId, matchedUser: swipedUserId },
              { user: swipedUserId, matchedUser: userId },
            ],
          });

          if (!existingMatch) {
            const match = new Match({
              user: userId,
              matchedUser: swipedUserId,
              matchType: "user-to-user",
              status: "accepted",
            });

            await match.save();
            matches.push(match);
          }
        } catch (error) {
          console.log("Error creating match:", error);
        }
      }
    }
  }

  // Create some group matches
  if (groups.length > 1) {
    const matchCount = Math.min(10, Math.floor(groups.length / 2));

    for (let i = 0; i < matchCount; i++) {
      const group1 = groups[getRandomInt(0, groups.length - 1)];
      let group2 = groups[getRandomInt(0, groups.length - 1)];

      // Ensure different groups
      while (
        group1._id &&
        group2._id &&
        group1._id.toString() === group2._id.toString()
      ) {
        group2 = groups[getRandomInt(0, groups.length - 1)];
      }

      try {
        // Get a member from each group
        if (group1.members && group2.members) {
          const user1 = await User.findById(group1.members[0]);
          const user2 = await User.findById(group2.members[0]);

          if (user1 && user2) {
            const match = new Match({
              user: user1._id,
              matchedUser: user2._id,
              userGroup: group1._id,
              matchedGroup: group2._id,
              matchType: "group-to-group",
              status: "accepted",
            });

            await match.save();
            matches.push(match);
          }
        }
      } catch (error) {
        console.log("Error creating group match:", error);
      }
    }
  }

  console.log(`Created ${matches.length} matches`);
  return matches;
};

// Create group chats
const createGroupChats = async (matches: any[], users: any[]) => {
  console.log("Creating group chats...");
  const groupChats = [];

  // Find group-to-group matches
  const groupMatches = matches.filter(
    (match) => match.matchType === "group-to-group"
  );

  for (const match of groupMatches) {
    try {
      // Get the groups involved
      const userGroup = await Group.findById(match.userGroup);
      const matchedGroup = await Group.findById(match.matchedGroup);

      if (!userGroup || !matchedGroup) continue;

      // Combine participants from both groups
      const participants = [
        ...userGroup.members.map((id: any) => id.toString()),
        ...matchedGroup.members.map((id: any) => id.toString()),
      ];

      // Remove duplicates
      const uniqueParticipants = [...new Set(participants)];

      const groupChat = new GroupChat({
        name: `${userGroup.name} + ${matchedGroup.name}`,
        participants: uniqueParticipants,
        creator: match.user,
        createdFromMatches: [match._id],
      });

      const savedGroupChat = await groupChat.save();
      groupChats.push(savedGroupChat);
    } catch (error) {
      console.log("Error creating group chat:", error);
    }
  }

  // Also create a few additional group chats with random users
  const additionalChats = 5;

  for (let i = 0; i < additionalChats; i++) {
    const participantCount = getRandomInt(3, 6);
    const participants = getRandomSubset(users, participantCount);
    const creator = participants[0];

    try {
      const groupChat = new GroupChat({
        name: `${faker.word.adjective()} ${faker.word.noun()} Chat`,
        participants: participants.map((p) => p._id),
        creator: creator._id,
        createdFromMatches: [], // No matches for these random chats
      });

      const savedGroupChat = await groupChat.save();
      groupChats.push(savedGroupChat);
    } catch (error) {
      console.log("Error creating additional group chat:", error);
    }
  }

  console.log(`Created ${groupChats.length} group chats`);
  return groupChats;
};

// Create messages
const createMessages = async (
  _users: any[],
  matches: any[],
  groupChats: any[]
) => {
  console.log("Creating messages...");
  const messages = [];

  // Make sure we have matches and groupChats
  if (!matches || matches.length === 0) {
    console.log("No matches found, skipping direct messages");
  } else {
    // Create messages for direct matches
    const userMatches = matches.filter(
      (match) => match.matchType === "user-to-user"
    );

    for (const match of userMatches) {
      const messageCount = getRandomInt(2, 10);
      const user1 = match.user;
      const user2 = match.matchedUser;

      for (let i = 0; i < messageCount; i++) {
        const sender = i % 2 === 0 ? user1 : user2;
        const receiver = i % 2 === 0 ? user2 : user1;

        try {
          const message = new Message({
            sender,
            receiver,
            content: faker.lorem.sentence(),
            match: match._id,
            read: Math.random() < 0.8, // 80% of messages are read
            readBy: [sender], // Sender always reads their own message
          });

          // Receiver has 70% chance of having read the message
          if (Math.random() < 0.7) {
            message.readBy.push(receiver);
          }

          await message.save();
          messages.push(message);
        } catch (error) {
          console.log("Error creating match message:", error);
        }
      }
    }
  }

  // Create messages for group chats
  if (!groupChats || groupChats.length === 0) {
    console.log("No group chats found, skipping group chat messages");
  } else {
    for (const groupChat of groupChats) {
      const messageCount = getRandomInt(5, 20);
      const participants = groupChat.participants;

      if (!participants || participants.length === 0) {
        console.log("No participants in group chat, skipping messages");
        continue;
      }

      let latestMessageId = null;

      for (let i = 0; i < messageCount; i++) {
        // Random sender from participants
        const senderIndex = getRandomInt(0, participants.length - 1);
        const sender = participants[senderIndex];

        // Random subset of participants have read the message
        const readByCount = getRandomInt(1, participants.length);
        const readBy = [sender]; // Sender always reads their own message

        // Add random readers
        const otherParticipants = participants.filter(
          (p: any) => p.toString() !== sender.toString()
        );
        const randomReaders = getRandomSubset(
          otherParticipants,
          readByCount - 1
        );
        readBy.push(...randomReaders);

        try {
          const message = new Message({
            sender,
            content: faker.lorem.sentence(),
            groupChat: groupChat._id,
            read: readBy.length === participants.length, // Marked as read if everyone has read it
            readBy,
          });

          const savedMessage = await message.save();
          messages.push(savedMessage);

          // Keep track of the latest message
          latestMessageId = savedMessage._id;
        } catch (error) {
          console.log("Error creating group chat message:", error);
        }
      }

      // Update the group chat with the latest message
      if (latestMessageId) {
        await GroupChat.findByIdAndUpdate(groupChat._id, {
          latestMessage: latestMessageId,
        });
      }
    }
  }

  console.log(`Created ${messages.length} messages`);
  return messages;
};

// Main function to seed data
const seedData = async () => {
  try {
    await clearCollections();

    const users = await createUsers(30);
    if (users && users.length > 0) {
      await createFriendships(users);
      const groups = await createGroups(users);
      await createSwipes(users);

      if (groups && groups.length > 0) {
        const matches = await createMatches(users, groups);
        if (matches && matches.length > 0) {
          const groupChats = await createGroupChats(matches, users);
          if (groupChats && groupChats.length > 0) {
            await createMessages(users, matches, groupChats);
          }
        }
      }
    }

    console.log("✅ Data seeding completed successfully!");

    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);

    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(1);
  }
};

// Run the seeding process
seedData();
