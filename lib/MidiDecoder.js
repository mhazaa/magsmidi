const CONFIG = require(__dirname + '/../config.js').decoderOptions;
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

      if (CONFIG.channels) {
        this.channel = randomFromArray(CONFIG.channels);
      } else if (CONFIG.channelsRange) {
        this.channel = randomInt(CONFIG.channelsRange[0], CONFIG.channelsRange[1]);
      } else {
        throw new Error('an array of channels or channelsRange must be defined for the decoderOptions in the config file');
      }

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
    this.lights = [new Light()];
  }
}

module.exports = class MidiDecoder {
  static async decode (midiFilePath, output = null) {
    try {
      if (!output) output = midiFilePath.replace('.mid', '.json');
      const parsed = await MidiDecoder.parse(midiFilePath);
      const chords = MidiDecoder.chordify(parsed);

      const lastChord = chords[chords.length-1];
      const json = {
        chords: chords,
        meta: {
          totalLength: lastChord.startTime + lastChord.totalLength,
          numberOfChords: chords.length
        }
      }

      const jsonString = JSON.stringify(json, null, 4);
      await FsAsync.writeFile(output, jsonString);

      return chords;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async parse (midiFilePath) {
    try {
      const buffer = await FsAsync.readFile(midiFilePath);
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

  static normalizeTime (time) {
    let bpm = 120/CONFIG.bpm;
    bpm = 2000*bpm/768;
    bpm = bpm * 2;
    time = time*bpm;
    time = Math.floor(time);
    return time;
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
        chords[currentChordIndex].startTime = previousChord.startTime + MidiDecoder.normalizeTime(deltaTime);
      }

      if(!on) return;

      const parentChord = chords[currentChordIndex];
      const newNote = new Note(key);
      //newNote.startTime = parentChord.startTime;
      let closerTime = 0;
      const closer = parsed.find( (closerObj, x) => {
        if(x <= i) return false;
        closerTime += MidiDecoder.normalizeTime(closerObj.deltaTime);
        const closerKey = closerObj.data[0];
        const closerOn = !(closerObj.data[1]===64);
        return (closerKey === key && !closerOn);
      });
      newNote.length = closerTime;
      parentChord.addNote(newNote);
    });

    const cleanEnd = () => {
      const lastChord = chords[chords.length - 1];
      if (lastChord.notes.length === 0) chords.pop();
      if (lastChord.notes.length === 0) cleanEnd();
    }
    cleanEnd();

    return chords;
  }
}
