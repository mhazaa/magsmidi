import DMXControls from '../modules/DMXControls';
const dmxControls = new DMXControls('demo', 'enttec-open-usb-dmx', '/dev/cu.usbserial-AB0KU85Q');
import events from 'events';
const eventEmitter = new events.EventEmitter();
import map from '../helperFunctions/map';

let timeElapsed = 0;
let reset = true;

const CONFIG: {
	loop: boolean;
	totalLength: number;
} = {
	loop: true,
	totalLength: 2000
};

class Timer {
	deltaTime = new Date();
	currentTime: Date;
	end = 0;

	restart (): void {
		this.deltaTime = new Date();
		timeElapsed = 0;
		reset = !reset;
		eventEmitter.emit('timerRestarting');
	}

	tick (): number {
		this.currentTime = new Date();
		timeElapsed = this.currentTime.getTime() - this.deltaTime.getTime();
		if (CONFIG.loop && timeElapsed > this.end) this.restart();
		return timeElapsed;
	}
}

const update = () => {
	const x = timeElapsed / 1000;
	//x = Math.ceil(x);
	/*if (x === 2) {
	}*/
	const value = map(x, 0, CONFIG.totalLength / 1000, 0, 255);
	//value = Math.ceil(value);
	
	if (reset) {
		dmxControls.setColor(1, 255 - value, 0, value);
		dmxControls.setColor(15, value, 0, 255 - value);	
	} else {
		dmxControls.setColor(1, value, 0, 255 - value);
		dmxControls.setColor(15, 255 - value, 0, value);	
	}
};

let stop = false;

const update2 = () => {
	return;
	if (stop) return;
	const x = timeElapsed / 1000;
	const value = map(x, 0, CONFIG.totalLength / 1000, 0, 255);
	if (value === 255) stop = true;
	dmxControls.setColor(30, value / 2, value / 2, 0);
}

const update3 = () => {
	dmxControls.setColor(1, 0, 255, 0);
}

const runner = () => {
	const timer = new Timer();
	timer.end = CONFIG.totalLength;

	const loop = () => {
		setImmediate(loop);
		timer.tick(); //updates the global timeElapsed
		dmxControls.setColor(1, 255, 0, 0);
		//update3();
	};
	
	setImmediate(loop);
};

runner();