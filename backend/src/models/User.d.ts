import { Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  bio?: string;
  interests?: string[];
  photos?: string[];
  friends: Types.ObjectId[];
  doubleDateFriends: Types.ObjectId[]; // Friends selected for double dates
  friendRequests: Types.ObjectId[];
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserModel extends Model<IUser> {} 