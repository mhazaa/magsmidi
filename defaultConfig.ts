import { LightTypes } from './lib/MidiDecoder';

interface Config {
	decoderOptions: {
		bpm: number,
		channelsRange?: [number, number], // [min, max]
		channels?: number[], // takes priority over channelsRange
		colors?: string[], // randomized if not defined
		lightTypes?: LightTypes[], // randomized if not defined
	},
	playerOptions: {
		log: boolean,
		logDuring: boolean,
		loopLights: boolean,
	},
	livePlayerOptions: {
		midiKeyboard: string,
	},
}

interface UserConfig {
	decoderOptions?: {
		bpm?: number,
		channelsRange?: [number, number],
		channels?: number[],
		colors?: string[],
		lightTypes?: LightTypes[],
	},
	playerOptions?: {
		log?: boolean,
		logDuring?: boolean,
		loopLights?: boolean,
	},
	livePlayerOptions?: {
		midiKeyboard?: string,
	},
}

const defaultConfig: Config = {
	decoderOptions: {
		bpm: 120,
		channelsRange: [1, 15], 
		colors: ['#9500ff', '#ffba00', '#0700ff', '#00ffb3', '#ff000f'],
		lightTypes: ['blink', 'fadein', 'blend'],
	},
	playerOptions: {
		log: false,
		logDuring: false,
		loopLights: false,
	},
	livePlayerOptions: {
		midiKeyboard: 'MPKmini2',
	},
};

export { Config, UserConfig };
export default defaultConfig;