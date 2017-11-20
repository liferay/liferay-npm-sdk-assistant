/** The current maximum feature level */
export const maxFeatureLevel = 2;

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

/** Feature level contracts */
export const supportedFeatures = {
  2: {
    'NPM resolver API': 'https://issues.liferay.com/browse/LPS-75257',
    'Resolve own package from NPMResolver':
      'https://issues.liferay.com/browse/LPS-75555',
    'Source maps support': 'https://issues.liferay.com/browse/LPS-75339',
    'Variable aliases in require attribute of <aui:script> tag':
      'https://issues.liferay.com/browse/LPS-75553',
  },
  1: {
    'Basic functionality': null,
  },
};
