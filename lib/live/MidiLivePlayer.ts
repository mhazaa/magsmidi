import easymidi from 'easymidi';

export type Events = 'noteStart' | 'noteEnd';

export type NoteData = {
	note?: number,
	velocity?: number,
	channel: number
}

class MidiLivePlayer {
	input: easymidi.Input;
	onStart: {(noteData: NoteData): void} | null = null;
	onEnd: {(noteData: NoteData): void} | null = null;

	constructor (midiKeyboard: string) {
		this.input = new easymidi.Input(midiKeyboard);
	}
	
	event (event: Events, callback: (noteData: NoteData) => void) {
		if (event === 'noteStart') this.onStart = (noteData: NoteData) => callback(noteData);
		if (event === 'noteEnd') this.onEnd = (noteData: NoteData) => callback(noteData);
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

export default MidiLivePlayer;