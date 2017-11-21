import fs from 'fs';
import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @param {boolean} debug
 * @return {Promise}
 */
export function version({debug = false} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const out = runInGradle(
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
 * @param {String} task
 * @param {String} taskScript
 * @param {boolean} debug
 * @return {String}
 */
function runInGradle(task, taskScript = '', debug = false) {
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

    const proc = spawnSync('gradle', [
      '-b',
      '.build.gradle.liferay.npm.sdk',
      task,
    ]);

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
