const MidiDecoder = require(__dirname + '/../lib/MidiDecoder');
const MidiPlayer = require(__dirname + '/../lib/MidiPlayer');

const BlinkstickControls = require(__dirname + '/../modules/BlinkstickControls');
const blinkstickControls = new BlinkstickControls();
blinkstickControls.connect();
blinkstickControls.turnOffAll();

module.exports.decode = async (filePath, output) => {
  try {
    const chords = await MidiDecoder.decode(filePath, output);
    console.log(chords);
  } catch (error) {
    console.log(`UH-OH: ${error}`);
  }
}

module.exports.play = async(song, jsonFile) => {
  try {
    const midiPlayer = new MidiPlayer();
    await midiPlayer.cookMidi(jsonFile);

    midiPlayer.event('noteStart', (notePlayer) => {
      console.log(notePlayer.key + ': started');
      notePlayer.lights.forEach( light => {
        blinkstickControls.setColor(light.colors[0].r, light.colors[0].b, light.colors[0].g, light.channel);
      });
    });

    midiPlayer.event('noteEnd', (notePlayer) => {
      console.log(notePlayer.key + ': end');
      notePlayer.lights.forEach( light => {
        blinkstickControls.setColor(0, 0, 0, light.channel)
      });
    });

    midiPlayer.event('noteDuring', (notePlayer) => {
      //console.log(notePlayer.key + ': during');

      notePlayer.lights.forEach( light => {
        if (light.type === 'blink') return;

        if (light.type === 'blend') {
          const color = notePlayer.blend(light.colors[0], light.colors[1]);
          blinkstickControls.setColor(color.r, color.g, color.b, light.channel);
        }

        if (light.type === 'fadein' ) {
          const color = notePlayer.fadein(light.colors[0]);
          blinkstickControls.setColor(color.r, color.g, color.b, light.channel);
        }

        if (light.type === 'fadeout' ) {
          const color = notePlayer.fadeout(light.colors[0]);
          blinkstickControls.setColor(color.r, color.g, color.b, light.channel);
        }
      });
    });

    midiPlayer.play(song);
  } catch (error) {
    console.log(`UH-OH: ${error}`);
  }
}

module.exports.live = async () => {
  try {
    //require(__dirname + '/../modules/serial.js')();
    //return;
    const chords = await MidiDecoder.decode(filePath, output);
    console.log(chords);
  } catch (error) {
    console.log(`UH-OH: ${error}`);
  }
}
