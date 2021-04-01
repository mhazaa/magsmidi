//require(__dirname + '/../modules/serial.js')();
//return;

const CONFIG = require(__dirname + '/../decoder.config.js');
const commands = require(__dirname + '/../src/commands');
const argsParser = require('mags-modules/argsParser');

const args = argsParser({
  '-decode': ['string', 'string'],
  '-play': ['string', 'string'],
  '-d': '-decode',
  '-p': '-play'
});

console.log(args);
const decode = args['-decode'];
const play = args['-play'];
const bpm = CONFIG.bpm || 120;

module.exports = () => {
  if(decode) commands.decode(decode[0], decode[1]);
  if(play) commands.play(play[0], play[1]);
}
