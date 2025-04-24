import { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  bio?: string;
  interests?: string[];
  photos?: string[];
  age?: number;
  gender?: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends Model<IUser> {} 