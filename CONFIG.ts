import defaultConfig, { Config } from './defaultConfig';
import userConfig from './userConfig';

const config: Config = {
	decoderOptions: {
		...defaultConfig.decoderOptions,
		...userConfig.decoderOptions || {},
	},
	playerOptions: {
		...defaultConfig.playerOptions,
		...userConfig.playerOptions || {},
	},
	livePlayerOptions: {
		...defaultConfig.livePlayerOptions,
		...userConfig.playerOptions || {},
	}
};

export default config;