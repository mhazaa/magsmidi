const CONFIG = require(__dirname + '/../config.js').livePlayerOptions;
const ColorControls = require('mags-modules/ColorControls');
const easymidi = require('easymidi');

module.exports = class MidiLivePlayer {
  constructor (midiKeyboard) {
    midiKeyboard = midiKeyboard || CONFIG.midiKeyboard;
    this.input = new easymidi.Input(midiKeyboard);
  }

  event (event, callback) {
    if (event !== 'noteStart' && event !== 'noteEnd') return;
    if (event === 'noteStart') this.onStart = (data) => callback(data);
    if (event === 'noteEnd') this.onEnd = (data) => callback(data);
  }

  start () {
    let openNotes = {};

    this.input.on('noteon', (inputData) => {
      const color = ColorControls.randomColorRGB();

      let channel = inputData.note % 12;
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

      openNotes[inputData.note] = channel;

      const data = {
        r: color.r,
        g: color.g,
        b: color.b,
        channel,
        velocity: inputData.velocity
      };

      if (this.onStart && typeof this.onStart === 'function') this.onStart(data);
    });

    this.input.on('noteoff', (inputData) => {
      const channel = openNotes[inputData.note];

      const data = {
        r: 0,
        g: 0,
        b: 0,
        channel
      };

      if (this.onEnd && typeof this.onEnd === 'function') this.onEnd(data);
    });
  }
}
