import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const proc = spawnSync('./node_modules/.bin/babel', ['--version']);

      if (proc.error) {
        throw proc.error;
      }

      const out = proc.output.toString();

      if (!out) {
        throw new Error('No output returned');
      }

      const version = out.replace(/\(.*\)/, '').replace(/[^0-9.]/g, '');

      resolve(parseVersion(version));
    } catch (err) {
      if (debug) {
        console.error('Could not get babel version', err);
      }

      return resolve(undefined);
    }
  });
}
