import { Document, Model } from 'mongoose';
import { IUser } from './User.d';
import { IGroup } from './Group.d';

export interface IMatch extends Document {
  user: IUser['_id'];
  matchedUser: IUser['_id'];
  userGroup?: IGroup['_id'];
  matchedGroup?: IGroup['_id'];
  status: 'pending' | 'accepted' | 'rejected';
  matchType: 'user-to-user' | 'user-to-group' | 'group-to-group';
  createdAt: Date;
}

export interface MatchModel extends Model<IMatch> {} 