const defaultConfig = {
  decoderOptions: {
    bpm: 120,
    randomize: true,
    channelsRange: [0, 7], //[min, max]
    //channels: [1], //[0, 1, 2, 3...] //takes priority over channelsRange
    colors: ['#9500ff', '#ffba00', '#0700ff', '#00ffb3', '#ff000f'], //random color if not defined
    types: ['blink', 'fadein', 'blend'] //select between ['blink', 'blend', 'fadein', 'fadeout']
  },
  playerOptions: {
    log: false,
    logDuring: false,
    loopLights: false
  },
  livePlayerOptions: {
    midiKeyboard: 'MPKmini2'
  }
}

const userConfig = () => {
  try {
    return require('../../magsmidi.config');
  } catch {
    return {
      decoderOptions: {},
      livePlayerOptions: {}
    };
  }
}

const _userConfig = userConfig();

const CONFIG = {
  decoderOptions: {
    ...defaultConfig.decoderOptions,
    ..._userConfig.decoderOptions
  },
  playerOptions: {
    ...defaultConfig.playerOptions,
    ..._userConfig.playerOptions
  },
  livePlayerOptions: {
    ...defaultConfig.livePlayerOptions,
    ..._userConfig.livePlayerOptions
  }
}

module.exports = CONFIG;
