/* eslint-disable @typescript-eslint/no-empty-function */
import { Argv, Arguments, CommandModule } from 'yargs'
import chalk from 'chalk'
import runScriptCmd from '../cmd/run_cmds/runTestScript'
import runConfigurationCmd from '../cmd/run_cmds/runTestConfiguration'

const cmd: CommandModule = {
	command: 'run <command>',
	describe: 'Run a [test script |test script with configuration] locally',

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async handler(args: Arguments): Promise<void> {},

	builder(yargs: Argv): Argv {
		return yargs
			.usage('usage: run <command>')
			.command(runScriptCmd)
			.command(runConfigurationCmd)
			.updateStrings({
				'Commands:': chalk.grey('Commands:\n'),
			})
			.demandCommand()
			.help('help')
			.fail((msg, err) => {
				if (err) console.error(chalk.redBright(err.message))
				console.error(chalk.redBright(msg))
				process.exit(1)
			})
	},
}

export default cmd
