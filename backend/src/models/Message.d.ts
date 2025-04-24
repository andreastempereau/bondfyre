import { Document, Model } from 'mongoose';
import { IUser } from './User.d';
import { IMatch } from './Match.d';

export interface IMessage extends Document {
  sender: IUser['_id'];
  receiver: IUser['_id'];
  content: string;
  read: boolean;
  match: IMatch['_id'];
  createdAt: Date;
}

export interface MessageModel extends Model<IMessage> {} 