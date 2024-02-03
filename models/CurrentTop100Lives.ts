import mongoose from "mongoose";

export const currentTop100LivesSchema = new mongoose.Schema(
  {
    weekStarting: String,
    refreshAt: Number,
    updatedAt: Number,
    lives: [
      {
        _id: String,
        updatedAt: Number,
        lastWeekRank: Number,
        roomID: String,
        userID: String,
        diamonds: Number,
        createdAt: Date,
      },
    ],
  },
  { timestamps: true }
);
