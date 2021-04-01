const CONFIG = require(__dirname + '/../decoder.config.js');
const commands = require(__dirname + '/../src/commands');
const argsParser = require('mags-modules/argsParser');

const args = argsParser({
  '-decode': ['string', 'string'],
  '-play': ['string', 'string'],
  //'-decodeNplay': ['string'],
  //'-live': [];
  '-d': '-decode',
  '-p': '-play',
  '-dp': '-decodeNplay',
  '-l': '-live'
});

const decode = args['-decode'];
const play = args['-play'];
const decodeNplay = args['-decodeNplay'];

module.exports = () => {
  if(decode) commands.decode(decode[0], decode[1]);
  if(play) commands.play(play[0], play[1]);
  //if(decodeNplay) commands.play(decodeNplay[0]);
  //if(live) commands.live();
}
