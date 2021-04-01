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
