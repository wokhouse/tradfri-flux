const {TradfriClient} = require('node-tradfri-client');
// parse args into object
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

let {host, key, lat, long} = args;

// if lat or long is a negative number, trim the space and make it into a number
if (typeof lat != 'number') lat = lat.trim();
if (typeof long != 'number') long = long.trim();

const createEnv = async ({identity, psk}) => {
  console.log(`latitiude ${lat} longitude ${long} (if you have a negative lat/long, put the value in quotes add space before it, like --lat " -122.56")`); // eslint-disable-line max-len
  const input = `HOSTNAME=${host}\nIDENTITY=${identity}\nKEY=${psk}\nLATITUDE=${lat}\nLONGITUDE=${long}`; // eslint-disable-line max-len
  fs.writeFile('.env', input, (err) => {
    if (err) throw err;
    console.log('.env file created. trådfri-flux is ready to go.');
  });
};

const obtainCredentials = async () => {
  const tradfri = new TradfriClient(host);
  try {
    const {identity, psk} = await tradfri.authenticate(key);
    tradfri.destroy();
    console.log(`Success: Identity ${identity} created with psk ${psk}`);
    createEnv({identity, psk});
  } catch (e) {
    throw e;
  }
};

if (host == undefined ||
  key == undefined ||
  lat == undefined ||
  long == undefined) {
  throw new Error(`no host or key provided
Useage: node bin/setup.js --host 127.0.0.1 --key a1b2b3b4b6naid2 --lat 45.516 --long 122.670`); // eslint-disable-line max-len
}

obtainCredentials()
.catch(console.error);
