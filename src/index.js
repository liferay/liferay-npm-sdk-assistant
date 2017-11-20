import {lessThan, formatVersion} from './misc/util';
import * as gradle from './tool/gradle';
import * as npm from './tool/npm';
import * as babel from './tool/babel';
import * as liferayNpmBundler from './tool/liferay-npm-bundler';
import * as portal from './tool/portal';

/** The current maximum feature level */
const maxFeatureLevel = 2;

/** Feature level breakpoints for the different components */
const gradleBreakpoints = [{version: [2, 5, 0], level: maxFeatureLevel}];
const pluginBreakpoints = [{version: [2, 3, 0], level: maxFeatureLevel}];
const npmBreakpoints = [{version: [4, 0, 0], level: maxFeatureLevel}];
const babelBreakpoints = [{version: [6, 26, 0], level: maxFeatureLevel}];
const bundlerBreakpoints = [{version: [1, 2, 1], level: maxFeatureLevel}];
const extenderBreakpoints = [
  {version: [1, 1, 0], level: maxFeatureLevel},
  {version: [1, 0, 14], level: 1},
];
const loaderBreakpoints = [{version: [2, 1, 0], level: maxFeatureLevel}];

/**
 * Default entry point for the lnk command line tool
 * @param {String[]} argv command line arguments
 * @return {void}
 */
export function analyze(argv) {
  // TODO: report diagnostic errors when requested by a flag
  // TODO: find all babel and liferay-npm-bundler plugin versions just in case

  console.log('');
  console.log('Please wait while retrieving version numbers...');
  console.log('');

  let gradleVersion;
  const gradlePromise = gradle
    .version()
    .then(version => (gradleVersion = version));

  let pluginVersion;
  const pluginPromise = gradle
    .nodePluginVersion()
    .then(version => (pluginVersion = version));

  let npmVersion;
  const npmPromise = npm.version().then(version => (npmVersion = version));

  let babelVersion;
  const babelPromise = babel
    .version()
    .then(version => (babelVersion = version));

  let bundlerVersion;
  const bundlerPromise = liferayNpmBundler
    .version()
    .then(version => (bundlerVersion = version));

  let extenderVersion;
  const extenderPromise = portal
    .osgiBundleVersion(
      argv.server,
      argv.gogoPort,
      'Liferay Frontend JS Loader Modules Extender'
    )
    .then(version => (extenderVersion = version));

  let loaderVersion;
  const loaderPromise = portal
    .amdLoaderVersion(argv.server, argv.httpPort)
    .then(version => (loaderVersion = version));

  Promise.all([
    gradlePromise,
    pluginPromise,
    npmPromise,
    babelPromise,
    bundlerPromise,
    extenderPromise,
    loaderPromise,
  ])
    .then(() => {
      console.log('You are using the following versions of components:');
      console.log('  · Gradle:', formatVersion(gradleVersion));
      console.log('  · Gradle Node plugin:', formatVersion(pluginVersion));
      console.log('  · npm:', formatVersion(npmVersion));
      console.log('  · Babel:', formatVersion(babelVersion));
      console.log('  · Liferay npm bundler:', formatVersion(bundlerVersion));
      console.log(
        '  · Loader modules extender:',
        formatVersion(extenderVersion)
      );
      console.log('  · AMD loader:', formatVersion(loaderVersion));
      console.log('');

      let featureLevel = maxFeatureLevel;

      featureLevel = tryLevelDecrement(
        featureLevel,
        gradleVersion,
        gradleBreakpoints
      );
      featureLevel = tryLevelDecrement(
        featureLevel,
        pluginVersion,
        pluginBreakpoints
      );
      featureLevel = tryLevelDecrement(
        featureLevel,
        npmVersion,
        npmBreakpoints
      );
      featureLevel = tryLevelDecrement(
        featureLevel,
        babelVersion,
        babelBreakpoints
      );
      featureLevel = tryLevelDecrement(
        featureLevel,
        bundlerVersion,
        bundlerBreakpoints
      );
      featureLevel = tryLevelDecrement(
        featureLevel,
        extenderVersion,
        extenderBreakpoints
      );
      featureLevel = tryLevelDecrement(
        featureLevel,
        loaderVersion,
        loaderBreakpoints
      );

      if (featureLevel == 0) {
        console.log(
          'You are currently using a component that does not satisfy',
          'the minimum version requirement. Please update it to be able',
          'to use the npm SDK correctly.'
        );

        return;
      }

      let anyUndefined = !(
        gradleVersion &&
        pluginVersion &&
        npmVersion &&
        babelVersion &&
        bundlerVersion &&
        extenderVersion &&
        loaderVersion
      );

      if (anyUndefined) {
        console.log(
          'There was at least one version number that could not be',
          'retrieved. That means that you feature level might be',
          'lower than the one reported.'
        );
        console.log('');
      }

      console.log('Your current feature level is:', featureLevel);
      console.log('');
    })
    .catch(err => console.log(err));
}

/**
 * Try to decrease a given feature level based on a component version and its
 * breakpoints definition. This method returns a lower feature level if the
 * component version constrains it according to the given breakpoints.
 * @param {int} currentFeatureLevel the actual feature level
 * @param {Array} version the component version
 * @param {Array} breakpoints the component breakpoints definition
 * @return {int} the possibly modified feature level
 */
export function tryLevelDecrement(currentFeatureLevel, version, breakpoints) {
  if (version === undefined) {
    return currentFeatureLevel;
  }

  let featureLevel = breakpoints[0].level;

  for (let i = 0; i < breakpoints.length; i++) {
    const breakpoint = breakpoints[i];

    if (lessThan(version, breakpoint.version)) {
      if (i < breakpoints.length - 1) {
        featureLevel = breakpoints[i + 1].level;
      } else {
        featureLevel = 0;
      }
    } else {
      break;
    }
  }

  return Math.min(currentFeatureLevel, featureLevel);
}
