const { spawn } = require('child_process');

// TODO: async/await, default parameter and spread operator of ES6 is only available in Node v7.6+, use
// Babel to transpile this into ES5

var exec = (cmd, options = {}) => new Promise(resolve => {  // use whole command string as cmd
	const proc = spawn(cmd, { shell: true, stdio: 'inherit', ...options }); // inherit stdio by default
	proc.on('close', code => resolve(code));
	proc.on('error', err => console.error(err));
});
var exists = async cmd => {
	var code = await exec(`hash ${cmd} 2`, { stdio: 'ignore' });
	return code === 0;
};

(async function() {
	var command = process.argv.slice(2).join(' ');
	var code = await exec(command);
	var doneStr = command.replace('"', ''); // remove " to avoid breaking "ok im done running ${command}"
	var imdone = `ok im done running ${doneStr}`;

	if (process.platform === 'win32') {
		await exec(`mshta vbscript:Execute("CreateObject(""SAPI.SpVoice"").Speak(""${imdone}"")(window.close)")`);
	} else if (process.platform === 'darwin') {
		await exec(`say -v Samantha "${imdone}"`);
	} else {
		if (exists('spd-say')) await exec(`spd-say -t female1 "${imdone}"`);
		else if (exists('espeak')) await exec(`espeak "${imdone}"`);
		else if (exists('festival')) await exec(`echo ${imdone} | festival --tts`);
		else console.log('No TTS program found!');
	}

	process.exit(code);
})();
