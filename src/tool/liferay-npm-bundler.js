import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @return {Promise}
 */
export function version() {
  return new Promise((resolve, reject) => {
    // TODO: get version directly from liferay-npm-bundler
    // (see https://github.com/liferay/liferay-npm-build-tools/issues/64)
    const proc = spawnSync('npm', ['list']);

    if (proc.error) {
      return resolve(undefined);
    }

    const out = proc.output.toString();

    if (!out) {
      return resolve(undefined);
    }

    const lines = out.split('\n');

    const versionLines = lines.filter(
      line => line.indexOf('liferay-npm-bundler@') != -1
    );

    if (versionLines.length != 1) {
      return resolve(undefined);
    }

    const versionLine = versionLines[0];

    const version = versionLine.replace(/[^0-9.]/g, '');

    resolve(parseVersion(version));
  });
}
