import midiParser from 'midi-parser-js';
import { readFile, writeFile } from '../helperFunctions/fsAsync';
import randomInt from '../helperFunctions/randomInt';
import randomFromArray from '../helperFunctions/randomFromArray';

interface DecoderOptions {
	bpm?: number; // required but provided by default
	channelsRange?: [number, number], // [min, max]
	channels?: number[]; // takes priority over channelsRange
	colors?: string[]; // randomized if not defined
	lightTypes?: LightTypes[]; // randomized if not defined
}

const defaultDecoderOptions: DecoderOptions = {
	bpm: 120,
	channelsRange: [1, 15], 
	colors: ['#9500ff', '#ffba00', '#0700ff', '#00ffb3', '#ff000f'],
	lightTypes: ['blink', 'fadein', 'blend'],
};

class Color {
	r: number; // range of 0 - 255
	g: number; // range of 0 - 255
	b: number; // range of 0 - 255

	constructor (color?: {r: number, g: number, b: number} | string) {
		if (typeof color === 'string') {
			const rgb = Color.hexToRGB(color);
			this.r = rgb.r;
			this.g = rgb.g;
			this.b = rgb.b;
		} else {
			this.r = color?.r || Color.randomColorValue();
			this.g = color?.g || Color.randomColorValue();
			this.b = color?.b || Color.randomColorValue();	
		}
	}

	static randomColorValue (): number {
		return Math.floor(Math.random() * 255) + 1;
	}

	static hexToRGB (hex: string): Color {
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	
		hex = hex.replace(shorthandRegex, (m, r, g, b) => {
			return r + r + g + g + b + b;
		});
	
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) throw new Error('Hex result is null');

		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		};
	}
}

type LightTypes = 'blink' | 'blend' | 'fadein' | 'fadeout' ;
const lightTypes = ['blink', 'blend', 'fadein', 'fadeout'];

class Light {
	lightType: LightTypes;
	channel = 1;
	colors: Color[];

	constructor () {
		this.lightType = randomFromArray(DECODER_CONFIG.lightTypes || lightTypes);

		if (DECODER_CONFIG.channelsRange) this.channel = randomInt(DECODER_CONFIG.channelsRange[0], DECODER_CONFIG.channelsRange[1]);
		if (DECODER_CONFIG.channels) this.channel = randomFromArray(DECODER_CONFIG.channels);

		if (!DECODER_CONFIG.colors) {
			this.colors = [new Color()];
			if (this.lightType === 'blend') this.colors.push(new Color());
			return;
		}

		const randomColorHex: string = randomFromArray(DECODER_CONFIG.colors);
		this.colors = [new Color(randomColorHex)];

		if (this.lightType === 'blend') {
			const endRandomColorHex = (): string => {
				const _endRandomColorHex: string = randomFromArray(DECODER_CONFIG.colors!);
				if (_endRandomColorHex === randomColorHex) return endRandomColorHex();
				return _endRandomColorHex;
			};

			this.colors.push( new Color(endRandomColorHex()) );
		}
	}
}

class Note {
	key: number;
	velocity: number;
	length = 0;
	lights: Light[];

	constructor (key: number, velocity: number, length = 0, lights = [new Light()]) {
		this.key = key;
		this.velocity = velocity;
		this.length = length;
		this.lights = lights;
	}
}

class Chord {
	startTime = 0;
	totalLength = 0;
	notes: Note[] = [];
	
	addNote (note: Note) {
		if (note.length > this.totalLength) this.totalLength = note.length;
		this.notes.push(note);
	}
}

class MidiDecoder {
	public static async decode (midiFilePath: string, output?: string, options: DecoderOptions = {}): Promise<Chord[]> {
		try {
			if (!output) output = midiFilePath.replace('.mid', '.json');
			const parsed = await MidiDecoder.parse(midiFilePath);
			const chords: Chord[] = MidiDecoder.chordify(parsed);
			
			const lastChord = chords[chords.length-1];
			const json = {
				chords: chords,
				meta: {
					totalLength: lastChord.startTime + lastChord.totalLength,
					numberOfChords: chords.length
				}
			};
			
			const jsonString = JSON.stringify(json, null, 4);
			await writeFile(output, jsonString);
			console.log(chords);
			return chords;
		} catch (error) {
			throw new Error(error);
		}
	}
	
	private static async parse (midiFilePath: string) {
		try {
			const buffer = await readFile(midiFilePath);
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
	
	private static normalizeTime (time: number): number {
		let bpm = 120 / DECODER_CONFIG.bpm;
		bpm = 2000 * bpm / 768;
		bpm = bpm * 2;
		time = time * bpm;
		time = Math.floor(time);
		return time;
	}
	
	private static chordify (parsed): Chord[] {
		const chords: Chord[] = [];

		parsed.forEach((obj, i) => {
			const type = obj.type; // 9=on, 8=off
			const noteData = obj.data;
			const key = noteData[0];
			const velocity = noteData[1];
			const on = velocity !== 0 && type === 9;
			const deltaTime = obj.deltaTime;
			
			if (i === 0) {
				chords.push(new Chord());
				chords[chords.length - 1].startTime = 0;
			} else if (deltaTime !== 0) {
				const previousChord = chords[chords.length - 1];
				if (previousChord.notes.length === 0) chords.pop();
				chords.push(new Chord());
				chords[chords.length - 1].startTime = previousChord.startTime + MidiDecoder.normalizeTime(deltaTime);
			}
			
			if(!on) return;
			
			const parentChord = chords[chords.length - 1];
			const newNote = new Note(key, velocity);
			let closerTime = 0;
			let breakLoop = false;
			parsed.forEach((closerObj, x) => {
				if(x <= i || breakLoop) return;
				closerTime += MidiDecoder.normalizeTime(closerObj.deltaTime);
				const closerType = closerObj.type;
				const closerKey = closerObj.data[0];
				const closerVelocity = closerObj.data[1];
				const closerOff = closerVelocity === 0 || closerType !== 9;
				if (closerKey === key && closerOff) breakLoop = true;
			});

			newNote.length = closerTime;
			parentChord.addNote(newNote);
		});
		
		const cleanEnd = () => {
			const lastChord = chords[chords.length - 1];
			if (lastChord.notes.length === 0) chords.pop();
			if (lastChord.notes.length === 0) cleanEnd();
		};
		cleanEnd();

		return chords;
	}
}

export { DecoderOptions, Color, LightTypes, Light, Note, Chord };
export default MidiDecoder;