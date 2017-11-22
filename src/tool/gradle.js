import {spawnSync} from 'child_process';
import fs from 'fs';
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
      resolve(parseVersion(out));
    } catch (err) {
      if (debug) {
        console.error('Could not get gradle version', err);
      }

      return undefined;
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

      resolve(parseVersion(version));
    } catch (err) {
      if (debug) {
        console.error('Could not get gradle node plugin version', err);
      }

      return undefined;
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
    const buildGradleContent = fs.readFileSync('build.gradle');

    fs.writeFileSync(
      '.build.gradle.liferay.npm.sdk',
      `
${buildGradleContent}
task ${task} << {
	println "{${task}}"
	${taskScript}
	println "{${task}}"
}
			`
    );

    const proc = runGradle(debug, '-b', '.build.gradle.liferay.npm.sdk', task);

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
      fs.unlinkSync('.build.gradle.liferay.npm.sdk');
    } catch (err) {
      // Ignore
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

  let executable = 'gradle';

  let dir = path.resolve('.');

  while (dir != '/') {
    if (fs.existsSync(`${dir}/${cmdName}`)) {
      executable = `${dir}/${cmdName}`;
      break;
    }

    dir = path.dirname(dir);
  }

  if (debug) {
    console.log('Running', executable, ...args);
  }

  return spawnSync('gradle', args, {
    shell: true,
  });
}
