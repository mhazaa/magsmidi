const MidiDecoder = require(__dirname + '/../lib/MidiDecoder');
const MidiLivePlayer = require(__dirname + '/../lib/MidiLivePlayer');

module.exports.decode = async (midiFilePath, output) => {
  try {
    const chords = await MidiDecoder.decode(midiFilePath, output);
    console.log(chords);
  } catch (error) {
    console.log(`UH-OH: ${error}`);
  }
}

module.exports.livePlay = async () => {
  try {
    const midiLivePlayer = new MidiLivePlayer();
    midiLivePlayer.start();
  } catch (error) {
    console.log(`UH-OH: ${error}`);
  }
}
