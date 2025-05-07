import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  content: string;
  match?: mongoose.Types.ObjectId;
  groupChat?: mongoose.Types.ObjectId;
  read: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    groupChat: { type: Schema.Types.ObjectId, ref: "GroupChat" },
    read: { type: Boolean, default: false },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  {
    timestamps: true,
  }
);

// Message must be associated with either a match or a group chat
messageSchema.pre("validate", function (next) {
  if (!this.match && !this.groupChat) {
    next(
      new Error(
        "Message must be associated with either a match or a group chat"
      )
    );
  } else if (this.match && this.groupChat) {
    next(
      new Error(
        "Message cannot be associated with both a match and a group chat"
      )
    );
  } else {
    next();
  }
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);
