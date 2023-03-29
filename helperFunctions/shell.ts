import childProcess from 'child_process';
const exec = childProcess.exec;
const execFile = childProcess.execFile;

const runShellAsync = async (cmd: string, options = {}) => {
	return new Promise((resolve, reject) => {
		exec(cmd, options, error => {
			if(error) reject(error);
			resolve(null);
		});
	});
};

const runShellFileAsync = async (file: string, options = {}) => {
	return new Promise((resolve, reject) => {
		execFile(file, options, (error) => {
			if(error) reject(error);
			resolve(null);
		});
	});
};

export { runShellAsync, runShellFileAsync };