import easymidi from 'easymidi';

interface LivePlayerOptions {
	midiKeyboard?: string; // required but provided by default
}

const defaultLivePlayerOptions: LivePlayerOptions = {
	midiKeyboard: 'MPKmini2',
};

type EventTypes = 'noteStart' | 'noteEnd';
const eventTypes = ['noteStart', 'noteEnd'];

type EventData = {
	note?: number,
	velocity?: number,
	channel: number
}

class MidiLivePlayer {
	options: LivePlayerOptions;
	input: easymidi.Input;
	onStart: {(data: EventData): void} | null = null;
	onEnd: {(data: EventData): void} | null = null;

	constructor (midiKeyboard: string, options: LivePlayerOptions = {}) {
		this.options = { ...defaultLivePlayerOptions, ...options };
		this.input = new easymidi.Input(this.options.midiKeyboard!);
	}
	
	event (event: EventTypes, callback: (data: EventData) => void) {
		if (!eventTypes.includes(event)) throw new Error('Does not match any of midiplayer event listeners');
		if (event === 'noteStart') this.onStart = (data: EventData) => callback(data);
		if (event === 'noteEnd') this.onEnd = (data: EventData) => callback(data);
	}
	
	run () {
		const openNotes: {
			[key: string]: number;
		} = {};

		this.input.on('noteon', inputData => {
			const note = inputData.note;
			const velocity = inputData.velocity;
			const channel = (inputData.note % 12) + 1;
			openNotes[inputData.note] = channel;
			if (this.onStart) this.onStart({ note, channel, velocity });
		});
		
		this.input.on('noteoff', inputData => {
			const channel = openNotes[inputData.note];
			if (this.onEnd) this.onEnd({ channel });
		});
	}
}

export { LivePlayerOptions, EventData };
export default MidiLivePlayer;