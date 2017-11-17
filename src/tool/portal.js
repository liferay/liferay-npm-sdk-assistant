import GogoShell from 'gogo-shell';
import http from 'http';

import {parseVersion} from '../lib/util.js';

/**
 * @param {String} server
 * @param {int} port
 * @param {String} bundleName
 * @return {Promise}
 */
export function osgiBundleVersion(server, port, bundleName) {
	return new Promise((resolve, reject) => {
		const gogoShell = new GogoShell();

		gogoShell.on('error', err => resolve(undefined));

		return gogoShell
			.connect({
				host: server,
				port: port,
			})
			.then(() => gogoShell.sendCommand(`lb | grep '${bundleName}'`))
			.then(data => {
				gogoShell.end();

				const lines = data.split('\n');

				const versionLines = lines.filter(
					line =>
						line.indexOf(bundleName) != -1 &&
						line.indexOf('grep') == -1
				);

				if (versionLines.length != 1) {
					return resolve(undefined);
				}

				const versionLine = versionLines[0];

				const match = versionLine.match(/(\(.*\))/);

				const version = match[1].replace(/[^0-9.]/g, '');

				resolve(parseVersion(version));
			})
			.catch(err => resolve(undefined));
	});
}

/**
 * @param {String} server
 * @param {int} port
 * @return {Promise}
 */
export function amdLoaderVersion(server, port) {
	// TODO: get loader version from OSGi capability
	return new Promise((resolve, reject) => {
		http
			.get(
				`http://${server}:${port}/o/frontend-js-web/loader/loader.js`,
				res => {
					const {statusCode} = res;

					if (statusCode !== 200) {
						return resolve(undefined);
					}

					let data = '';
					res.on('error', err => resolve(undefined));
					res.on('data', chunk => (data += chunk));
					res.on('end', () => {
						const lines = data.split('\n');

						const versionLines = lines.filter(line =>
							line.match(/Loader.version\s*=/)
						);

						if (versionLines.length != 1) {
							return resolve(undefined);
						}

						const versionLine = versionLines[0];

						const match = versionLine.match(/.*'([0-9.]*)'.*/);

						if (!match[1]) {
							return resolve(undefined);
						}

						resolve(parseVersion(match[1]));
					});
				}
			)
			.on('error', err => resolve(undefined));
	});
}
