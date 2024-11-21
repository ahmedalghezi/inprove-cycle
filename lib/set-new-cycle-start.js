export default function ({
  val, cycleDay, mensesDaysAfter, checkIsMensesStart
}) {

  cycleDay.bleeding = val
//  console.log("##################################")
//  console.log("#################################")
//  console.log("val : ", val)
//  console.log("cycleDay : ", cycleDay)
//  console.log("mensesDaysAfter : ", mensesDaysAfter)
//  console.log("checkIsMensesStart : ", checkIsMensesStart)
//  console.log("##################################")
//  console.log("#################################")



  // if a bleeding value is deleted or excluded, we need to check if there are
  // any following bleeding days and if the next one of them is now a cycle
  // start
  if (bleedingValueDeletedOrExluded(val)) {
    cycleDay.isCycleStart = false
//    console.log( "!mensesDaysAfter.length : ", !mensesDaysAfter.length)
    if (!mensesDaysAfter.length)
    {
    const nextOne = mensesDaysAfter[mensesDaysAfter.length - 1]
//    console.log( "nextOne : ", nextOne)
    return nextOne
    }
//    console.log( "checkIsMensesStart(nextOne) : ", checkIsMensesStart(nextOne))
    if (checkIsMensesStart(nextOne)) {
//      console.log( "nextOne : ", nextOne)
//      console.log( "nextOne.isCycleStart : ", nextOne.isCycleStart)
      nextOne.isCycleStart = true
    }
  }
  else {
//    console.log("checkIsMensesStart(cycleDay) : ", checkIsMensesStart(cycleDay))
    cycleDay.isCycleStart = checkIsMensesStart(cycleDay)
//    console.log("cycleDay.isCycleStart: ", cycleDay.isCycleStart )
//    console.log("cycleDay : ", cycleDay)
    // if the cycleDay.isCycleStart is TRUE ( BASED ON YOUR LOGIC) IT MEANS IT IS THE FIRST DAY OF THE PERIOD SO
    //RUN maybeClearOldCycleStarts() to false all other dates in mensesDaysAfter
    // BUT IF FALSE Then it might mean that the date falls in between or the end so in this case the minimum date
    // from mensesDaysAfter and cycleDay should be removed and set to true

    maybeClearOldCycleStarts(cycleDay.isCycleStart)


//    console.log("mensesDaysAfter : ", mensesDaysAfter)
  }

  function bleedingValueDeletedOrExluded(val) {
    const bleedingDeleted = !val
    const bleedingExcluded = val && val.exclude
//    console.log("bleedingDeleted || bleedingExcluded : ", bleedingDeleted || bleedingExcluded)
    return bleedingDeleted || bleedingExcluded
  }

  function maybeClearOldCycleStarts(flag) {
    try {
      // Check if mensesDaysAfter exists and is not empty
      if (!mensesDaysAfter || mensesDaysAfter.length === 0) {
//        console.log("mensesDaysAfter is empty or undefined.");
        return; // Exit the function early if there's nothing to process
      }

      // if we have a new bleeding day, we need to clear the
      // menses start marker from all following days of this
      // menses that may have been marked as start before
      if (flag) {
        mensesDaysAfter.forEach(day => {
          day.isCycleStart = false;
        });
//        console.log("For flag = ", flag, " mensesDaysAfter : ", mensesDaysAfter);
      } else {
        const earliestDay = mensesDaysAfter.reduce((earliest, current) => {
          return new Date(current.date) < new Date(earliest.date) ? current : earliest;
        });

        // Set isCycleStart to true only for the earliest day
        mensesDaysAfter.forEach(day => {
          day.isCycleStart = (day === earliestDay);
        });

//        console.log("For flag == ", flag, " mensesDaysAfter : ", mensesDaysAfter);
      }
    } catch (error) {
//      console.error("An error occurred in maybeClearOldCycleStarts:", error);
    }
  }

//    return mensesDaysAfter
}
