require('dotenv').config();
const tradfriLib = require('node-tradfri-client');
const getWarmth = require('./getWarmth');
const stages = require('./stages');

// trådfri config
const hostname = process.env.HOSTNAME;
const identity = process.env.IDENTITY;
const key = process.env.KEY;
// sunset config
const coords = {
  lat: process.env.LATITUDE,
  long: process.env.LONGITUDE,
};

// create client that can authenticate with gateway
const {TradfriClient, AccessoryTypes} = tradfriLib;
const tradfri = new TradfriClient(hostname);

//
// expose function to adjust lightbulb color temperature
const adjustLight = async (device) => {
  const now = new Date();
  const warmth = getWarmth(stages, coords, now);
  console.log(warmth);
  return tradfri.operateLight(device, {
      transitionTime: 10,
      colorTemperature: warmth,
  });
};

// connect and store lights in lightbulbs object
const lightbulbs = {};
const tradfriDeviceUpdated = (device) => {
  if (device.type === AccessoryTypes.lightbulb) {
    if(device.instanceId in lightbulbs == false) adjustLight(device);
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

bindLights();
setInterval(() => {
  for(device in lightbulbs) adjustLight(lightbulbs[device]);
}, 10000);
