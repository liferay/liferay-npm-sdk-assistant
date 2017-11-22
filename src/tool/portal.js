import GogoShell from 'gogo-shell';
import http from 'http';

import {parseVersion} from '../misc/util.js';

/**
 * @param {String} server
 * @param {int} gogoPort
 * @param {String} bundleName
 * @param {boolean} debug
 * @return {Promise}
 */
export function osgiBundleVersion(
  {server = 'localhost', gogoPort = '11311', bundleName, debug = false} = {}
) {
  return new Promise((resolve, reject) => {
    const handleError = function(err) {
      if (debug) {
        console.error(`Could not get bundle '${bundleName}' version`, err);
      }

      resolve(undefined);
    };

    const gogoShell = new GogoShell();

    gogoShell.on('error', handleError);

    if (debug) {
      console.log(
        'Querying GoGo console at',
        `${server}:${gogoPort}`,
        'for',
        `"${bundleName}"`,
        'version'
      );
    }

    return gogoShell
      .connect({
        host: server,
        port: gogoPort,
      })
      .then(() => gogoShell.sendCommand(`lb | grep '${bundleName}'`))
      .then(data => {
        try {
          gogoShell.end();

          const lines = data.split('\n');

          const versionLines = lines.filter(
            line => line.indexOf(bundleName) != -1 && line.indexOf('grep') == -1
          );

          if (versionLines.length != 1) {
            throw new Error(
              `Bundle name '${bundleName}' not found in output: `,
              data
            );
          }

          const versionLine = versionLines[0];

          const match = versionLine.match(/(\(.*\))/);

          const version = match[1].replace(/[^0-9.]/g, '');

          resolve(parseVersion(version));
        } catch (err) {
          handleError(err);
        }
      })
      .catch(handleError);
  });
}

/**
 * @param {String} server
 * @param {int} httpPort
 * @param {boolean} debug
 * @return {Promise}
 */
export function amdLoaderVersion(
  {server = 'localhost', httpPort = 8080, debug = false} = {}
) {
  // TODO: get loader version from OSGi capability
  return new Promise((resolve, reject) => {
    const handleError = function(err) {
      if (debug) {
        console.error(`Could not get AMD loader version`, err);
      }

      resolve(undefined);
    };

    if (debug) {
      console.log(
        'Querying Liferay Portal at',
        `${server}:${httpPort}`,
        'for AMD Loader version'
      );
    }

    http
      .get(
        `http://${server}:${httpPort}/o/frontend-js-web/loader/loader.js`,
        res => {
          try {
            const {statusCode} = res;

            if (statusCode !== 200) {
              throw new Error('HTTP error: ' + statusCode);
            }

            let data = '';
            res.on('error', handleError);
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
              const lines = data.split('\n');

              const versionLines = lines.filter(line =>
                line.match(/Loader.version\s*=/)
              );

              if (versionLines.length != 1) {
                throw new Error(
                  'Loader version not found in server response: ' + data
                );
              }

              const versionLine = versionLines[0];

              const match = versionLine.match(/.*'([0-9.]*)'.*/);

              if (!match[1]) {
                'Loader version not found version line: ' + versionLine;
              }

              resolve(parseVersion(match[1]));
            });
          } catch (err) {
            handleError(err);
          }
        }
      )
      .on('error', handleError);
  });
}
