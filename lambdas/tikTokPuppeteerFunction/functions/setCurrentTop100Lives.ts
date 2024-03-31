import { getDateBoundaries } from "./getDateBoundaries";
import { conn } from "..";
import { getWeekStart } from "./utils/getWeekStart";
import { addDays, getUnixTime } from "date-fns";
import { logger } from "../logger/logger";
import { Live } from "../interfaces/live.interface";

interface LiveWithId extends Live {
  _id: string;
}

export const setCurrentTop100Lives = async () => {
  const {
    boundaryDatesArr,
    weekStartsOnDate,
    formattedCurrentDate,
    weekStartsOnFormatted,
  } = getDateBoundaries();
  const DailyLive = conn.model("DailyLive");
  const PreviousWeekTop100 = conn.model("PreviousWeekTop100");
  const CurrentTop100Lives = conn.model("CurrentTop100Lives");
  try {
    const dailyLiveLives = (await DailyLive.aggregate([
      { $match: { date: { $in: boundaryDatesArr } } },
      { $unwind: "$date" },
      { $unwind: "$createdAt" },
      { $unwind: "$updatedAt" },
      { $unwind: "$lives" },
      {
        $lookup: {
          from: "users",
          localField: "lives.userID",
          foreignField: "userID",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: "$userInfo.userID",
          diamonds: { $sum: "$lives.diamonds" },
          displayID: { $first: "$userInfo.displayID" },
          userID: { $first: "$userInfo.userID" },
          avatar: { $first: "$userInfo.avatar" },
          updatedAt: { $last: "$userInfo.updatedAt" },
        },
      },
    ])) as LiveWithId[];
    dailyLiveLives.sort((a, b) => Number(b.diamonds) - Number(a.diamonds));
    if (process.env.EXCLUDED_USER_IDS) {
      try {
        const parsedExcludedUserIds = JSON.parse(process.env.EXCLUDED_USER_IDS);
        if (
          Array.isArray(parsedExcludedUserIds) &&
          parsedExcludedUserIds.length > 0
        ) {
          parsedExcludedUserIds.forEach((excludedUserId: string) => {
            const index = dailyLiveLives.findIndex(
              (live) => live.userID === excludedUserId
            );
            if (index > -1) dailyLiveLives.splice(index, 1);
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    const topHundredLives = dailyLiveLives.slice(0, 100);
    const previousWeekStart = getWeekStart(1);
    const foundPreviousWeekDoc = await PreviousWeekTop100.findOne({
      weekStarting: previousWeekStart,
    });

    const foundPreviousWeekTop100Lives = foundPreviousWeekDoc?.lives || [];
    const topHundredLivesUnixUpdated = topHundredLives.map((live) => {
      const foundPreviousWeekRank = foundPreviousWeekTop100Lives?.findIndex(
        (prevLive: any) => prevLive._id === live._id
      );

      return {
        ...live,
        updatedAt: getUnixTime(live.updatedAt) * 1000,
        lastWeekRank:
          foundPreviousWeekRank === undefined ? -1 : foundPreviousWeekRank,
      };
    });

    const weekEndsOnDateUnix = getUnixTime(addDays(weekStartsOnDate, 7)) * 1000;
    const dailyLiveGen = await DailyLive.find({ date: formattedCurrentDate });

    const responseObj = {
      weekStarting: weekStartsOnFormatted,
      refreshAt: weekEndsOnDateUnix,
      lives: topHundredLivesUnixUpdated,
      updatedAt: getUnixTime(dailyLiveGen[0]?.updatedAt) * 1000,
    };

    // Compare to today's previous live data
    const cachedLiveData = await CurrentTop100Lives.find({
      weekStarting: weekStartsOnFormatted,
    }).catch((e: Error) => {
      console.error(e);
    });
    if (!cachedLiveData[0]) {
      logger("server").info(
        "No top 100 lives document found for this week. Deleting previous documents and creating new one."
      );
      // First delete all previous documents
      await CurrentTop100Lives.deleteMany({}).catch((e: Error) => {
        console.error(e);
      });
      // Current week starting live document doesn't exist - create one
      await CurrentTop100Lives.create(responseObj).catch((e: Error) => {
        console.error(e);
      });
    } else {
      logger("server").info(
        "Found top 100 lives document for this week! Now updating."
      );
      // Current week starting live document exists - update it
      await CurrentTop100Lives.findOneAndUpdate(
        { weekStarting: weekStartsOnFormatted },
        responseObj
      ).catch((e: Error) => {
        console.error(e);
      });
    }

    return responseObj;
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      logger("server").error(e);
    } else {
      console.error(e);
    }
    return { success: false };
  }
};
