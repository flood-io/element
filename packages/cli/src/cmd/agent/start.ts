import { CommandModule, Arguments } from 'yargs'
import { checkFile } from '../common'
import run from '@flood/element-flood-runner'
import { runUntilExit } from '@flood/element-api'

interface RunArguments extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'start <file> [options]',
	describe: 'Flood Agent runner entrypoint',

	handler(args: RunArguments) {
		const { file } = args

		return runUntilExit(() => run(file))
	},

	builder(yargs) {
		return yargs
			.positional('file', {
				describe: 'the test script to run',
			})
			.check(({ file }) => {
				if (process.env.FLOOD_DATA_ROOT == null)
					throw new Error(
						`"agent start" can executed by Flood Agent (failed to detect $FLOOD_DATA_ROOT)`,
					)

				const fileErr = checkFile(file as string)
				if (fileErr) return fileErr

				return true
			})
	},
}

export default cmd
