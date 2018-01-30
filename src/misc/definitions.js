/*
 * The process to create another feature level is:
 *
 * 1. Increase maxFeatureLevel variable.
 * 2. Add a new entry in supportedFeatures object.
 * 3. For each breakpoint that matters, add a new entry on top (position 0) with
 *    the updated version and maxFeatureLevel, and modify the previously top
 *    entry changing maxFeatureLevel by the previous maxFeatureLevel.
 *      3.1. If the new entry is a plugin that previously didn't exist, add
 *           another entry at the bottom with version 1.0.0 and level set to the
 *           previous maxFeatureLevel.
 */

/** The current maximum feature level */
export const maxFeatureLevel = 3;

/** Feature level contracts */
/* eslint-disable */
export const supportedFeatures = {
  3: {
    "Support 'define' in modules when used as object field (needed for Angular)":
      'https://github.com/liferay/liferay-npm-build-tools/issues/74'
  },
  2: {
    'Support for jQuery when Liferay AMD Loader is not exposed as a global':
      'https://github.com/liferay/liferay-npm-build-tools/issues/68',
    'Support for @angular/animations package':
      'https://github.com/liferay/liferay-npm-build-tools/issues/66',
    'Support for packages with inner package.json files':
      'https://issues.liferay.com/browse/LPS-76482',
    'NPM resolver API': 'https://issues.liferay.com/browse/LPS-75257',
    'Resolve own package from NPMResolver':
      'https://issues.liferay.com/browse/LPS-75555',
    'Source maps support': 'https://issues.liferay.com/browse/LPS-75339',
    'Variable aliases in require attribute of <aui:script> tag':
      'https://issues.liferay.com/browse/LPS-75553'
  },
  1: {
    'Basic functionality': null
  }
};
/* eslint-enable */

/** Feature level breakpoints for the different components */
export const gradleBreakpoints = [
  {version: [2, 5, 0], level: maxFeatureLevel},
];
export const pluginBreakpoints = [
  {version: [2, 3, 0], level: maxFeatureLevel},
];
export const npmBreakpoints = [{version: [4, 0, 0], level: maxFeatureLevel}];
export const babelBreakpoints = [
  {version: [6, 26, 0], level: maxFeatureLevel},
];
export const bundlerBreakpoints = [
  {version: [1, 2, 1], level: maxFeatureLevel},
];
export const extenderBreakpoints = [
  {version: [1, 1, 0], level: maxFeatureLevel},
  {version: [1, 0, 14], level: 1},
];
export const loaderBreakpoints = [
  {version: [2, 1, 0], level: maxFeatureLevel},
];
export const bundlerPluginBreakpoints = {
  'liferay-npm-bundler-plugin-inject-angular-dependencies': [
    {version: [1, 3, 0], level: maxFeatureLevel},
    {version: [1, 0, 0], level: 1},
  ],
  'babel-plugin-namespace-amd-define': [
    {version: [1, 4, 2], level: maxFeatureLevel},
    {version: [1, 4, 0], level: 2},
    {version: [1, 0, 0], level: 1},
  ],
  'babel-preset-liferay-standard': [
    {version: [1, 4, 2], level: maxFeatureLevel},
    {version: [1, 4, 0], level: 2},
    {version: [1, 0, 0], level: 1},
  ],
};
