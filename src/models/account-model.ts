import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IAccount extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  password?: string;

  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema: Schema<IAccount> = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  providerAccountId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
    minlength: [8, "Password must be at least 8 characters."],
  },

  refreshToken: {
    type: String,
    default: null,
  },
  accessToken: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Number,
    default: null,
  },
  tokenType: {
    type: String,
    default: null,
  },
  scope: {
    type: String,
    default: null,
  },
  idToken: {
    type: String,
    default: null,
  },
  sessionState: {
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

// Hash the password before saving the account
accountSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

// accountSchema.()

const Account = mongoose.model<IAccount>("Account", accountSchema);

export default Account;
