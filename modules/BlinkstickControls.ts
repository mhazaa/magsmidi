import blinkstick from 'blinkstick';

export default class BlinkstickControls {
	led;

	constrctor () {
		this.led = null;
	}
	
	connect () {
		this.led = blinkstick.findFirst();
	}
	
	turnOffBlinkstick (channel) {
		if (typeof this.led === 'undefined') throw new Error('You need to run the connect method first. Led is not defined yet');
		this.led.setColor(0,0,0,{index: channel});
	}
	
	turnOffAll () {
		for (let i=0; i<=8; i++) this.turnOffBlinkstick(i);
	}
	
	setColor (r, g, b, channel) {
		this.led.setColor(
			r,
			g,
			b,
			{index: channel},
		);
	}
}