/*import DMX from 'dmx';

export default class DMXController {
  constructor() {
    const dmx = new DMX();
    this.universe = dmx.addUniverse('demo',
      'enttec-open-usb-dmx', 'COM3');
    this.universe.updateAll(0);
  }
  setColor(startChannel, r, g, b) {
    this.universe.update({
      [startChannel]: r,
      [startChannel + 1]: g,
      [startChannel + 2]: b
    });
  }
}*/

/*****/

/*const DMX = require('dmx');

//Enttec Open DMX USB

module.exports = class DMXController {
  constructor() {
    const dmx = new DMX();
    this.universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-AB0KU85Q');
    dmx.update('demo', {1: 200})

  }
  setColor(startChannel, r, g, b) {
    this.universe.update({
      [startChannel]: r,
      [startChannel + 1]: g,
      [startChannel + 2]: b
    });
  }
}*/

/*****/

/*const DMX = require('dmx');
const dmx = new DMX();
const universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-AB0KU85Q');
// const universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', '/Device/VCP0');
dmx.update9('demo', {1: 200});*/
