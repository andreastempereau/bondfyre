import { ReactNode } from "react";

/**
 * User related types
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  bio?: string;
  interests: string[];
  photos: string[];
}

/**
 * Member types
 */
export interface Member {
  _id: string;
  name: string;
  photos: string[];
}

/**
 * Group types
 */
export interface Group {
  _id: string;
  name: string;
  description: string;
  bio?: string;
  members: Member[];
  interests: string[];
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
  inviteCode: string;
  photos?: string[];
}

/**
 * Match related types
 */
export interface Match {
  _id: string;
  user: User | string;
  matchedUser: User | string;
  userGroup?: Group | string;
  matchedGroup?: Group | string;
  matchType: "user-to-user" | "user-to-group" | "group-to-group";
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message related types
 */
export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  content: string;
  match: Match | string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Swipe types
 */
export interface Swipe {
  _id: string;
  user: User | string;
  swipedUser: User | string;
  direction: SwipeDirection;
  createdAt: Date;
  updatedAt: Date;
}

export type SwipeDirection = "left" | "right";

// Adding default export to prevent Expo Router from treating this as a route
export default {};
