module.exports = class Timer {
  constructor(){
    this.startTime = new Date();
    this.endTime;
  }
  restart(){
    this.startTime = new Date();
  }
  timeElapsed(){
    this.endTime = new Date();
    return this.endTime - this.startTime;
  }
}
