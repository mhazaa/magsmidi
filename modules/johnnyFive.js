/*const arduenoPort = '/dev/tty.usbmodem11301';
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort(arduenoPort, { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

port.on("open", () => {
  console.log('serial port open');

  port.on('data', (data) => {
    console.log('data : ' + data);
  });

  parser.on('data', data => {
    console.log('got word from arduino:', data);
  });
});*/

/*
port.write('r:55,g:100,b:150', (err) => {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
});
*/

const johnnyFive = require("johnny-five");

class Board extends johnnyFive.Board {
  constructor(){
    super();
  }

  async connect(){
    return new Promise((resolve, reject) => {
      this.on('ready', () => {
        resolve(this);
      });
    });
  }
}

class Led {
  constrctor(rInput, gInput, bInput){
    this.r = new johnnyFive.Led(rInput);
    this.g = new johnnyFive.Led(gInput);
    this.b = new johnnyFive.Led(bInput);
  }
  setColor(r, g, b){
    this.r.brightness(r);
    this.g.brightness(r);
    this.b.brightness(r);
  }
}

module.exports = {
  Board: Board,
  Led: Led
}
