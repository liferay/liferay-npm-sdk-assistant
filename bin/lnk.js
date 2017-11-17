#!/usr/bin/env node
let yargs = require('yargs');
let cmd = require('../lib/index');

yargs
	.command({
		command: 'analyze',
		desc: 'Analyze project and show conclusions',
		handler: cmd.analyze,
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
	.demandCommand(1, 'Doing nothing: no command specified')
	.help()
	.wrap(80).argv;
