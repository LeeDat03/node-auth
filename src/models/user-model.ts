import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";
import Account from "./account-model";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    requried: [true, "The name need to be provided"],
  },
  email: {
    type: String,
    required: [true, "The email need to be provided"],
    unique: [true, "The email is already in use"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
