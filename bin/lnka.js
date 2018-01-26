#!/usr/bin/env node
const yargs = require('yargs');
const cmd = require('../lib/index').default;

// Show notice when a new version is ready
let latestVersion = require('latest-version');
let semver = require('semver');
let pkg = require('../package.json');

latestVersion(pkg.name)
  .then(version => {
    if (semver.lt(pkg.version, version)) {
      console.log(
        '\n',
        '#\n',
        '#                     W  A  R  N  I  N  G\n',
        '#\n',
        '# There is a new version of lnka',
        '(' + version + '). Please update it running:\n',
        '#\n',
        '#       npm update -g liferay-npm-sdk-assistant\n',
        '#\n',
        '# Otherwise you may get outdated info from this tool.\n',
        '#\n'
      );
    }

    main();
  })
  .catch(err => {
    console.log(
      '\n',
      '#\n',
      '#                   W  A  R  N  I  N  G\n',
      '#\n',
      '# Could not check if there is a newer version of lnka.\n',
      '#\n',
      '# This means that you may get outdated info from this tool if\n',
      '# a new version has been released and you are not up-to-date.\n',
      '#\n'
    );

    main();
  });

/**
 * Main entry point
 * @return {void}
 */
function main() {
  yargs
    .option('debug', {
      describe: 'Show debug information about what is being done',
      default: false,
    })
    .command({
      command: 'features',
      desc: 'Analyze project and show feature level',
      handler: cmd.features,
      builder: {
        server: {
          describe: 'Server address',
          default: 'localhost',
        },
        httpPort: {
          describe: 'HTTP port',
          default: '8080',
        },
        gogoPort: {
          describe: 'GoGo shell port',
          default: '11311',
        },
      },
    })
    .command({
      command: 'man',
      desc: 'Show information or documentation about the SDK',
      handler: cmd.man,
      builder: yargs =>
        yargs
          .command({
            command: 'features',
            desc: 'List feature levels and minimum component versions',
            handler: cmd.man,
          })
          .demandCommand(1, ''),
    })
    .command({
      command: 'resolve',
      desc:
        'Show information about module resolution based on a running ' +
        'portal instance',
      handler: cmd.resolve,
      builder: {
        server: {
          describe: 'Server address',
          default: 'localhost',
        },
        httpPort: {
          describe: 'HTTP port',
          default: '8080',
        },
        packages: {
          describe: 'Show only packages instead of modules',
          default: false,
        },
      },
    })
    .demandCommand(1, '')
    .strict()
    .help()
    .wrap(80).argv;
}
