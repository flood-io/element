import { CommandModule, Arguments } from 'yargs'
import { checkFile } from '../common'
import { runner } from '@flood/element-flood-runner/src/Grid'
import { runUntilExit } from '@flood/element-api'

interface RunArguments extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'start <file> [options]',
	describe: 'Run a test script in Flood Agent',

	handler(args: RunArguments) {
		const { file } = args
		return runUntilExit(() => runner(file))
	},

	builder(yargs) {
		return yargs
			.positional('file', {
				describe: 'the test script to run',
			})
			.check(({ file }) => {
				const fileErr = checkFile(file as string)
				if (fileErr) return fileErr

				return true
			})
	},
}

export default cmd
