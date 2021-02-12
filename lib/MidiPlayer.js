const CONFIG = require(__dirname + '/../decoder.config.js');
const Timer = require(__dirname + '/../modules/Timer');
const runShellAsync = require('mags-modules/shell').runShellAsync;
const FsAsync = require('mags-modules/FsAsync');
const map = require(__dirname + '/../modules/map');
let timeElapsed = 0;

class StatefulComponent {
  constructor () {
    this.state = 0; //0 = hasn't started 1 = running 2 = ended;
    this.startTime = 0;
    this.length = 0;
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
      if(timeElapsed < this.startTime) return;
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
  }

  start () {}
  during () {}
  end () {}

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
  constructor () {
    this.chordPlayers = [];
  }

  normalizeTime (timeElapsed) {
    // This works but idk how or what I did tbh-- needs refactoring
    const bpm = CONFIG.bpm;
    let x = 120/CONFIG.bpm;
    const diff = 2000*x/768;
    const y = 2;
    timeElapsed = timeElapsed / diff;
    timeElapsed = timeElapsed / y;
    return timeElapsed;
  }

  event (event, callback) {
    if (event !== 'noteStart' && event !== 'noteDuring' && event !== 'noteEnd') return;

    this.chordPlayers.forEach( (chordPlayer) => {
      chordPlayer.notePlayers.forEach((notePlayer) => {
        if (event === 'noteStart') notePlayer.start = () => callback(notePlayer);
        if (event === 'noteDuring') notePlayer.during = () => callback(notePlayer);
        if (event === 'noteEnd') notePlayer.end = () => callback(notePlayer);
      });
    });
  }

  playSong (song) {
    runShellAsync(`afplay ${song}`);
  }

  update () {
    this.chordPlayers.forEach( chordPlayer => chordPlayer.update() );
  }

  async cookMidi (jsonFile) {
    try {
      const file = await FsAsync.readFile(jsonFile);
      const chords = JSON.parse(file);
      this.chordPlayers = [];
      chords.forEach( chord => this.chordPlayers.push( new ChordPlayer(chord)) );
      return this.chordPlayers;
    } catch (error) {
      throw new Error(error);
    }
  }

  play (song) {
    this.playSong(song);
    const timer = new Timer();

    const loop = () => {
      setImmediate(loop);
      timeElapsed = timer.timeElapsed();
      timeElapsed = this.normalizeTime(timeElapsed);
      this.update();
    }
    setImmediate(loop);
  }
}
