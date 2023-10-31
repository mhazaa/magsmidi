import MidiPlayer, { EventData } from './MidiPlayer';
import DMXControls from '../modules/DMXControls';

const MidiLauncher = async (midiPlayers: MidiPlayer[], lightDevice: DMXControls) => {
	await Promise.all(midiPlayers.map(async midiPlayer =>
		await midiPlayer.prepare()
	));

	midiPlayers.forEach(midiPlayer => {
		midiPlayer.event('noteStart', (data: EventData) => {
			lightDevice.setColor(data.channel, data.r, data.g, data.b);
		});
		
		midiPlayer.event('noteDuring', (data: EventData) => {
			lightDevice.setColor(data.channel, data.r, data.g, data.b);
		});

		midiPlayer.event('noteEnd', (data: EventData) => {
			lightDevice.setColor(data.channel, data.r, data.g, data.b);
		});
	});

	midiPlayers.forEach(midiPlayer => midiPlayer.play());
};

export default MidiLauncher;