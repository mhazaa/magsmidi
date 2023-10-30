import DMX, { Universe } from 'dmx';

export default class DMXControls {
	dmx: DMX;
	universe: Universe;

	constructor (universeName: string, driver: string, deviceId: string) {
		this.dmx = new DMX();
		this.universe = this.dmx.addUniverse(universeName, driver, deviceId);
	}
	
	setColor (channel: number, r: number, g: number, b: number, brightness = 255): void {
		this.universe.update({
			[channel]: brightness,
			[channel+1]: r,
			[channel+2]: g,
			[channel+3]: b
		});
	}
	
	setChannel (channel: number, value: number): void {
		this.universe.update({
			[channel]: value
		});
	}
}