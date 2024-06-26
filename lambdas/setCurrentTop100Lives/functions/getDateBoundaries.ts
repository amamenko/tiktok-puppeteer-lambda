import { format, startOfWeek, addDays, subDays } from "date-fns";
import "../node_modules/dotenv/config";

export const getDateBoundaries = (weeksAgo?: number) => {
  const beginningDay = weeksAgo
    ? subDays(new Date(), weeksAgo * 7)
    : new Date();
  const formattedBeginningDay = format(beginningDay, "MM/dd/yyyy");

  const weekStartsOnDate = startOfWeek(beginningDay); // Sunday
  const weekStartsOnFormatted = format(weekStartsOnDate, "MM/dd/yyyy");
  const boundaryDatesArr = [weekStartsOnFormatted];

  for (let i = 1; i < 7; i++) {
    const addedFormattedDate = format(
      addDays(weekStartsOnDate, i),
      "MM/dd/yyyy"
    );
    boundaryDatesArr.push(addedFormattedDate);
  }
  return {
    boundaryDatesArr,
    weekStartsOnDate,
    formattedCurrentDate: formattedBeginningDay,
    weekStartsOnFormatted,
  };
};
