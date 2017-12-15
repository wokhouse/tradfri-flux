require('dotenv').config();
const tradfriLib = require('node-tradfri-client');
const SunCalc = require('suncalc');

// trådfri config
const hostname = process.env.HOSTNAME;
const identity = process.env.IDENTITY;
const key = process.env.KEY;
// sunset config
const latitude = process.env.LATITUDE;
const longitude = process.env.LONGITUDE;

// create client that can authenticate with gateway
const {TradfriClient, AccessoryTypes} = tradfriLib;
const tradfri = new TradfriClient(hostname);

// connect and store lights in lightbulbs object
const lightbulbs = {};
const tradfriDeviceUpdated = (device) => {
  if (device.type === AccessoryTypes.lightbulb) {
    lightbulbs[device.instanceId] = device;
  }
};
const tradfriDeviceRemoved = (instanceId) => {
  delete lightbulb[instanceId];
};
const bindLights = async () => {
  await tradfri.connect(identity, key);
  tradfri
    .on('device updated', tradfriDeviceUpdated)
    .on('device removed', tradfriDeviceRemoved)
    .observeDevices();
};

// get sun's stage in the day (sunset, sunrise, dusk, dawn, etc.)
// latitude and longitude fetched from env
const getFluxStage = async () => {
  const now = new Date();
  // calculate sun event times
  const times = SunCalc.getTimes(now, latitude, longitude);
  // find the closest event sorting times and finding first event with larger ms
  let asMillis = [];
  for (t in times) {
    if ({}.hasOwnProperty.call(times, t)) {
      asMillis.push({
        stage: t,
        time: new Date(times[t]).getTime(),
      });
    }
  }
  // sort so we can stop as soon as we find the right stage
  asMillis.sort((a, b) => {
    return a.time - b.time;
  });
  let prev = NaN;
  let sunStage = NaN;
  // only test vals until we find one that is later than right now
  asMillis.some((e) => {
    if ((e.time < Date.now()) == false) {
      sunStage = prev;
      return true;
    } else {
      prev = e;
      return false;
    }
  });
  return sunStage.stage;
};

// change the color temperature to match the sky
const temps = {
  sunrise: 0,
  sunriseEnd: 0,
  goldenHourEnd: 0,
  solarNoon: 10,
  goldenHour: 10,
  sunsetStart: 25,
  sunset: 50,
  dusk: 50,
  nauticalDusk: 50,
  night: 100,
  nadir: 100,
  nightEnd: 100,
  nauticalDawn: 100,
  dawn: 0,
};
const flux = async () => {
  const sunStage = await getFluxStage();
  const lightTemp = temps[sunStage];
  const bulbKeys = Object.keys(lightbulbs);
  // if bulbs have been detected, change them
  // otherwise try again
  if (bulbKeys.length > 0) {
    console.log(`sun is at ${sunStage}`);
    // change each bulb seperately beacuse groups wasnt working
    // TODO: get groups to work
    bulbKeys.map((bulbKey) => {
      console.log(`setting bulb ${bulbKey} to ${lightTemp}% warmth`);
      // gentle change in temperture so it's less noticiable
      const transitionTime = 60;
      tradfri.operateLight(lightbulbs[bulbKey], {
        transitionTime,
        colorTemperature: lightTemp,
      });
      // log when the change completes after transition time
      setTimeout(() => console.log('change complete'), transitionTime * 1000);
    });
  } else {
    return setTimeout(flux, 100);
  }
};

// run flux every $interval milliseconds
const interval = 60000;
module.exports = async () => {
  await bindLights();
  flux();
  setInterval(flux, interval);
};

module.exports();
