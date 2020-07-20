import { CommandModule } from 'yargs'
import chalk from 'chalk'

import authenticateCmd from './flood/authenticate'
import useCmd from './flood/use'
import projectCmd from './flood/project'
import runCmd from './flood/run'

export default {
	command: 'flood <command>',
	describe: 'A set of commands to support running floods from Element CLI to https://app.flood.io',
	builder(yargs) {
		return yargs
			.command(authenticateCmd)
			.command(useCmd)
			.command(projectCmd)
			.command(runCmd)
			.fail((msg, err) => {
				if (msg) {
					console.debug(chalk.redBright(msg))
				} else if (err && !(err instanceof Error)) {
					console.debug(chalk.redBright(err))
				} else {
					console.debug(chalk.redBright(`Error getting data from Flood: ${err.message}`))
				}
				process.exit(1)
			})
	},
	handler() {
		return
	},
} as CommandModule
