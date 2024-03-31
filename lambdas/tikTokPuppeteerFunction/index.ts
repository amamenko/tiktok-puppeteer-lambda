import "dotenv/config";
import { Context, APIGatewayProxyCallback } from "aws-lambda";
import mongoose from "mongoose";
import { userSchema } from "./models/User";
import { dailyLiveSchema } from "./models/DailyLive";
import { previousWeekTop100Schema } from "./models/PreviousWeekTop100";
import { currentTop100LivesSchema } from "./models/CurrentTop100Lives";
import { scrapeTikTok } from "../../functions/scrapeTikTok";

export let conn = null;

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
    conn.model("PreviousWeekTop100", previousWeekTop100Schema);
    conn.model("CurrentTop100Lives", currentTop100LivesSchema);
  }

  return await scrapeTikTok();
};
