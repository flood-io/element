import { CommandModule, Arguments } from 'yargs'
import { checkFile } from '../common'
import run from '@flood/element-flood-runner'

interface RunArguments extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'start <file> [options]',
	describe: 'Flood Agent runner entrypoint',

	async handler(args: RunArguments) {
		const { file } = args

		await run(file)
		process.exit(0)
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
