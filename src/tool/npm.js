import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const proc = runNpm(debug, '-v');

      if (proc.error) {
        throw proc.error;
      }

      const out = proc.output.toString();

      if (!out) {
        throw new Error('No output returned from npm');
      }

      const version = out.replace(/[^0-9.]/g, '');

      const parsedVersion = parseVersion(version);

      if (parsedVersion === undefined) {
        throw new Error('Could not parse: ' + version);
      }

      resolve(parsedVersion);
    } catch (err) {
      if (debug) {
        console.error('Could not get npm version', err);
      }

      resolve(undefined);
    }
  });
}

/**
 * @param {boolean} debug
 * @param {Array} args
 * @return {Object} a Node.js process descriptor
 */
function runNpm(debug, ...args) {
  const executable = 'npm';

  if (debug) {
    console.log('Running', executable, ...args);
  }

  return spawnSync(executable, args, {shell: true});
}
