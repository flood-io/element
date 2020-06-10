/* eslint-disable @typescript-eslint/no-empty-function */
import { Argv, Arguments, CommandModule } from 'yargs'
import chalk from 'chalk'
import generateScriptCmd from '../cmd/generate_cmds/generateTestScript'
import generateConfigurationCmd from '../cmd/generate_cmds/generateTestConfiguration'

const cmd: CommandModule = {
	command: 'generate <command>',
	describe: 'Generate a basic [test script|test configuration]',

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async handler(args: Arguments): Promise<void> {},

	builder(yargs: Argv) {
		return yargs
			.usage('usage: generate <command>')
			.command(generateScriptCmd)
			.command(generateConfigurationCmd)
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
