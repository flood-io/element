import { Argv, Arguments, CommandModule } from 'yargs'
import chalk from 'chalk'
import runScriptCmd from '../cmd/run_cmds/runTestScript'
import runConfigurationCmd from '../cmd/run_cmds/runTestConfiguration'

const cmd: CommandModule = {
	command: 'run [command]',
	describe: 'Run a [test script |test script with configuration] locally',

	async handler(args: Arguments) {
	},

	builder(yargs: Argv) {
		return yargs
			.usage('usage: run [command]')
			.command(runScriptCmd)
			.command(runConfigurationCmd)
			.updateStrings({
				'Commands:': chalk.grey('Commands:\n'),
			})
			.demandCommand()
			.help('help')
			.fail(msg => {
				// if (err) throw err // preserve stack
				console.error(chalk.redBright(msg))
				process.exit(1)
			})
	},
}

export default cmd
