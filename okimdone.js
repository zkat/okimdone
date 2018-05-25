const { spawn } = require('child_process');

// TODO: async/await, default parameter and spread operator of ES6 is only available 
// since Node v7.6, use Babel to transpile this into ES5
// TODO: the shell property in options param of exec() is only available since Node v5.7.0,
// should update package.json or provide an alternative solution

/**
 * Return an Promise which spawns a child process running the given command. Typically,
 * this method is used along with the async/await syntax. The returned Promise always resolves
 * after the execution of the command finishes, with its return code, regardless of whether
 * the execution was successful or not.
 * 
 * By default, the command runs in the shell, like "cmd /c ${cmd}" on Windows or
 * "/bin/sh" on *nix. Meanwhile, stdio is redirected directly to the stdio of this
 * process, which can be changed by specifing { stdio:... } in options.
 * Actually, the options param is passed to child_process.spawn().
 * 
 * @param {string} cmd The command to wrong, in form of the whole command string.
 * @param {Object} [options={}] The options used to run the command. Optional.
 * @see {@link https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options}
 */
var exec = (cmd, options = {}) => new Promise(resolve => {
	const proc = spawn(cmd, { shell: true, stdio: 'inherit', ...options });
	proc.on('close', code => resolve(code));
	proc.on('error', err => console.error(err));
});

/**
 * Check whether the given command exists, using "hash ${cmd} 2" and the returned
 * error code. This method only runs in *nix systems, otherwise it will only return false.
 * 
 * @param {string} cmd The command whost existence is to check, should be single-word.
 * @returns {boolean} Whether the given command exists.
 */
var exists = async cmd => {
	var code = await exec(`hash ${cmd} 2`, { stdio: 'ignore' });
	return code === 0;
};

/**
 * Generate a string to be used as input into some TTS program. The returned string
 * might 
 * @param {string} cmd The command.
 * @returns {string} The string to be used as input into some TTS program.
 */
var getSpeech = cmd => {
	var filtered = cmd.replace(/[^a-zA-Z0-9]/, '');
	return `ok im done running ${filtered}`;
};

(async function() {
	// execute the command
	var command = process.argv.slice(2).join(' ');
	var code = await exec(command);
	var imdone = getSpeech(command);

	if (process.platform === 'win32') {
		await exec(`mshta vbscript:Execute("CreateObject(""SAPI.SpVoice"").Speak(""${imdone}"")(window.close)")`);
	} else if (process.platform === 'darwin') {
		await exec(`say -v Samantha "${imdone}"`);
	} else { // consider linux
		if (exists('spd-say')) await exec(`spd-say -t female1 "${imdone}"`);
		else if (exists('espeak')) await exec(`espeak "${imdone}"`);
		else if (exists('festival')) await exec(`echo ${imdone} | festival --tts`);
		else console.log('No TTS program found!');
	}

	process.exit(code);  // return code of the command itself
})();
