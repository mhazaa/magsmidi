const CONFIG = require(__dirname + '/../decoder.config.js');
const midiParser = require('midi-parser-js');
const FsAsync = require('mags-modules/FsAsync');
const ColorControls = require('mags-modules/ColorControls');
const randomInt = require('mags-modules/randomInt');
const randomFromArray = require('mags-modules/randomFromArray');

class Chord {
  constructor () {
    this.startTime = 0;
    this.totalLength = 0;
    this.notes = [];
  }
  addNote (note) {
    if (note.length > this.totalLength) this.totalLength = note.length;
    this.notes.push(note);
  }
}

class Light {
  constructor(type, colors, channel){
    if (CONFIG.randomize) {
      this.type = randomFromArray(this.typeOptions());
      this.colors = [this.randomColor()];
      if (this.type === 'blend') {
        const endColor = this.randomColor(this.colors[0]);
        this.colors.push(endColor);
      }
      this.channel = randomInt(CONFIG.channelsRange[0], CONFIG.channelsRange[1]);
    } else {
      this.type = 'blink';
      this.colors = [{r: 0, g: 0, b: 0}];
      this.channel = 0;
    }
  }
  typeOptions () {
    let typeOptions = [];
    (CONFIG.types) ? typeOptions = CONFIG.types : typeOptions = ['blink', 'blend', 'fadein', 'fadeout'];
    return typeOptions;
  }
  randomColor (exclude = null) {
    let color = null;
    if(CONFIG.colors){
      color = randomFromArray(CONFIG.colors);
      if(typeof color === 'string') color = ColorControls.hexToRGB(color); //If provided value is a hexcode color
    } else {
      color = ColorControls.randomColorRGB();
    }
    if(exclude && color.r === exclude.r && color.g === exclude.g && color.b === exclude.b) {
      return this.randomColor(exclude);
    }
    return color;
  }
}

class Note {
  constructor (key) {
    this.key = key;
    this.length = null;
    this.runDuring = true;
    this.lights = [new Light()];
  }
}

module.exports = class MidiDecoder {
  static async decode (filePath, output) {
    try {
      const parsed = await MidiDecoder.parse(filePath);
      const chords = MidiDecoder.chordify(parsed);
      const chordsString = JSON.stringify(chords, null, 4)
      await FsAsync.writeFile(output, chordsString)
      return chords;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async parse (filePath) {
    try {
      const buffer = await FsAsync.readFile(filePath);
      let parsed = midiParser.parse(buffer);
      parsed = parsed.track[0].event;
      parsed.shift();
      parsed.shift();
      parsed.shift();
      parsed.pop();
      return parsed;
    } catch (error) {
      throw new Error(error);
    }
  }

  static chordify (parsed) {
    let chords = [];
    let currentChordIndex = 0;

    parsed.forEach((obj, i) => {
      const type = obj.type; //9=on, 8=off
      const noteData = obj.data;
      const key = noteData[0];
      const on = !(noteData[1]===64);
      const deltaTime = obj.deltaTime;

      if (i === 0) {
        chords.push(new Chord());
        currentChordIndex = chords.length - 1;
        chords[currentChordIndex].startTime = 0;
      } else if (deltaTime !== 0) {
        chords.push(new Chord());
        currentChordIndex = chords.length - 1;
        const previousChord = chords[currentChordIndex-1];
        chords[currentChordIndex].startTime = previousChord.startTime + deltaTime;
      }

      if(!on) return;

      const parentChord = chords[currentChordIndex];
      const newNote = new Note(key);
      //newNote.startTime = parentChord.startTime;
      let closerTime = 0;
      const closer = parsed.find( (closerObj, x) => {
        if(x <= i) return false;
        closerTime += closerObj.deltaTime;
        const closerKey = closerObj.data[0];
        const closerOn = !(closerObj.data[1]===64);
        return (closerKey === key && !closerOn);
      });
      newNote.length = closerTime;
      parentChord.addNote(newNote);
    });

    return chords;
  }
}
