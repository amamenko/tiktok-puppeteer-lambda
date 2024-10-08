import "dotenv/config";
import { Context, APIGatewayProxyCallback } from "aws-lambda";
import mongoose from "mongoose";
import { userSchema } from "./models/User";
import { dailyLiveSchema } from "./models/DailyLive";
import { previousWeekTop100Schema } from "./models/PreviousWeekTop100";
import { currentTop100LivesSchema } from "./models/CurrentTop100Lives";
import { scrapeTikTok } from "./functions/scrapeTikTok";
import { startXvfb } from "./functions/utils/startXvfb";

export let conn = null;
let fetch = undefined;

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER}.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`;

exports.handler = async (
  event: any,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  // Dynamically import fetch
  if (!fetch) fetch = (await import("node-fetch")).default;
  globalThis.fetch = fetch;

  context.callbackWaitsForEmptyEventLoop = false;

  // Start Xvfb before executing browser-based tasks
  await startXvfb();

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
