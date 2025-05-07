import mongoose, { Document, Schema } from "mongoose";

export interface IGroupChat extends Document {
  name: string;
  participants: mongoose.Types.ObjectId[];
  creator: mongoose.Types.ObjectId;
  createdFromMatches: mongoose.Types.ObjectId[];
  latestMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupChatSchema = new Schema<IGroupChat>(
  {
    name: { type: String, required: true },
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdFromMatches: [
      { type: Schema.Types.ObjectId, ref: "Match", required: true },
    ],
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
  }
);

export const GroupChat = mongoose.model<IGroupChat>(
  "GroupChat",
  groupChatSchema
);
