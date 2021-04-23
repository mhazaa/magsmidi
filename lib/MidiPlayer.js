const CONFIG = require(__dirname + '/../config.js').playerOptions;
const runShellAsync = require('mags-modules/shell').runShellAsync;
const FsAsync = require('mags-modules/FsAsync');
const map = require('mags-modules/map');
const events = require('events');
const eventEmitter = new events.EventEmitter();
let timeElapsed = 0;

class Timer {
  constructor () {
    this.deltaTime = new Date();
    this.currentTime;
    this.end = null;
  }
  restart () {
    this.deltaTime = new Date();
    timeElapsed = 0;
    eventEmitter.emit('timerRestarting');
  }
  tick () {
    this.currentTime = new Date();
    timeElapsed = this.currentTime - this.deltaTime;
    if (timeElapsed > this.end) this.restart();
    return timeElapsed;
  }
}

class StatefulComponent {
  constructor () {
    this.state = 0; //0 = hasn't started 1 = running 2 = ended;
    this.startTime = 0;
    this.length = 0;
    this.input();
  }
  input () {
    eventEmitter.on('timerRestarting', () => this.state = 0);
  }
  start () {
  }
  during () {
  }
  end () {
  }
  updateState () {
    if (this.state === 2) return;
    if (this.state === 0) {
      if (timeElapsed < this.startTime) return;
      this.state = 1;
      this.start();
      //if (this.runDuring) this.during();
      return;
    }
    if (this.state === 1) {
      const length = this.length || this.totalLength;
      if(timeElapsed >= this.startTime + length){
        this.state = 2;
        //if (this.runDuring) this.during();
        this.end();
        return;
      }
      if (this.runDuring) this.during();
      return;
    }
  }
}

class NotePlayer {
  constructor (note, chordStart) {
    Object.assign(this, note);
    this.startTime = chordStart;

    this.runDuring = false;
    this.lights.forEach( (light) => {
      if (light.type === 'blend' || light.type === 'fadein' || light.type === 'fadeout') {
        this.runDuring = true;
        //break foreach loop here
      }
    });
  }

  onStart (callback) {
    callback(data);
  }
  onDuring (callback) {
    callback(data);
  }
  onEnd (callback) {
    callback(data);
  }

  start () {
    if (CONFIG.log) console.log(this.key + ': started');

    this.lights.forEach( light => {
      const data = {};
      data.channel = light.channel;
      if (light.type === 'fadein') {
        data.r = 0;
        data.g = 0;
        data.b = 0;
      } else {
        data.r = light.colors[0].r;
        data.g = light.colors[0].b;
        data.b = light.colors[0].g;
      }

      this.onStart(data);
    });
  }

  during () {
    if (CONFIG.logDuring) console.log(this.key + ': during');

    this.lights.forEach( light => {
      if (light.type === 'blink') return;
      let data = {};

      if (light.type === 'blend') {
        const color = this.blend(light.colors[0], light.colors[1]);
        data = {
          r: color.r,
          g: color.g,
          b: color.b,
          channel: light.channel
        };
      }

      if (light.type === 'fadein' ) {
        const color = this.fadein(light.colors[0]);
        data = {
          r: color.r,
          g: color.g,
          b: color.b,
          channel: light.channel
        };
      }

      if (light.type === 'fadeout' ) {
        const color = this.fadeout(light.colors[0]);
        data = {
          r: color.r,
          g: color.g,
          b: color.b,
          channel: light.channel
        };
      }

      this.onDuring(data);
    });
  }

  end () {
    if (CONFIG.log) console.log(this.key + ': end');

    this.lights.forEach( light => {
      const data = {
        r: 0,
        g: 0,
        b: 0,
        channel: light.channel
      }

      this.onEnd(data);
    });
  }

  remainingTime () {
    const endTime = this.startTime + this.length;
    return endTime - timeElapsed;
  }

  blend (startColor, endColor) {
    const remainingTime = this.remainingTime();

    let r = map(remainingTime, this.length, 0, startColor.r, endColor.r);
    r = Math.floor(r);
    let g = map(remainingTime, this.length, 0, startColor.g, endColor.g);
    g = Math.floor(g);
    let b = map(remainingTime, this.length, 0, startColor.b, endColor.b);
    b = Math.floor(b);

    return {r: r, g: g, b: b};
  }

  fadein (startColor) {
    const remainingTime = this.remainingTime();

    let r = map(remainingTime, this.length, 0, 0, startColor.r);
    r = Math.floor(r);
    let g = map(remainingTime, this.length, 0, 0, startColor.g);
    g = Math.floor(g);
    let b = map(remainingTime, this.length, 0, 0, startColor.b);
    b = Math.floor(b);
    if (b < 0) b = 0;

    return {r: r, g: g, b: b};
  }

  fadeout (startColor) {
    const remainingTime = this.remainingTime();

    let r = map(remainingTime, this.length, 0, startColor.r, 0);
    r = Math.floor(r);
    let g = map(remainingTime, this.length, 0, startColor.g, 0);
    g = Math.floor(g);
    let b = map(remainingTime, this.length, 0, startColor.b, 0);
    b = Math.floor(b);
    if (b < 0) b = 0;

    return {r: r, g: g, b: b};
  }
}

class ChordPlayer extends StatefulComponent {
  constructor (chord) {
    super();
    Object.assign(this, chord);
    this.runDuring = true;
    this.notePlayers = [];
    this.notes.forEach( note => this.notePlayers.push( new NotePlayer(note, this.startTime)) );
  }

  start () {
    this.notePlayers.forEach( notePlayer => notePlayer.start() );
  }

  during () {
    this.notePlayers.forEach( notePlayer => {
      if(notePlayer.runDuring) notePlayer.during()
    });
  }

  end () {
    this.notePlayers.forEach( notePlayer => notePlayer.end() );
  }

  update () {
    this.updateState();
  }
}

module.exports = class MidiPlayer {
  constructor (jsonFilePath, songPath = null) {
    this.jsonFilePath = jsonFilePath;
    this.songPath = songPath;
    this.totalLength = 0;
    this.chordPlayers = [];
  }

  event (event, callback) {
    if (event !== 'noteStart' && event !== 'noteDuring' && event !== 'noteEnd') return;

    this.chordPlayers.forEach( (chordPlayer) => {
      chordPlayer.notePlayers.forEach((notePlayer) => {
        if (event === 'noteStart') notePlayer.onStart = (data) => callback(data);
        if (event === 'noteDuring') notePlayer.onDuring = (data) => callback(data);
        if (event === 'noteEnd') notePlayer.onEnd = (data) => callback(data);
      });
    });
  }

  playSong () {
    if (!this.songPath) throw new Error('songPath was not passed as an argument to the constructor')
    runShellAsync(`afplay ${this.songPath}`);
  }

  update () {
    this.chordPlayers.forEach( chordPlayer => chordPlayer.update() );
  }

  async prepare () {
    try {
      const file = await FsAsync.readFile(this.jsonFilePath);
      const fileParsed = JSON.parse(file);
      this.totalLength = fileParsed.meta.totalLength;
      const chords = fileParsed.chords;
      this.chordPlayers = [];
      chords.forEach( chord => this.chordPlayers.push( new ChordPlayer(chord)) );
      return this.chordPlayers;
    } catch (error) {
      throw new Error(error);
    }
  }

  async play () {
    if (this.songPath) this.playSong();
    const timer = new Timer();
    timer.end = this.totalLength;

    const loop = () => {
      setImmediate(loop);
      timer.tick(); //updates the global timeElapsed
      this.update();
    }
    setImmediate(loop);
  }
}
