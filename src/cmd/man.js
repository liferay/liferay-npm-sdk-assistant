import {
  maxFeatureLevel,
  gradleBreakpoints,
  pluginBreakpoints,
  npmBreakpoints,
  babelBreakpoints,
  bundlerBreakpoints,
  extenderBreakpoints,
  loaderBreakpoints,
  supportedFeatures,
} from '../misc/definitions';
import {formatVersion} from '../misc/util';

/**
 * Default entry point for the lnk command line tool
 * @param {String[]} argv command line arguments
 * @return {void}
 */
export default function(argv) {
  const item = argv._[1];

  switch (item) {
    case 'features':
      return features();
  }
}

/**
 * @return {void}
 */
function features() {
  console.log('');

  let featureList = {};

  unroll(gradleBreakpoints, featureList, 'gradle');
  unroll(pluginBreakpoints, featureList, 'plugin');
  unroll(npmBreakpoints, featureList, 'npm');
  unroll(babelBreakpoints, featureList, 'babel');
  unroll(bundlerBreakpoints, featureList, 'bundler');
  unroll(extenderBreakpoints, featureList, 'extender');
  unroll(loaderBreakpoints, featureList, 'loader');

  let versions = {};

  for (let level = maxFeatureLevel; level > 0; level--) {
    Object.assign(versions, featureList[level]);

    console.log('Feature level', level);
    console.log('  · Gradle:', formatVersion(versions.gradle));
    console.log('  · Gradle Node plugin:', formatVersion(versions.plugin));
    console.log('  · npm:', formatVersion(versions.npm));
    console.log('  · Babel:', formatVersion(versions.babel));
    console.log('  · Liferay npm bundler:', formatVersion(versions.bundler));
    console.log(
      '  · Loader modules extender:',
      formatVersion(versions.extender)
    );
    console.log('  · AMD loader:', formatVersion(versions.loader));
    console.log('  · Supported features:');
    for (let feature of Object.keys(supportedFeatures[level])) {
      let issue = '';

      if (supportedFeatures[level][feature]) {
        issue = `(${supportedFeatures[level][feature]})`;
      }

      console.log('      -', feature, issue);
    }
    console.log('');
  }

  console.log('');
}

/**
 * @param {Array} breakpoints
 * @param {Object} featureList
 * @param {String} featureName
 * @return {void}
 */
function unroll(breakpoints, featureList, featureName) {
  for (let bp of breakpoints) {
    featureList[bp.level] = featureList[bp.level] || {};
    featureList[bp.level][featureName] = bp.version;
  }
}
