const arduenoPort = '/dev/tty.usbmodem11301';
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort(arduenoPort, { baudRate: 9600 });
//const parser = port.pipe(new Readline({ delimiter: '\n' }));

module.exports = () => {
  port.on('open', () => {
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
