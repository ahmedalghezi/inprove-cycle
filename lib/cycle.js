import * as joda from '@js-joda/core'
import { getCycleLengthStats } from './cycle-length'
//import {getBleedingDaysSortedByDate, getCycleStartsSortedByDate, getCycleDaysSortedByDate} from '../db/index.js'
const LocalDate = joda.LocalDate
const DAYS = joda.ChronoUnit.DAYS

const toJSON = (realmObj) => JSON.parse(JSON.stringify(realmObj))

export default function config(opts) {
  let bleedingDaysSortedByDate
  let cycleStartsSortedByDate
  let cycleDaysSortedByDate
  let maxBreakInBleeding
  let maxCycleLength
  let minCyclesForPrediction

  if (!opts) {
    // we only want to require (and run) the db module
    // when not running the tests
//    console.log("Running !opts : ")
    bleedingDaysSortedByDate = toJSON(
      require('../db').getBleedingDaysSortedByDate()
    )
    cycleStartsSortedByDate = toJSON(
      require('../db').getCycleStartsSortedByDate()
    )
    cycleDaysSortedByDate = toJSON(require('../db').getCycleDaysSortedByDate())
    maxBreakInBleeding = 1
    maxCycleLength = 99
    minCyclesForPrediction = 3
  } else {
    bleedingDaysSortedByDate = opts.bleedingDaysSortedByDate || []
    cycleStartsSortedByDate = opts.cycleStartsSortedByDate || []
    cycleDaysSortedByDate = opts.cycleDaysSortedByDate || []
    maxBreakInBleeding = opts.maxBreakInBleeding || 1
    maxCycleLength = opts.maxCycleLength || 99
    minCyclesForPrediction = opts.minCyclesForPrediction || 3
  }
//  console.log("=============================== ")
//  console.log('cycleStartsSortedByDate :', cycleStartsSortedByDate);
//  console.log('cycleDaysSortedByDate :', cycleDaysSortedByDate);

  function getLastMensesStartForDay(targetDateString) {
    return cycleStartsSortedByDate.find(
      (start) => start.date <= targetDateString
    )
  }

//  function getCycleDayNumber(targetDateString) {
//    const lastMensesStart = getLastMensesStartForDay(targetDateString)
//    if (!lastMensesStart) return null
//    const targetDate = LocalDate.parse(targetDateString)
//    const lastMensesLocalDate = LocalDate.parse(lastMensesStart.date)
//    const diffInDays = lastMensesLocalDate.until(targetDate, DAYS)
//    // take maxCycleLength into account (we don't display cycle day numbers higher than 99 at the moment)
//    if (diffInDays >= maxCycleLength) return null
//    // cycle starts at day 1
//    return diffInDays + 1
//  }

  function getPreviousCycle(dateString) {
    const cycleStart = getLastMensesStartForDay(dateString)
    if (!cycleStart) return null
    const i = cycleStartsSortedByDate.indexOf(cycleStart)
    const earlierCycleStart = cycleStartsSortedByDate[i + 1]
    if (!earlierCycleStart) return null
    return getCycleByStartDay(earlierCycleStart)
  }

  function getCyclesBefore(targetCycleStartDay) {
    const startFromHere = cycleStartsSortedByDate.findIndex((start) => {
      return start.date < targetCycleStartDay.date
    })
    if (startFromHere < 0) return null
    return (
      cycleStartsSortedByDate
        .slice(startFromHere)
        .map((start) => getCycleByStartDay(start))
        // filter the ones exceeding maxCycleLength, those are null
        .filter((cycle) => cycle)
    )
  }

  function findIndexOfDay(day, daysSortedByDate) {
    return daysSortedByDate.findIndex((d) => d.date === day.date)
  }

  function getNextCycleStartDay(startDay, cycleStartsSortedByDate) {
    const cycleStartIndex = findIndexOfDay(startDay, cycleStartsSortedByDate)
    return cycleStartsSortedByDate[cycleStartIndex - 1]
  }

  function getTodayDate() {
    return new Date().toISOString().slice(0, 10)
  }

  function getCycleLength(startDate, endDate) {
    return LocalDate.parse(startDate).until(LocalDate.parse(endDate), DAYS)
  }

  function isValidCycle(startDate, endDate) {
    return getCycleLength(startDate, endDate) <= maxCycleLength
  }

  function getCycleByStartDay(startDay, todayDate) {
    let cycleEndDate = todayDate || getTodayDate()
    let cycleEndIndex = 0

    const nextCycleStart = getNextCycleStartDay(
      startDay,
      cycleStartsSortedByDate
    )

    if (nextCycleStart) {
      const nextCycleIndex = findIndexOfDay(
        nextCycleStart,
        cycleDaysSortedByDate
      )
      cycleEndIndex = nextCycleIndex + 1
      cycleEndDate = nextCycleStart.date
    }

    if (isValidCycle(startDay.date, cycleEndDate)) {
      const cycleStartIndex = findIndexOfDay(startDay, cycleDaysSortedByDate)
      return cycleDaysSortedByDate.slice(cycleEndIndex, cycleStartIndex + 1)
    }

    return null
  }

  function getCycleForDay(dayOrDate, todayDate) {
    const dateString =
      typeof dayOrDate === 'string' ? dayOrDate : dayOrDate.date
    const cycleStart = getLastMensesStartForDay(dateString)
    if (!cycleStart) return null
    return getCycleByStartDay(cycleStart, todayDate)
  }

//  function isMensesStart(cycleDay) {
//    if (!cycleDay.bleeding || cycleDay.bleeding.exclude) return false
//    if (noBleedingDayWithinThresholdBefore(cycleDay)) return true
//    return false
//
//    // checks that there are no relevant bleeding days before
//    // the input cycleDay (returns boolean)
//    function noBleedingDayWithinThresholdBefore(cycleDay) {
//      const localDate = LocalDate.parse(cycleDay.date)
//      const threshold = localDate.minusDays(maxBreakInBleeding + 1).toString()
//      const bleedingDays = bleedingDaysSortedByDate
//      const index = bleedingDays.findIndex((day) => day.date === cycleDay.date)
//      const candidates = bleedingDays.slice(index + 1)
//      return !candidates.some((day) => {
//        return day.date >= threshold && !day.bleeding.exclude
//      })
//    }
//  }

//    function isMensesStart(cycleDay) {
//        console.log("======================================");
//        console.log("Processing cycle day", cycleDay);
//
//        if (!cycleDay.bleeding || cycleDay.bleeding.exclude) {
//            console.log("No valid bleeding data. Returning false.");
//            return false;
//        }
//
//        const noBleeding = noBleedingDayWithinThresholdBefore(cycleDay);
//        console.log("No bleeding day within threshold:", noBleeding);
//
//        if (noBleeding) {
//            console.log("Menses start detected. Returning true.");
//            return true;
//        }
//
//        console.log("Returning false.");
//        return false;
//
//        function noBleedingDayWithinThresholdBefore(cycleDay) {
//            const localDate = LocalDate.parse(cycleDay.date);
//            const threshold = localDate.minusDays(maxBreakInBleeding + 1).toString();
//            console.log("Calculated threshold date:", threshold);
//
//            const bleedingDays = bleedingDaysSortedByDate;
//            const index = bleedingDays.findIndex((day) => day.date === cycleDay.date);
//            const candidates = bleedingDays.slice(index + 1);
//            console.log("Candidates for threshold check:", candidates.map(day => day.date));
//
//            const hasBleedingDaysWithinThreshold = candidates.some((day) => {
//                const isWithinThreshold = day.date >= threshold && !day.bleeding.exclude;
//                console.log(`Checking candidate ${day.date}: Within threshold - ${isWithinThreshold}`);
//                return isWithinThreshold;
//            });
//
//            return !hasBleedingDaysWithinThreshold;
//        }
//    }
function isMensesStart(cycleDay) {

    if (!cycleDay.bleeding || cycleDay.bleeding.exclude) return false;

    if (noBleedingDayWithinThreshold(cycleDay)) {
//        console.log("Cycle day ", cycleDay.date, "is the start of a new cycle.");
//        console.log("bleedingDaysSortedByDate :", bleedingDaysSortedByDate)
//        console.log("================================")
        return true;
    }

//    console.log("Cycle day", cycleDay.date, "is not the start of a new cycle.");
//    console.log("================================")
    return false;

    // Checks that there are no relevant bleeding days before or after
    // the input cycleDay within the threshold (returns boolean)
    function noBleedingDayWithinThreshold(cycleDay) {
        const localDate = LocalDate.parse(cycleDay.date);
        const thresholdStart = localDate.minusDays(maxBreakInBleeding).toString(); // Start of threshold window
        const thresholdEnd = localDate.plusDays(maxBreakInBleeding).toString();        // End of threshold window
//        console.log("bleedingDaysSortedByDate :", bleedingDaysSortedByDate)
        // Filter the bleeding days to only include those within the threshold window
//        const bleedingDays = bleedingDaysSortedByDate.filter(day => {
//                      return day.date >= thresholdStart && day.date <= thresholdEnd;
//                  });

        const bleedingDaysSortedByDate = toJSON(require('../db').getBleedingDaysSortedByDate());
        const bleedingDays = bleedingDaysSortedByDate
               .filter(day => day.date >= thresholdStart && day.date <= thresholdEnd)
               .sort((a, b) => (a.date) - (b.date));

//        console.log("================================")
//        console.log("Processing cycle day:", cycleDay);
//        console.log("Threshold date range:", thresholdStart, "to", thresholdEnd);
//        console.log("Valid candidates for threshold check:", bleedingDays.map(day => day.date));
//        console.log("================================")
        if (bleedingDays.length === 0) {
//                console.log("No valid candidates within the threshold. Marking as new cycle start.");
                return true;
            }

        const earliestBleedingDay = LocalDate.parse(bleedingDays[0].date);
            if (localDate.isBefore(earliestBleedingDay)) {
//                console.log(`Current day (${cycleDay.date}) is before the earliest bleeding day (${earliestBleedingDay}). Marking as new cycle start.`);
                return true;
            }
        // Check for any relevant bleeding day within this window
        return !bleedingDays.some(day => {
//                console.log("Checking candidate ", day.date, ":", !day.bleeding.exclude && day.bleeding.value >= 0);
                return !day.bleeding.exclude && day.bleeding.value >= 0;
            });
        }
    }


// returns all bleeding days that belong to one menses directly following
// the cycle day. used to set or clear new cycle starts when the target day
// changes
function getMensesDaysRightAfter(cycleDay) {
    const bleedingDaysSortedByDate = toJSON(require('../db').getBleedingDaysSortedByDate());
//    console.log("----------------------------------------" )
//    console.log("cycleDay", cycleDay )
//    console.log("bleedingDaysSortedByDate", bleedingDaysSortedByDate )
//    console.log(" ")
    const bleedingDays = bleedingDaysSortedByDate
      .filter((d) => !d.bleeding.exclude)
      .reverse()
//    console.log("Bleeding days after reversing:", bleedingDays);
    const firstFollowingBleedingDayIndex = bleedingDays.findIndex((day) => {
      return day.date > cycleDay.date
    })
//    console.log("First following bleeding day index:", firstFollowingBleedingDayIndex);
//    console.log("Starting recursion with cycleDay:", cycleDay, "and index:", firstFollowingBleedingDayIndex);
    const mensesDaysNext = recurseNext(cycleDay, firstFollowingBleedingDayIndex, [])
//    console.log("mensesDaysNext:", mensesDaysNext);
    const mensesDaysPrev = recursePrev(cycleDay, firstFollowingBleedingDayIndex-1, [])
//    console.log("mensesDaysPrev:", mensesDaysPrev);
    const mensesDays = mensesDaysPrev.concat(mensesDaysNext);
//    console.log("mensesDays:", mensesDays);
    return mensesDays;

    // we look at the current bleeding day as well as the next, and decide
    // whether they belong to one menses. if they do, we collect them, once
    // they don't, we're done
    function recurseNext(day, nextIndex, mensesDays) {
      const next = bleedingDays[nextIndex]
      if (!next) return mensesDays
      if (!isWithinThresholdNext(day, next)){
//      console.log("Threshold check passed :", isWithinThresholdNext(day, next));
      return mensesDays }
      mensesDays.push(next)
//      console.log("Collected menses days so far:", mensesDays);
      return recurseNext(next, nextIndex + 1, mensesDays)
    }

    function recursePrev(day, prevIndex, mensesDays) {
          const prev = bleedingDays[prevIndex]
          if (!prev) return mensesDays
          if (!isWithinThresholdPrev(day, prev)){
//          console.log("Threshold check passed:", isWithinThresholdPrev(day, prev));
          return mensesDays }
          mensesDays.unshift(prev)
    //      console.log("Collected menses days so far:", mensesDays);
          return recursePrev(prev, prevIndex - 1, mensesDays)
        }

    // checks whether the two days belong to one menses episode
    function isWithinThresholdNext(bleedingDay, nextBleedingDay) {
      const localDate = LocalDate.parse(bleedingDay.date)
      const threshold = localDate.plusDays(maxBreakInBleeding).toString()
//      console.log("Threshold date for", bleedingDay.date, ":", threshold);
//      console.log("nextBleedingDay.date : ", nextBleedingDay.date, " and threshold : ", threshold, " is nextBleedingDay.date <= threshold : ", nextBleedingDay.date <= threshold)
      return nextBleedingDay.date <= threshold
    }

    function isWithinThresholdPrev(bleedingDay, prevBleedingDay) {
          const localDate = LocalDate.parse(bleedingDay.date)
          const threshold = localDate.minusDays(maxBreakInBleeding).toString()
//          console.log("Threshold date for", bleedingDay.date, ":", threshold);
//          console.log("prevBleedingDay.date : ", prevBleedingDay.date, " and threshold : ", threshold, " is prevBleedingDay.date >= threshold : ", prevBleedingDay.date >= threshold)
          return prevBleedingDay.date >= threshold
        }
  }

//  function getAllCycleLengths() {
//    return cycleStartsSortedByDate
//      .map((day) => LocalDate.parse(day.date))
//      .map((cycleStart, i, startsAsLocalDates) => {
//        if (i === cycleStartsSortedByDate.length - 1) return null
//        const prevCycleStart = startsAsLocalDates[i + 1]
//        return prevCycleStart.until(cycleStart, DAYS)
//      })
//      .filter((length) => length && length <= maxCycleLength)
//  }

  function getPredictedMenses() {
    const cycleLengths = getAllCycleLengths()
//    console.log("cycleLengths : ", cycleLengths)
    if (cycleLengths.length < minCyclesForPrediction) {
      return []
    }
    const cycleInfo = getCycleLengthStats(cycleLengths)
    const periodDistance = Math.round(cycleInfo.mean)
    let periodStartVariation
    if (cycleInfo.stdDeviation === null) {
      periodStartVariation = 2
    } else if (cycleInfo.stdDeviation < 1.5) {
      // threshold is chosen a little arbitrarily
      periodStartVariation = 1
    } else {
      periodStartVariation = 2
    }
    if (periodDistance - 5 < periodStartVariation) {
      // otherwise predictions overlap
      return []
    }
    const allMensesStarts = cycleStartsSortedByDate
    let lastStart = LocalDate.parse(allMensesStarts[0].date)
    const predictedMenses = []
    for (let i = 0; i < 3; i++) {
      lastStart = lastStart.plusDays(periodDistance)
      const nextPredictedDates = [lastStart.toString()]
      for (let j = 0; j < periodStartVariation; j++) {
        nextPredictedDates.push(lastStart.minusDays(j + 1).toString())
        nextPredictedDates.push(lastStart.plusDays(j + 1).toString())
      }
      nextPredictedDates.sort()
      predictedMenses.push(nextPredictedDates)
    }
    return predictedMenses
  }

//  const getStats = () =>
//    cycleStartsSortedByDate.map((day, i) => {
//      const today = getTodayDate()
//      const cycleLength =
//        i === 0 ? getCycleDayNumber(today) : getAllCycleLengths()[i - 1]
//
//      return {
//        date: day.date,
//        cycleLength,
//        bleedingLength: ++getMensesDaysRightAfter(day).length,
//      }
//    })


  const getStats = () => {
    return cycleStartsSortedByDate.map((day, i) => {
      const today = getTodayDate();
//      console.log("Today's date:", today);

      // Calculate cycle length
      const cycleLength = i === 0 ? getCycleDayNumber(today) : getAllCycleLengths()[i - 1];
//      console.log(`Index: ${i}, Day Date: ${day.date}, Cycle Length:`, cycleLength);

      // Calculate bleeding length
      const bleedingDays = getMensesDaysRightAfter(day);
//      console.log("bleedingDays for", day, " : ", bleedingDays )
//      console.log("-----------------------------------------------------------")
      const bleedingLength = bleedingDays.length; // Incremented here as per the original code
//      console.log(`Bleeding days right after ${day.date}:`, bleedingDays);
//      console.log(`Bleeding length for ${day.date}:`, bleedingLength);

      return {
        date: day.date,
        cycleLength,
        bleedingLength,
      };
    });
  };

  function getCycleDayNumber(targetDateString) {
//    console.log("Calculating cycle day number for : ", targetDateString);

    const lastMensesStart = getLastMensesStartForDay(targetDateString);
    if (!lastMensesStart) {
//      console.log("No last menses start found for:", targetDateString);
      return null;
    }

    const targetDate = LocalDate.parse(targetDateString);
    const lastMensesLocalDate = LocalDate.parse(lastMensesStart.date);
    const diffInDays = lastMensesLocalDate.until(targetDate, DAYS);
//    console.log(`Difference in days from last menses start (${lastMensesStart.date}) to target date (${targetDateString}):`, diffInDays);

    if (diffInDays >= maxCycleLength) {
//      console.log(`Difference in days (${diffInDays}) exceeds max cycle length (${maxCycleLength})`);
      return null;
    }

    const cycleDayNumber = diffInDays + 1; // Adding 1 since cycle starts at day 1
//    console.log("Cycle day number:", cycleDayNumber);
    return cycleDayNumber;
  }



  function getAllCycleLengths() {
//    console.log("Calculating all cycle lengths...");

    const cycleLengths = cycleStartsSortedByDate
      .map((day) => LocalDate.parse(day.date))
      .map((cycleStart, i, startsAsLocalDates) => {
        if (i === cycleStartsSortedByDate.length - 1) {
//          console.log("Reached last cycle start, returning null for last index:", i);
          return null;
        }

        const prevCycleStart = startsAsLocalDates[i + 1];
        const daysBetween = prevCycleStart.until(cycleStart, DAYS);
//        console.log(`Cycle length between ${prevCycleStart} and ${cycleStart}:`, daysBetween);

        return daysBetween;
      })
      .filter((length) => {
        const isValid = length && length <= maxCycleLength;
//        console.log(`Filtering cycle length ${length} - Valid:`, isValid);
        return isValid;
      });

//    console.log("All valid cycle lengths:", cycleLengths);
    return cycleLengths;
  }


  return {
    getCycleDayNumber,
    getCycleForDay,
    getPreviousCycle,
    getCyclesBefore,
    getAllCycleLengths,
    getPredictedMenses,
    isMensesStart,
    getMensesDaysRightAfter,
    getCycleByStartDay,
    getStats,
  }
}