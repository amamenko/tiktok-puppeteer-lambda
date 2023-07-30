import mongoose from "mongoose";

export const dailyLiveSchema = new mongoose.Schema(
  {
    date: String,
    lives: [
      {
        roomID: String,
        userID: String,
        diamonds: Number,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
  },
  { timestamps: true }
);
