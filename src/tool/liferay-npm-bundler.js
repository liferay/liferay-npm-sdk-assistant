import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    // TODO: get version directly from liferay-npm-bundler
    // (see https://github.com/liferay/liferay-npm-build-tools/issues/64)
    try {
      const proc = runNpm(debug, 'list');

      if (proc.error) {
        throw proc.error;
      }

      const out = proc.output.toString();

      if (!out) {
        throw new Error('No output returned from npm');
      }

      const lines = out.split('\n');

      const versionLines = lines.filter(
        line => line.indexOf('liferay-npm-bundler@') != -1
      );

      if (versionLines.length != 1) {
        throw new Error(
          'More than one liferay-npm-bundler line present in ' +
            'output: ' +
            out
        );
      }

      const versionLine = versionLines[0];

      const version = versionLine.replace(/[^0-9.]/g, '');

      resolve(parseVersion(version));
    } catch (err) {
      if (debug) {
        console.error('Could not get liferay-npm-bundler version', err);
      }

      return undefined;
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
