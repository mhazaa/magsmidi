#!/usr/bin/env node
const commands = require(__dirname + '/../src/commands');
const argsParser = require('mags-modules/argsParser');

const args = argsParser({
  '-decode': ['string', 'string'], //(midiFilePath, output)
  '-livePlay': [],
  '-d': '-decode',
  '-lp': '-livePlay'
});

const decode = args['-decode'];
if (decode) {
  const midiFilePath = decode[0];
  if (!midiFilePath) throw new Error('midiFilePath must be defined as the first argument')
  const output = decode[1] || null;
  commands.decode(midiFilePath, output);
}

const livePlay = args['-livePlay'];
if (livePlay) {
  commands.livePlay();
}
