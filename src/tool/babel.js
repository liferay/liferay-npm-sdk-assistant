import {spawnSync} from 'child_process';

import {parseVersion} from '../lib/util.js';

/**
 * @return {Promise}
 */
export function version() {
	return new Promise((resolve, reject) => {
		const proc = spawnSync('./node_modules/.bin/babel', ['--version']);

		if (proc.error) {
			return resolve(undefined);
		}

		const out = proc.output.toString();

		if (!out) {
			return resolve(undefined);
		}

		const version = out.replace(/\(.*\)/, '').replace(/[^0-9.]/g, '');

		resolve(parseVersion(version));
	});
}
