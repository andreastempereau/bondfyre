import { Document, Model, Types } from "mongoose";

/**
 * User related types
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  bio?: string;
  interests: string[];
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserModel extends Model<IUser> {}

/**
 * Group related types
 */
export interface IGroup extends Document {
  name: string;
  description?: string;
  bio?: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  isPrivate: boolean;
  maxMembers: number;
  inviteCode: string;
  interests?: string[];
  photos?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupModel extends Model<IGroup> {}

/**
 * Match related types
 */
export interface IMatch extends Document {
  user: Types.ObjectId;
  matchedUser: Types.ObjectId;
  userGroup?: Types.ObjectId;
  matchedGroup?: Types.ObjectId;
  matchType: "user-to-user" | "user-to-group" | "group-to-group";
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchModel extends Model<IMatch> {}

/**
 * Message related types
 */
export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  match: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageModel extends Model<IMessage> {}

/**
 * Swipe related types
 */
export interface ISwipe extends Document {
  user: Types.ObjectId;
  swipedUser: Types.ObjectId;
  direction: "left" | "right";
  createdAt: Date;
  updatedAt: Date;
}

export interface SwipeModel extends Model<ISwipe> {}

/**
 * Auth middleware types
 */
export interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any; // Using 'any' to match the existing declaration
    }
  }
}
