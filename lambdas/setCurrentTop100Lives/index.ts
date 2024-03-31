import "dotenv/config";
import { Context, APIGatewayProxyCallback } from "aws-lambda";
import mongoose from "mongoose";
import { dailyLiveSchema } from "./models/DailyLive";
import { previousWeekTop100Schema } from "./models/PreviousWeekTop100";
import { currentTop100LivesSchema } from "./models/CurrentTop100Lives";
import { setCurrentTop100Lives } from "./functions/setCurrentTop100Lives";
import { logger } from "./logger/logger";

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
    conn.model("PreviousWeekTop100", previousWeekTop100Schema);
    conn.model("CurrentTop100Lives", currentTop100LivesSchema);
  }

  try {
    await setCurrentTop100Lives();
    logger("server").info("Finished updating current top 100 lives.");
    return true;
  } catch {
    logger("server").error("Error while updating current top 100 lives.");
    return false;
  }
};
