import mongoose from "mongoose";

export const previousWeekTop100Schema = new mongoose.Schema(
  {
    weekStarting: String,
    refreshAt: Number,
    updatedAt: Number,
    lives: [
      {
        displayID: String,
        userID: String,
        diamonds: Number,
        avatar: String,
        updatedAt: Date,
        lastWeekRank: Number,
      },
    ],
  },
  { timestamps: true }
);
