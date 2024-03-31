import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    displayID: String,
    userID: String,
    avatar: String,
  },
  { timestamps: true }
);
