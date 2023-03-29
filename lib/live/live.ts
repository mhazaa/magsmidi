import MidiLivePlayer, { NoteData } from './MidiLivePlayer';
import DMXControls from '../../modules/DMXControls';
import { Color } from '../MidiDecoder';

const midiLivePlayer = new MidiLivePlayer('KOMPLETE KONTROL S61 MK2 Port 1');
const dmxControls = new DMXControls('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-AB0KU85Q'); // mac
// const dmxControls = new DMXControls('demo', 'enttec-open-usb-dmx', 'COM4'); // windows

midiLivePlayer.run();

midiLivePlayer.event('noteStart', (noteData: NoteData) => {
	//console.log(noteData);
	const color: Color = new Color();
	//dmxControls.setColor(noteData.channel, color.r, color.g, color.b, noteData.velocity);
	let velocity = noteData.velocity || 255;
	if (velocity < 10) velocity = 10;
	console.log(velocity);

	dmxControls.setChannel(1, velocity || 255);
	dmxControls.setChannel(2, Color.randomColorValue());
	dmxControls.setChannel(3, Color.randomColorValue());
	dmxControls.setChannel(4, Color.randomColorValue());
});

midiLivePlayer.event('noteEnd', (noteData: NoteData) => {
	//console.log(noteData);
	dmxControls.setColor(1, 0, 0, 0, 0);
});