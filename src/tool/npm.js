import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const proc = spawnSync('npm', ['-v']);

      if (proc.error) {
        throw proc.error;
      }

      const out = proc.output.toString();

      if (!out) {
        throw new Error('No output returned from npm');
      }

      const version = out.replace(/[^0-9.]/g, '');

      resolve(parseVersion(version));
    } catch (err) {
      if (debug) {
        console.error('Could not get npm version', err);
      }

      return undefined;
    }
  });
}
