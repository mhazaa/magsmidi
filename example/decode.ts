import { resolve } from 'path';
import { MidiDecoder } from '../src';
MidiDecoder.decode(resolve(__dirname, 'assets/midi.mid'));