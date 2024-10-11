import { HTTPRequest } from "puppeteer-core";
import { format, subDays } from "date-fns";
import { Live } from "../interfaces/live.interface";
import { conn } from "..";
import { logger } from "../logger/logger";
import { getBase64 } from "./getBase64";

export const handleRequestFinished = async (
  request: HTTPRequest,
  previouslyModifiedLives: number
) => {
  const User = conn.model("User");
  const DailyLive = conn.model("DailyLive");
  try {
    const response = request.response();
    if (request.url().includes("get_live_anchor_list")) {
      const data = await response.json();
      const totalLives = data?.data?.inLiveAmount || 0;
      if (data && data.data && data.data.inLiveAmount) {
        const individualInfos = data.data.liveAnchorInfos;
        if (
          individualInfos &&
          Array.isArray(individualInfos) &&
          individualInfos.every((el) => el.indicators)
        ) {
          const yesterday = format(subDays(new Date(), 1), "MM/dd/yyyy");
          const today = format(new Date(), "MM/dd/yyyy");
          const fullTimeDate = format(new Date(), "PPpp");
          const allLiveResults = individualInfos.map((el) => {
            const roomID = el.roomID;
            const user = el.anchorBaseInfo.user_base_info;
            const userDisplayID = user.display_id;
            const userID = user.user_id;
            const userAvatar = user.avatar;
            const totalDiamonds = el.indicators?.diamonds || 0;
            return {
              roomID,
              user: {
                displayID: userDisplayID,
                userID,
                avatar: userAvatar,
              },
              diamonds: totalDiamonds,
            };
          });
          const updatedLivesNumber =
            previouslyModifiedLives + allLiveResults.length;
          // First compare to yesterday's previous live data just in case to check for still streaming lives
          const yesterdayOldLiveData = await DailyLive.find({
            date: yesterday,
          }).catch((e: Error) => {
            console.error(e);
          });
          const yesterdayLiveDataArr: Live[] = yesterdayOldLiveData[0]
            ? yesterdayOldLiveData[0].lives
            : [];
          const yesterdayRoomIDs = yesterdayLiveDataArr.map(
            (live: Live) => live.roomID
          );

          // Compare to today's previous live data
          const oldLiveData = await DailyLive.find({
            date: today,
          }).catch((e: Error) => {
            console.error(e);
          });
          if (!oldLiveData[0]) {
            // Current date live document doesn't exist - create one
            await DailyLive.create({
              date: today,
              paths: [],
            }).catch((e: Error) => {
              console.error(e);
            });
          }
          const liveDataArr: Live[] = oldLiveData[0]
            ? oldLiveData[0].lives
            : [];
          const oldRoomIDs = liveDataArr.map((live: Live) => live.roomID);

          await Promise.allSettled(
            allLiveResults.map(async (live) => {
              const matchingUserFilter = {
                userID: live.user.userID,
              };
              const matchingUser = await User.find(matchingUserFilter).catch(
                (e: Error) => console.error(e)
              );
              if (matchingUser[0]) {
                // User already exists in DB
                const { avatar } = matchingUser[0]; // Already stored avatar
                const base64Avatar = await getBase64(live.user.avatar);
                const modifiedUser = {
                  ...live.user,
                  avatar: base64Avatar || avatar,
                };
                // User in DB contains outdated data - update user
                await User.findOneAndUpdate(matchingUserFilter, modifiedUser);
              } else {
                const base64Avatar = await getBase64(live.user.avatar);
                const modifiedUser = {
                  ...live.user,
                  avatar: base64Avatar || live.user.avatar,
                };
                // User doesn't exist in DB - add new user
                await User.create(modifiedUser).catch((e: Error) =>
                  console.error(e)
                );
              }

              const handleYesterdayMatch = () => {
                const foundYesterdayLive = yesterdayLiveDataArr.find(
                  (el: Live) => el.roomID === live.roomID
                );
                if (foundYesterdayLive) {
                  const newCurrentLive = {
                    roomID: live.roomID,
                    userID: live.user.userID,
                    diamonds:
                      live.diamonds - Number(foundYesterdayLive.diamonds) >= 0
                        ? live.diamonds - Number(foundYesterdayLive.diamonds)
                        : 0,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                  };
                  return newCurrentLive;
                }
                return;
              };

              if (!oldRoomIDs.includes(live.roomID)) {
                // This live did not start today
                if (yesterdayRoomIDs.includes(live.roomID)) {
                  // Live started yesterday
                  const newLiveObj = handleYesterdayMatch();
                  liveDataArr.push(newLiveObj);
                  return newLiveObj;
                } else {
                  // This is a new live
                  const modifiedLive = {
                    roomID: live.roomID,
                    userID: live.user.userID,
                    diamonds: live.diamonds,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                  };
                  liveDataArr.push(modifiedLive);
                  return modifiedLive;
                }
              } else {
                const foundIndex = liveDataArr.findIndex(
                  (el: Live) => el.roomID === live.roomID
                );
                if (foundIndex >= 0) {
                  if (yesterdayRoomIDs.includes(live.roomID)) {
                    // Live started yesterday
                    const newLiveObj = handleYesterdayMatch();
                    liveDataArr[foundIndex] = newLiveObj;
                    return newLiveObj;
                  } else {
                    const oldObj = liveDataArr[foundIndex];
                    // Update known live
                    const modifiedLive = {
                      roomID: live.roomID,
                      userID: live.user.userID,
                      diamonds: live.diamonds,
                      updatedAt: new Date(),
                      createdAt: oldObj.createdAt,
                    };
                    liveDataArr[foundIndex] = modifiedLive;
                    return modifiedLive;
                  }
                }
                return undefined;
              }
            })
          );

          const liveDateFilter = { date: today };
          const liveDataUpdate = {
            date: today,
            lives: liveDataArr,
          };
          // Update live data
          await DailyLive.findOneAndUpdate(liveDateFilter, liveDataUpdate);
          const successStatement = `Successfully updated ${
            updatedLivesNumber - allLiveResults.length + 1
          }-${updatedLivesNumber} out of ${totalLives} lives at ${fullTimeDate}!`;
          logger("server").info(successStatement);
          return allLiveResults.length;
        }
        return undefined;
      }
      return undefined;
    }
    return undefined;
  } catch (e) {
    logger("server").error(e);
    return previouslyModifiedLives;
  }
};
