# trådfri-flux
Make your IKEA Trådfri bulbs change temperature like [f.lux](https://justgetflux.com).   

![ikea trådfri bulbs, dimmer, gateway, and an iphone running the trådfri app on wooden blocks](http://www.ikea.com/ms/sv_SE/img/fy17/belysning/smart-belysning/ikea_smart_belysning_1620x841.gif)
## Installation
1. Obtain the security key (on the bottom of the gateway) and IP address of your Trådfri gateway (use your router's control panel).
2. Obtain your longitude and latitude (used for sunrise/sunset times). [NASA has a tool for this.](https://mynasadata.larc.nasa.gov/latitudelongitude-finder/)
3. Clone tradfri-flux `git clone https://github.com/overwatchcorp/tradfri-flux.git`
5. Install npm dependencies `cd tradfri-flux && npm install`
5. Run `node bin/setup.js --host 127.0.0.1 --key a1b2c3d4e5f6g7h8i9j0 --lat 12.345 --long 3.141` to prepare the .env file, where hostname is the IP address of the gateway, and key is the security key found on the bottom of the gateway.
   - If you have a negative longitude or latitude, enclose the value in quotes and add a space before the negative sign so it doesn't interpret it as another argument: `--long " -122.670"`
6. Run `npm start` to start trådfri-flux

## Running on a Raspberry Pi
If you have a Raspberry Pi, setting up trådfri-flux is a cinch and can run on startup.
1. Perform the installation
2. In tradfri-flux's directory, run `sudo cp .env /.env` to copy the .env var to your root folder
3. If tradfri-flux is located in `/home/pi/tradfri-flux`, run `echo 'node /home/pi/tradfri-flux/index.js &' >> /etc/rc.local` to add trådfri-flux to startup.
4. Reboot your pi with `sudo reboot`
