const defaultConfig = {
  decoderOptions: {
    bpm: 70,
    randomize: true,
    channelsRange: [1, 6], //[min, max]
    channels: [1], //[0, 1, 2, 3...] //takes priority over channelsRange
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    types: ['fadein'] //select between ['blink', 'blend', 'fadein', 'fadeout']
  },
  playerOptions: {
    log: false,
    logDuring: false
  },
  livePlayerOptions: {
    midiKeyboard: 'MPKmini2'
  }
}

const userConfig = () => {
  try {
    const x = require('../../../magsmidi.config');
    console.log(x);
  } catch {
    return {
      decoderOptions: {},
      livePlayerOptions: {}
    };
  }
}

const CONFIG = () => {
  const config = {};
  for (const [key, value] of Object.entries(defaultConfig)) {
    config[key] = defaultConfig[key];
    if (typeof userConfig()[key] !== 'undefined') config[key] = Object.assign(config[key], userConfig()[key]);
  }
  return config;
}

module.exports = CONFIG();
