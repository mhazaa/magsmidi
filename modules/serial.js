//const BlinkstickControls = require(__dirname + '/../modules/BlinkstickControls');
//const blinkstickControls = new BlinkstickControls();
//blinkstickControls.connect();
//blinkstickControls.turnOffAll();

const Lifx = require(__dirname + '/../modules/Lifx');
const lifx = new Lifx();
lifx.listLights();

module.exports = () => {
    const delay = 8;

    const loop = () => {
      lifx.setLight({
        'power': 'on',
        'color': '#4340de',
        'brightness': 0.5,
        'duration': delay,
        'fast': true
      });

      setTimeout( () => {
        lifx.setLight({
          'power': 'on',
          'color': '#a140de',
          'brightness': 0.5,
          'duration': delay,
          'fast': true
        });
      }, delay * 1000);

      setTimeout( () => {
        lifx.setLight({
          'power': 'on',
          'color': '#de405a',
          'brightness': 0.5,
          'duration': delay,
          'fast': true
        });
      }, delay * 1000);

      setTimeout( () => {
        lifx.setLight({
          'power': 'on',
          'color': '#de8240',
          'brightness': 0.5,
          'duration': delay,
          'fast': true
        });
      }, delay * 1000);
    }

    loop();
    setInterval( () => {
      loop();
    }, delay * 1000 * 4);
}
return;

const ColorControls = require('mags-modules/ColorControls');
ColorControls
const randomInt = require(__dirname + '/../modules/randomInt');

module.exports = () => {
  var easymidi = require('easymidi');
  var input = new easymidi.Input('MPKmini2');

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
return;

const arduenoPort = '/dev/tty.usbmodem11301';
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort(arduenoPort, { baudRate: 9600 });
//const parser = port.pipe(new Readline({ delimiter: '\n' }));

module.exports = () => {
  port.on("open", () => {
    console.log('serial port open');

    port.on('data', (data) => {
      console.log('data : ' + data);
    });

    //parser.on('data', data => {
    //  console.log('got word from arduino:', data);
    //});
  });

  /*port.write('r:55,g:100,b:150', (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
  });*/
};
