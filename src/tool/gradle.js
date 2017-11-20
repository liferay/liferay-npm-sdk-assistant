import fs from 'fs';
import {spawnSync} from 'child_process';

import {parseVersion} from '../misc/util.js';

/**
 * @return {Promise}
 */
export function version() {
  return new Promise((resolve, reject) => {
    const out = runInGradle('lnk_get_version', `println gradle.gradleVersion`);

    if (!out) {
      return resolve(undefined);
    }

    resolve(parseVersion(out));
  });
}

/**
 * @return {Promise}
 */
export function nodePluginVersion() {
  return new Promise((resolve, reject) => {
    const out = runInGradle(
      'lnk_get_node_plugin_version',
      `buildscript.configurations.classpath.each { println it.name}`
    );

    if (!out) {
      return resolve(undefined);
    }

    const lines = out.split('\n');

    const pluginLines = lines.filter(line =>
      line.startsWith('com.liferay.gradle.plugins.node-')
    );

    if (pluginLines.length != 1) {
      return resolve(undefined);
    }

    const parts = pluginLines[0].split('-');

    if (parts.length != 2) {
      return resolve(undefined);
    }

    const version = parts[1].replace('.jar', '');

    resolve(parseVersion(version));
  });
}

/**
 * @param {String} task
 * @param {String} taskScript
 * @return {String}
 */
function runInGradle(task, taskScript = '') {
  let buildGradleContent;

  try {
    buildGradleContent = fs.readFileSync('build.gradle');
  } catch (err) {
    return undefined;
  }

  try {
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
      return undefined;
    }

    const out = proc.output.toString();
    const parts = out.split(`{${task}}`);

    if (parts.length != 3) {
      return undefined;
    }

    return parts[1];
  } catch (err) {
    return undefined;
  } finally {
    fs.unlinkSync('.build.gradle.liferay.npm.sdk');
  }
}
