import { resolve } from 'path';
import { MidiPlayer, MidiLauncher, DMXControls } from '../src';
const dmxControls = new DMXControls('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-AB0KU85Q');
const music = new MidiPlayer(
	resolve(__dirname, 'assets/midi.json'),
	resolve(__dirname, 'assets/audio.wav'),
);
MidiLauncher([music], dmxControls);