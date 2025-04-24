import { Document, Model } from 'mongoose';
import { IUser } from './User.d';

export interface ISwipe extends Document {
  user: IUser['_id'];
  swipedUser: IUser['_id'];
  direction: 'left' | 'right';
  createdAt: Date;
}

export interface SwipeModel extends Model<ISwipe> {} 