import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  bio?: string;
  interests: string[];
  photos: string[];
  friends: mongoose.Types.ObjectId[];
  doubleDateFriends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  phoneNumber?: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    bio: { type: String, default: "" },
    interests: { type: [String], default: [] },
    photos: { type: [String], default: [] },
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    doubleDateFriends: [
      { type: Schema.Types.ObjectId, ref: "User", default: [], maxlength: 3 },
    ],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    phoneNumber: { type: String },
    username: {
      type: String,
      sparse: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          // If username is provided, it shouldn't be empty
          return v === undefined || v === null || v.trim().length > 0;
        },
        message: "Username cannot be an empty string",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
