import { UserConfig } from '../src';

const exampleConfig: UserConfig = {
	decoderOptions: {
		bpm: 192,
		channels: [1, 15, 30],
		lightTypes: ['blink', 'blend', 'fadein', 'fadeout'],
	},
	playerOptions: {
		log: true,
	},
};

export default exampleConfig;