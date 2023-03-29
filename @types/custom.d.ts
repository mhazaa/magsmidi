declare module 'dmx' {
	class DMX {
		universe: any;
		addUniverse (universeName: string, driver: string, deviceId: string): void;
	}

    export default DMX;
}

declare module 'midi-parser-js' {
	const midiParser: any;
    export default midiParser;
}