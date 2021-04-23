const CONFIG = require(__dirname + '/../config.js').livePlayerOptions;
const ColorControls = require('mags-modules/ColorControls');
const randomInt = require('mags-modules/randomInt');
var easymidi = require('easymidi');
//BlinkstickControls = require(__dirname + '/../modules/BlinkstickControls');
//const blinkstickControls = new BlinkstickControls();
//blinkstickControls.connect();
//blinkstickControls.turnOffAll();

//const Lifx = require(__dirname + '/../modules/Lifx');
//const lifx = new Lifx();
//lifx.listLights();

module.exports = class MidiLivePlayer {
  constructor (midiKeyboard) {
    midiKeyboard = midiKeyboard || CONFIG.midiKeyboard;
    this.input = new easymidi.Input(midiKeyboard);
  }
  start () {
    let openNotes = {};

    input.on('noteon', (data) => {
      const color = ColorControls.randomColorRGB();

      let channel = data.note % 12;
      if(channel===1) channel = 0;
      if(channel===2) channel = 1;
      if(channel===3) channel = 1;
      if(channel===4) channel = 2;
      if(channel===5) channel = 3;
      if(channel===6) channel = 3;
      if(channel===7) channel = 4;
      if(channel===8) channel = 4;
      if(channel===9) channel = 5;
      if(channel===10) channel = 5;
      if(channel===11) channel = 6;
      console.log(channel);
      //const channel = randomInt(0, 7);
      blinkstickControls.setColor(color.r, color.g, color.b, channel);
      openNotes[data.note] = channel;

      return;
      const hex = ColorControls.rgbToHex(color.r, color.g, color.b);
      lifx.setLight({
        'power': 'on',
        'color': hex,
        'brightness': 1,
        'duration': 3,
        'fast': true
      });

    });
    input.on('noteoff', function (data) {
      console.log(data)
      const channel = openNotes[data.note];
      blinkstickControls.setColor(0, 0, 0, channel);
      return;

      lifx.setLight({
        'brightness': 0,
        'duration': 2
      });
    });
  }
}
