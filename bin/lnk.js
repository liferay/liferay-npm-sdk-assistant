#!/usr/bin/env node
let yargs = require('yargs');
let cmd = require('../lib/index').default;

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
				.demandCommand(
					1,
					'Doing nothing: no item to describe provided\n'
				),
	})
	.demandCommand(1, 'Doing nothing: no command specified\n')
	.help()
	.wrap(80).argv;
