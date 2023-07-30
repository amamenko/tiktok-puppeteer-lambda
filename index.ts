import "dotenv/config";
import { Context, APIGatewayProxyCallback } from "aws-lambda";
import mongoose from "mongoose";
import { userSchema } from "./models/User";
import { dailyLiveSchema } from "./models/DailyLive";

let conn = null;

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER}.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`;

export const handler = async (
  event: any,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (conn == null) {
    conn = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await conn.asPromise();
    conn.model("DailyLive", dailyLiveSchema);
    conn.model("User", userSchema);
  }

  const User = conn.model("User");

  const doc = await User.findOne();
  console.log(doc);

  return doc;
};
