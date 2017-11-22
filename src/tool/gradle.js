import {spawnSync} from 'child_process';
import fs from 'fs-extra';
import path from 'path';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const out = runInGradle(
        debug,
        'lnk_get_version',
        `println gradle.gradleVersion`,
        debug
      );

      const parsedVersion = parseVersion(out);

      if (parsedVersion === undefined) {
        throw new Error('Could not parse: ' + version);
      }

      resolve(parsedVersion);
    } catch (err) {
      if (debug) {
        console.error('Could not get gradle version', err);
      }

      resolve(undefined);
    }
  });
}

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function nodePluginVersion({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const out = runInGradle(
        debug,
        'lnk_get_node_plugin_version',
        `buildscript.configurations.classpath.each { println it.name}`
      );

      const lines = out.split('\n');

      const pluginLines = lines.filter(line =>
        line.startsWith('com.liferay.gradle.plugins.node-')
      );

      if (pluginLines.length != 1) {
        throw new Error('Could not find node plugin in output: ' + out);
      }

      const parts = pluginLines[0].split('-');

      if (parts.length != 2) {
        throw new Error(
          'Could not find node plugin version in: ' + pluginLines[0]
        );
      }

      const version = parts[1].replace('.jar', '');

      const parsedVersion = parseVersion(version);

      if (parsedVersion === undefined) {
        throw new Error('Could not parse: ' + version);
      }

      resolve(parsedVersion);
    } catch (err) {
      if (debug) {
        console.error('Could not get gradle node plugin version', err);
      }

      resolve(undefined);
    }
  });
}

/**
 * @param {boolean} debug
 * @param {String} task
 * @param {String} taskScript
 * @return {String}
 */
function runInGradle(debug, task, taskScript = '') {
  try {
    fs.copySync('build.gradle', 'build.gradle.lnka');
  } catch (err) {
    throw err;
  }

  try {
    const buildGradleContent = fs.readFileSync('build.gradle');

    fs.writeFileSync(
      'build.gradle',
      `
${buildGradleContent}

task ${task} << {
	println "{${task}}"
	${taskScript}
	println "{${task}}"
}
			`
    );

    const proc = runGradle(debug, task);

    if (proc.error) {
      throw proc.error;
    }

    const out = proc.output.toString();
    const parts = out.split(`{${task}}`);

    if (parts.length != 3) {
      throw new Error('Could not parse gradle output: ' + out);
    }

    return parts[1];
  } finally {
    try {
      fs.copySync('build.gradle.lnka', 'build.gradle');
      fs.unlinkSync('build.gradle.lnka');
    } catch (err) {
      console.log(
        'ERROR: lnka modified your build.gradle but was unable to',
        'restore it to its original form. There is still a copy of',
        'the original build.gradle file in build.gradle.lnka. Please',
        'restore it manually and file an issue in lnka project.',
        'Sorry for the inconveniences :-('
      );
      console.log(
        'Here is the error that prevented the restore, for debugging',
        'purposes:',
        err
      );
      process.exit(1);
    }
  }
}

/**
 * @param {boolean} debug
 * @param {Array} args
 * @return {Object} a Node.js process descriptor
 */
function runGradle(debug, ...args) {
  const isWin = /^win/.test(process.platform);

  const cmdName = isWin ? 'gradlew.bat' : 'gradlew';

  let executable = cmdName;

  let dir = path.resolve('.');

  while (dir != '/') {
    if (fs.existsSync(`${dir}/${cmdName}`)) {
      executable = `${dir}/${cmdName}`;
      break;
    }

    dir = path.dirname(dir);
  }

  executable = path.normalize(executable);

  if (debug) {
    console.log('Running', executable, ...args);
  }

  return spawnSync('gradle', args, {
    shell: true,
  });
}
