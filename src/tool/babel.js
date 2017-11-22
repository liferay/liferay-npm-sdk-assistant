import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const proc = runBabel(debug, '--version');

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

      resolve(undefined);
    }
  });
}

/**
 * @param {boolean} debug
 * @param {Array} args
 * @return {Object} a Node.js process descriptor
 */
function runBabel(debug, ...args) {
  const isWin = /^win/.test(process.platform);

  const executable = isWin
    ? './node_modules/.bin/babel.cmd'
    : './node_modules/.bin/babel';

  if (debug) {
    console.log('Running', executable, ...args);
  }

  return spawnSync(executable, args, {shell: true});
}
