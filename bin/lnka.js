#!/usr/bin/env node
const yargs = require('yargs');
const cmd = require('../lib/index').default;

// Show notice when a new version is ready
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
updateNotifier({pkg}).notify();

// Define command line usage and launch correct handler
yargs
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
  .option('debug', {
    describe: 'Show debug information about what is being done',
    default: false,
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
        .demandCommand(1, 'Doing nothing: no item to describe provided\n'),
  })
  .demandCommand(1, 'Doing nothing: no command specified\n')
  .help()
  .wrap(80).argv;
