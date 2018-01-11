import {spawn, spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

const OLD_VERSION_DETECTED_MESSAGE = 'Old liferay-npm-bundler version detected';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    runLiferayNpmBundlerVersions(debug)
      .then(json => {
        const version = json['liferay-npm-bundler'];

        if (!version) {
          throw new Error(
            'No liferay-npm-bundler version present in JSON: ' + json
          );
        }

        const parsedVersion = parseVersion(version);

        if (parsedVersion === undefined) {
          throw new Error('Could not parse: ' + version);
        }

        resolve(parsedVersion);
      })
      .catch(err => {
        if (err.message === OLD_VERSION_DETECTED_MESSAGE) {
          legacyVersion(debug, resolve, reject);
        } else {
          if (debug) {
            console.error('Could not get liferay-npm-bundler version', err);
          }

          resolve(undefined);
        }
      });
  });
}

/**
 *
 * @param  {boolean} debug
 * @param  {function} resolve
 * @param  {function} reject
 * @return {void}
 */
function legacyVersion(debug, resolve, reject) {
  try {
    const proc = legacyRunNpm(debug, 'list');

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
        'More than one liferay-npm-bundler line present in ' + 'output: ' + out
      );
    }

    const versionLine = versionLines[0];

    const version = versionLine.replace(/[^0-9.]/g, '');

    const parsedVersion = parseVersion(version);

    if (parsedVersion === undefined) {
      throw new Error('Could not parse: ' + version);
    }

    resolve(parsedVersion);
  } catch (err) {
    if (debug) {
      console.error('Could not get liferay-npm-bundler version', err);
    }

    resolve(undefined);
  }
}

/**
 * @param {boolean} debug
 * @param {Array} args
 * @return {Object} a Node.js process descriptor
 */
function legacyRunNpm(debug, ...args) {
  const executable = 'npm';

  if (debug) {
    console.log('Running', executable, ...args);
  }

  return spawnSync(executable, args, {shell: true});
}

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function pluginVersions({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    runLiferayNpmBundlerVersions(debug)
      .then(json => {
        delete json['liferay-npm-bundler'];

        for (let key in json) {
          if (json.hasOwnProperty(key)) {
            const version = json[key];

            const parsedVersion = parseVersion(version);

            if (parsedVersion === undefined) {
              throw new Error('Could not parse: ' + version);
            }

            json[key] = parsedVersion;
          }
        }

        resolve(json);
      })
      .catch(err => {
        if (debug) {
          console.error(
            'Could not get liferay-npm-bundler plugin versions',
            err
          );
        }

        resolve(undefined);
      });
  });
}

/**
 *
 * @param  {boolean} debug
 * @return {Promise} a Promise that resolves with the JSON data
 */
function runLiferayNpmBundlerVersions(debug) {
  return new Promise((resolve, reject) => {
    runLiferayNpmBundler(debug, '-v')
      .then(output => {
        try {
          resolve(JSON.parse(output));
        } catch (err) {
          reject(new Error('Cannot parse JSON: ' + output));
        }
      })
      .catch(reject);
  });
}

/**
 * @param {boolean} debug
 * @param {Array} args
 * @return {Promise} a Promise that resolves with the output of the process
 */
function runLiferayNpmBundler(debug, ...args) {
  return new Promise((resolve, reject) => {
    const executable = './node_modules/.bin/liferay-npm-bundler';

    if (debug) {
      console.log('Running', executable, ...args);
    }

    const proc = spawn(executable, args, {shell: true});

    let output = '';
    let firstChar = true;

    proc.stdout.on('data', data => {
      data = data.toString();

      // Detect older versions of liferay-npm-bundler
      if (firstChar && data.substr(0, 1) !== '{') {
        proc.kill();
      } else {
        firstChar = false;
      }

      output += data;
    });

    proc.on('error', err => reject(err));

    proc.on('close', code => {
      if (code === null) {
        reject(new Error(OLD_VERSION_DETECTED_MESSAGE));
      } else if (code !== 0) {
        reject(new Error(`Program exited with code: ${code}`));
      } else {
        resolve(output);
      }
    });
  });
}
