import fs from 'fs';

const readFile = (file: fs.PathOrFileDescriptor, options = {}): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, options, (error, data) => {
			if (error) reject(error);
			resolve(data);
		});
	});
};

const writeFile = (file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<string | NodeJS.ArrayBufferView> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, (error) => {
			if(error) reject(error);
			resolve(data);
		});
	});
};

export { readFile, writeFile };