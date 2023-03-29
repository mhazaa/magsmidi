import FULLCONFIG from '../CONFIG';
const CONFIG = FULLCONFIG.playerOptions;
import { Color, Note, Chord } from './MidiDecoder';

import { runShellAsync } from '../helperFunctions/shell';
import { readFile } from '../helperFunctions/fsAsync';
import map from '../helperFunctions/map';

import events from 'events';
const eventEmitter = new events.EventEmitter();
let timeElapsed = 0;

class EventData {
	channel: number;
	r: number;
	g: number;
	b: number;
}

type EventTypes = 'noteStart' | 'noteDuring' | 'noteEnd' | 'chordStart' | 'chordDuring' | 'chordEnd';
const eventTypes = ['noteStart', 'noteDuring', 'noteEnd', 'chordStart', 'chordDuring', 'chordEnd'];

class Timer {
	deltaTime = new Date();
	currentTime: Date;
	end = 0;

	restart (): void {
		this.deltaTime = new Date();
		timeElapsed = 0;
		eventEmitter.emit('timerRestarting');
	}

	tick (): number {
		this.currentTime = new Date();
		timeElapsed = this.currentTime.getTime() - this.deltaTime.getTime();
		if (CONFIG.loopLights && timeElapsed > this.end) this.restart();
		return timeElapsed;
	}
}

class StatefulComponent {
	state: 0 | 1 | 2 = 0; // 0 = hasn't started 1 = running 2 = ended
	startTime = 0;
	length = 0;
	totalLength = 0;
	runDuring = false;

	constructor () {
		eventEmitter.on('timerRestarting', () => this.state = 0);
	}

	start () { return null; }
	during () { return null; }
	end () { return null; }

	update () {
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

class NotePlayer extends Note {
	startTime: number;
	runDuring = false;
	onStart: (data: EventData) => void = () => null;
	onDuring: (data: EventData) => void = () => null;
	onEnd: (data: EventData) => void = () => null;

	constructor (note: Note, chordStart: number) {
		super(note.key, note.velocity, note.length, note.lights);

		this.startTime = chordStart;

		this.lights.forEach(light => {
			if (light.lightType === 'blend' || light.lightType === 'fadein' || light.lightType === 'fadeout') {
				this.runDuring = true;
				//break foreach loop here
			}
		});
	}

	start () {
		if (CONFIG.log) console.log(this.key + ': started');

		this.lights.forEach(light => {
			const data = new EventData();
			data.channel = light.channel;

			if (light.lightType === 'fadein') {
				data.r = 0;
				data.g = 0;
				data.b = 0;
			} else {
				data.r = light.colors[0].r;
				data.g = light.colors[0].b;
				data.b = light.colors[0].g;
			}

			if (typeof this.onStart === 'function') this.onStart(data);
		});
	}

	during () {
		if (CONFIG.logDuring) console.log(this.key + ': during');

		this.lights.forEach( light => {
			if (light.lightType === 'blink') return;
			const data = new EventData();

			if (light.lightType === 'blend') {
				const color = this.blend(light.colors[0], light.colors[1]);
				data.channel = light.channel;
				data.r = color.r;
				data.g = color.g;
				data.b = color.b;
			}

			if (light.lightType === 'fadein' ) {
				const color = this.fadein(light.colors[0]);
				data.channel = light.channel;
				data.r = color.r;
				data.g = color.g;
				data.b = color.b;
			}

			if (light.lightType === 'fadeout' ) {
				const color = this.fadeout(light.colors[0]);
				data.channel = light.channel;
				data.r = color.r;
				data.g = color.g;
				data.b = color.b;
			}

			if (typeof this.onDuring === 'function') this.onDuring(data);
		});
	}

	end () {
		if (CONFIG.log) console.log(this.key + ': end');

		this.lights.forEach(light => {
			const data: EventData = {
				channel: light.channel,
				r: 0,
				g: 0,
				b: 0
			};

			if (typeof this.onEnd === 'function') this.onEnd(data);
		});
	}

	remainingTime () {
		const endTime = this.startTime + this.length;
		return endTime - timeElapsed;
	}

	blend (startColor: Color, endColor: Color): Color {
		const remainingTime = this.remainingTime();

		let r = map(remainingTime, this.length, 0, startColor.r, endColor.r);
		r = Math.floor(r);
		let g = map(remainingTime, this.length, 0, startColor.g, endColor.g);
		g = Math.floor(g);
		let b = map(remainingTime, this.length, 0, startColor.b, endColor.b);
		b = Math.floor(b);

		return { r, g, b };
	}

	fadein (startColor: Color): Color {
		const remainingTime = this.remainingTime();

		let r = map(remainingTime, this.length, 0, 0, startColor.r);
		r = Math.floor(r);
		let g = map(remainingTime, this.length, 0, 0, startColor.g);
		g = Math.floor(g);
		let b = map(remainingTime, this.length, 0, 0, startColor.b);
		b = Math.floor(b);
		//if (b < 0) b = 0;

		return { r, g, b };
	}

	fadeout (startColor: Color): Color {
		const remainingTime = this.remainingTime();

		let r = map(remainingTime, this.length, 0, startColor.r, 0);
		r = Math.floor(r);
		let g = map(remainingTime, this.length, 0, startColor.g, 0);
		g = Math.floor(g);
		let b = map(remainingTime, this.length, 0, startColor.b, 0);
		b = Math.floor(b);
		//if (b < 0) b = 0;

		return { r, g, b };
	}
}

class ChordPlayer extends StatefulComponent {
	notes: Note[];
	notePlayers: NotePlayer[] = [];
	runDuring = true;
	onStart: (data: EventData) => void = () => null;
	onDuring: (data: EventData) => void = () => null;
	onEnd: (data: EventData) => void = () => null;

	constructor (chord: Chord) {
		super();
		// state // startTime // length // totalLength // runDuring // start // during // end
		Object.assign(this, chord);
		// startTime // totalLength // notes
		this.notes.forEach(note =>
			this.notePlayers.push( new NotePlayer(note, this.startTime) )
		);
	}

	//eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	start () {
		this.notePlayers.forEach(notePlayer => notePlayer.start());
		//eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		if (typeof this.onStart === 'function') this.onStart(this.notePlayers);
	}
	
	//eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	during () {
		this.notePlayers.forEach(notePlayer => {
			if (notePlayer.runDuring) notePlayer.during();
		});
		//eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		if (this.runDuring && typeof this.onDuring === 'function') this.onDuring(this.notePlayers);
	}

	//eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	end () {
		this.notePlayers.forEach(notePlayer => notePlayer.end());
		//eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		if (typeof this.onEnd === 'function') this.onEnd(this.notePlayers);
	}
}

class MidiPlayer {
	jsonFilePath: string;
	songPath?: string;
	totalLength = 0;
	chordPlayers: ChordPlayer[] = [];

	constructor (jsonFilePath: string, songPath?: string) {
		this.jsonFilePath = jsonFilePath;
		this.songPath = songPath;
	}

	public event (event: EventTypes, callback: (eventData: EventData) => void) {
		if (!eventTypes.includes(event)) throw new Error('Does not match any of midiplayer event listeners');

		this.chordPlayers.forEach(chordPlayer => {
			if (event === 'chordStart') chordPlayer.onStart = data => callback(data);
			if (event === 'chordDuring') chordPlayer.onDuring = data => callback(data);
			if (event === 'chordEnd') chordPlayer.onEnd = data => callback(data);

			if (event !== 'noteStart' && event !== 'noteDuring' && event !== 'noteEnd') return;

			chordPlayer.notePlayers.forEach(notePlayer => {
				if (event === 'noteStart') notePlayer.onStart = data => callback(data);
				if (event === 'noteDuring') notePlayer.onDuring = data => callback(data);
				if (event === 'noteEnd') notePlayer.onEnd = data => callback(data);
			});
		});
	}

	playSong () {
		if (!this.songPath) throw new Error('songPath was not passed as an argument to the constructor')
		runShellAsync(`afplay ${this.songPath}`);
	}

	update () {
		this.chordPlayers.forEach(chordPlayer => chordPlayer.update());
	}

	async prepare () {
		try {
			const file = await readFile(this.jsonFilePath);
			const fileParsed = JSON.parse(file.toString());
			this.totalLength = fileParsed.meta.totalLength;
			const chords: Chord[] = fileParsed.chords;
			this.chordPlayers = [];
			chords.forEach((chord: Chord) =>
				this.chordPlayers.push( new ChordPlayer(chord))
			);
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
		};
		
		setImmediate(loop);
	}
}

export { EventData };
export default MidiPlayer;