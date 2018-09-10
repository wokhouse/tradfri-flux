const sunCalc = require('suncalc');

const getWarmth = (stages, {lat, long}, date) => {
  // check to make sure that date argument is actually a date
  if (!date instanceof Date || typeof date.getTime !== 'function') {
    throw new Error('not an instance of Date');
  // check validity of date instance
  } else if (isNaN(date.getTime())) throw new Error('invalid date');

  // get the sunrise and sunset values based on the time at noon today
  const today = new Date(
    // TODO: look at time zone offset
    Date.parse(`${date.toLocaleDateString()} 12:00:00`)
  );
  const {sunrise, sunset} = sunCalc.getTimes(today, lat, long);

  let warmth = 0;
  if (date.getTime() < sunrise.getTime()) {
    // convert current time to % before sunrise
    const minutesIntoDay = (date.getHours() * 60) + date.getMinutes();
    const sunriseInMinutes = (sunrise.getHours() * 60) + sunrise.getMinutes();
    const percentToSunrise = minutesIntoDay / sunriseInMinutes;

    // if a value is not found for pre-sunrise stages, set warmth to
    // last value of sunset values
    let foundValue = false;
    stages.toSunrise.map((stage) => {
      if (
        percentToSunrise > stage.toSunrise &&
        stage.toSunrise > closestLowerBound
      ) {
        warmth = stage.warmth;
        foundValue = true;
      }
    });
    if (!foundValue) {
      warmth = stages.toSunset[stages.toSunset.length - 1].warmth;
    }
  } else {
    // convert current time to % before or after sunset
    const minutesIntoDay = (date.getHours() * 60) + date.getMinutes();
    const sunsetInMinutes = (sunset.getHours() * 60) + sunset.getMinutes();
    const percentToSunset = minutesIntoDay / sunsetInMinutes;

    let closestLowerBound = 0;
    const {toSunset} = stages;
    toSunset.map((stage) => {
      if (
        percentToSunset > stage.toSunset &&
        stage.toSunset > closestLowerBound
      ) {
        closestLowerBound = stage.toSunset;
        warmth = stage.warmth;
      }
    });
    if (
      toSunset[closestLowerBound + 1] &&
      percentToSunset > toSunset[closestLowerBound].toSunset
    ) {
      const closestNextStage = toSunset[closestLowerBound + 1];
      const closestLowerStage = toSunset[closestLowerBound];
      const percentBetweenStages = (percentToSunset - closestLowerStage.toSunset) /
        (closestNextStage.toSunset - closestLowerStage.toSunset);
      const valueBetweenStages = ((closestNextStage.warmth - closestLowerStage.warmth) * percentBetweenStages) +
        closestLowerStage.warmth;
      warmth = Math.floor(valueBetweenStages);
    }
  }
  return warmth;
};

module.exports = getWarmth;
