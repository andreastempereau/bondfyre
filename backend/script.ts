import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { User, IUser } from "./src/models/User";
import { Group, IGroup } from "./src/models/Group";
import { Match, IMatch } from "./src/models/Match";
import { Swipe, ISwipe } from "./src/models/Swipe";
import { Message, IMessage } from "./src/models/Message";
import { config } from "dotenv";
// Removed the import for unique-username-generator as it's not used in the script
// Using Bun's built-in sleep function instead of Node's setTimeout

// Load environment variables
config();

// MongoDB connection string - use env variable or default local connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bondfyre";

// Configuration
const NUM_USERS = 50;
const NUM_GROUPS = 15;
const NUM_SWIPES_PER_USER = 20;
const NUM_MATCHES = 30;
const NUM_MESSAGES_PER_MATCH = 10;
// Double date app - groups can only have 2 people
const GROUP_SIZE = 2;
const POSSIBLE_INTERESTS = [
  "Photography",
  "Travel",
  "Cooking",
  "Hiking",
  "Movies",
  "Gaming",
  "Reading",
  "Music",
  "Art",
  "Technology",
  "Sports",
  "Fitness",
  "Dancing",
  "Writing",
  "Fashion",
  "Yoga",
  "Meditation",
  "Coffee",
  "Wine",
  "Foodie",
  "Pets",
  "Cycling",
  "Running",
  "Swimming",
  "Climbing",
];
const POSSIBLE_GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const POSSIBLE_MATCH_TYPES = [
  "user-to-user",
  "user-to-group",
  "group-to-group",
];

// Helper function to generate a random profile photo URL
const generateProfilePicture = (gender: string) => {
  let seed = faker.string.uuid();
  if (gender === "Male") {
    return `https://randomuser.me/api/portraits/men/${Math.floor(
      Math.random() * 99
    )}.jpg`;
  } else if (gender === "Female") {
    return `https://randomuser.me/api/portraits/women/${Math.floor(
      Math.random() * 99
    )}.jpg`;
  } else {
    return `https://i.pravatar.cc/300?u=${seed}`;
  }
};

// Helper function to get random items from an array
const getRandomItems = (array: any[], min = 1, max: number = array.length) => {
  const numItems = faker.number.int({ min, max });
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numItems);
};

// Helper function to generate an invite code
const generateInviteCode = () => {
  return faker.string.alphanumeric(8).toUpperCase();
};

// Main function to create all dummy data
async function createDummyData() {
  try {
    console.log("Connecting to MongoDB...");
    
    // Add connection options and better error handling
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log("Connected to MongoDB!");

    // Clear all existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Group.deleteMany({});
    await Match.deleteMany({});
    await Swipe.deleteMany({});
    await Message.deleteMany({});

    // Create dummy users
    console.log("Creating dummy users...");
    const dummyUsers: mongoose.Document[] = [];

    // Create users with fake data
    for (let i = 0; i < NUM_USERS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const email = faker.internet.email({
        firstName,
        lastName,
        provider: "example.com",
      });
      const gender = faker.helpers.arrayElement(POSSIBLE_GENDERS);

      const user = new User({
        name: fullName,
        email,
        password: "password123", // Simple password for all test users
        age: faker.number.int({ min: 18, max: 65 }),
        gender,
        bio: faker.lorem.paragraph(),
        interests: getRandomItems(POSSIBLE_INTERESTS, 2, 6),
        photos: [
          generateProfilePicture(gender),
          ...Array.from({ length: faker.number.int({ min: 0, max: 4 }) }).map(
            () => faker.image.urlPicsumPhotos()
          ),
        ],
      });

      await user.save();
      dummyUsers.push(user);

      if (i % 10 === 0) {
        console.log(`Created ${i} users...`);
      }
    }
    console.log(`Created ${dummyUsers.length} users!`);

    // Create dummy groups
    console.log("Creating dummy groups...");
    const dummyGroups: mongoose.Document[] = [];

    for (let i = 0; i < NUM_GROUPS; i++) {
      // Each group must have exactly 2 members for a double date app
      const membersPool = [...dummyUsers];
      const member1 = membersPool.splice(Math.floor(Math.random() * membersPool.length), 1)[0] as IUser;
      const member2 = membersPool.splice(Math.floor(Math.random() * membersPool.length), 1)[0] as IUser;
      const members = [member1, member2];
      const createdBy = member1;

      // Generate a group name that might represent a couple
      const groupName = `${(member1 as IUser).name.split(' ')[0]} & ${(member2 as IUser).name.split(' ')[0]}`;

      const group = new Group({
        name: groupName,
        bio: `We're a fun duo looking for a great double date! ${faker.lorem.sentence()}`,
        interests: getRandomItems(POSSIBLE_INTERESTS, 2, 5),
        photos: [
          // Include profile photos from both members plus some group photos
          ...members.map(member => (member as IUser).photos[0]),
          ...Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => faker.image.urlPicsumPhotos())
        ],
        members: members.map((member) => member._id),
        createdBy: createdBy._id,
        inviteCode: generateInviteCode(),
      });

      await group.save();
      dummyGroups.push(group);
    }
    console.log(`Created ${dummyGroups.length} groups!`);

    // Create dummy swipes
    console.log("Creating dummy swipes...");
    let swipesCreated = 0;

    for (const user of dummyUsers) {
      const userObj = user as IUser;
      // Each user swipes on a random number of users
      const usersToSwipeOn = getRandomItems(
        dummyUsers.filter((u) => u._id.toString() !== userObj._id.toString()),
        5,
        Math.min(NUM_SWIPES_PER_USER, NUM_USERS - 1)
      ) as IUser[];

      for (const swipedUser of usersToSwipeOn) {
        // Randomly decide swipe direction (70% right, 30% left)
        const direction = Math.random() < 0.7 ? "right" : "left";

        try {
          const swipe = new Swipe({
            user: userObj._id,
            swipedUser: swipedUser._id,
            direction,
          });

          await swipe.save();
          swipesCreated++;
        } catch (error) {
          // Potential duplicate swipe - ignore
        }
      }
    }
    console.log(`Created ${swipesCreated} swipes!`);

    // Create dummy matches
    console.log("Creating dummy matches...");
    const dummyMatches: mongoose.Document[] = [];

    for (let i = 0; i < NUM_MATCHES; i++) {
      const matchType = faker.helpers.arrayElement(POSSIBLE_MATCH_TYPES);
      let match;

      if (matchType === "user-to-user") {
        // Random users for user-to-user match
        const [user1, user2] = getRandomItems(dummyUsers, 2, 2) as IUser[];

        match = new Match({
          user: user1._id,
          matchedUser: user2._id,
          matchType,
          status: faker.helpers.arrayElement([
            "pending",
            "accepted",
            "rejected",
          ]),
        });
      } else if (matchType === "user-to-group") {
        // Random user and group for user-to-group match
        const user = faker.helpers.arrayElement(dummyUsers) as IUser;
        const group = faker.helpers.arrayElement(dummyGroups) as IGroup;
        const groupMember = faker.helpers.arrayElement(
          await User.find({ _id: { $in: group.members } })
        ) as IUser;

        match = new Match({
          user: user._id,
          matchedUser: groupMember._id, // A representative from the group
          userGroup: null,
          matchedGroup: group._id,
          matchType,
          status: faker.helpers.arrayElement([
            "pending",
            "accepted",
            "rejected",
          ]),
        });
      } else {
        // group-to-group
        // Random groups for group-to-group match
        const [group1, group2] = getRandomItems(dummyGroups, 2, 2) as IGroup[];
        const group1Member = faker.helpers.arrayElement(
          await User.find({ _id: { $in: group1.members } })
        ) as IUser;
        const group2Member = faker.helpers.arrayElement(
          await User.find({ _id: { $in: group2.members } })
        ) as IUser;

        match = new Match({
          user: group1Member._id, // A representative from the first group
          matchedUser: group2Member._id, // A representative from the second group
          userGroup: group1._id,
          matchedGroup: group2._id,
          matchType,
          status: faker.helpers.arrayElement([
            "pending",
            "accepted",
            "rejected",
          ]),
        });
      }

      await match.save();
      dummyMatches.push(match);
    }
    console.log(`Created ${dummyMatches.length} matches!`);

    // Create dummy messages
    console.log("Creating dummy messages...");
    let messagesCreated = 0;

    // Filter matches that are accepted
    const acceptedMatches = await Match.find({ status: "accepted" });

    for (const match of acceptedMatches) {
      const matchObj = match as IMatch;

      // Generate a random number of messages for this match
      const numMessages = faker.number.int({
        min: 1,
        max: NUM_MESSAGES_PER_MATCH,
      });

      // Create messages with timestamps in order
      let messageDate = faker.date.recent({ days: 30 });

      for (let i = 0; i < numMessages; i++) {
        // Determine sender and receiver
        const isSenderFirstUser = Math.random() < 0.5;
        const sender = isSenderFirstUser ? matchObj.user : matchObj.matchedUser;
        const receiver = isSenderFirstUser
          ? matchObj.matchedUser
          : matchObj.user;

        // Create message
        const message = new Message({
          sender,
          receiver,
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          match: matchObj._id,
          read: Math.random() < 0.8, // 80% of messages are read
          createdAt: messageDate,
        });

        // Add 1-60 minutes to the previous message time
        messageDate = new Date(
          messageDate.getTime() + faker.number.int({ min: 1, max: 60 }) * 60000
        );

        await message.save();
        messagesCreated++;
      }
    }
    console.log(`Created ${messagesCreated} messages!`);

    console.log("All dummy data created successfully!");
  } catch (error) {
    console.error("Error creating dummy data:", error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
createDummyData().catch(console.error);
