import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  bio: string;
  interests: string[];
  photos: string[];
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  interests: { type: [String], default: [] },
  photos: { type: [String], default: [] },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  inviteCode: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

export const Group = mongoose.model<IGroup>('Group', groupSchema); 