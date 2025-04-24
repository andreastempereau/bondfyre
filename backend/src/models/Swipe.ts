import mongoose, { Document, Schema } from 'mongoose';

export interface ISwipe extends Document {
  user: mongoose.Types.ObjectId;
  swipedUser: mongoose.Types.ObjectId;
  direction: 'left' | 'right';
  createdAt: Date;
  updatedAt: Date;
}

const swipeSchema = new Schema<ISwipe>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  swipedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  direction: { 
    type: String, 
    enum: ['left', 'right'],
    required: true 
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only swipe on another user once
swipeSchema.index({ user: 1, swipedUser: 1 }, { unique: true });

export const Swipe = mongoose.model<ISwipe>('Swipe', swipeSchema); 