import { Document, Model } from 'mongoose';
import { IUser } from './User.d';

export interface IGroup extends Document {
  name: string;
  members: IUser['_id'][];
  bio?: string;
  interests?: string[];
  photos?: string[];
  createdBy: IUser['_id'];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupModel extends Model<IGroup> {} 