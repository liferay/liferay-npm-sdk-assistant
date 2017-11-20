/**
 * Parse a version contained in a string and return it as an array of integers.
 * @param {String} version a version number 'x.y.z' contained in a string
 * @return {Array} and array with three integer: major, minor, fixlevel
 */
export function parseVersion(version) {
  const versionNumbers = version.split('.').map(item => parseInt(item));

  if (versionNumbers.length == 0 || versionNumbers.length > 3) {
    return undefined;
  }

  if (versionNumbers.some(item => isNaN(item))) {
    return undefined;
  }

  while (versionNumbers.length < 3) {
    versionNumbers.push(0);
  }

  return versionNumbers;
}

/**
 * Test if a version array is less than a value array.
 * @param {Array} version an array with three ints: major, minor, fixlevel
 * @param {Array} value an array with three ints: major, minor, fixlevel
 * @return {boolean} true if version is less than value
 */
export function lessThan(version, value) {
  if (version[0] > value[0]) {
    return false;
  }
  if (version[0] < value[0]) {
    return true;
  }

  if (version[1] > value[1]) {
    return false;
  }
  if (version[1] < value[1]) {
    return true;
  }

  if (version[2] > value[2]) {
    return false;
  }
  if (version[2] < value[2]) {
    return true;
  }

  return false;
}

/**
 * Format a version array as a string 'x.y.z'.
 * @param {Array} version an array with three integers: major, minor, fixlevel
 * @return {String} the human readable version
 */
export function formatVersion(version) {
  if (version === undefined) {
    return '[undefined]';
  }

  if (version.length != 3) {
    throw new Error('Invalid version number: ' + version);
  }

  return `${version[0]}.${version[1]}.${version[2]}`;
}
