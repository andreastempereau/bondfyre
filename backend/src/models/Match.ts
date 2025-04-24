import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  user: mongoose.Types.ObjectId;
  matchedUser: mongoose.Types.ObjectId;
  userGroup?: mongoose.Types.ObjectId;
  matchedGroup?: mongoose.Types.ObjectId;
  matchType: 'user-to-user' | 'user-to-group' | 'group-to-group';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userGroup: { type: Schema.Types.ObjectId, ref: 'Group' },
  matchedGroup: { type: Schema.Types.ObjectId, ref: 'Group' },
  matchType: { 
    type: String, 
    enum: ['user-to-user', 'user-to-group', 'group-to-group'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const Match = mongoose.model<IMatch>('Match', matchSchema); 