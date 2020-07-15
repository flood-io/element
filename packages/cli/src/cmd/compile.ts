import { Argv, Arguments, CommandModule } from 'yargs'
import { webpackCompiler } from '../utils/compile'
import { checkFile } from './common'

interface CommandArgs extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'compile <file>',
	describe: 'Compile extenal debs',

	async handler(args: CommandArgs) {
		try {
			const result = await webpackCompiler(args.file)
			console.log(result.content)
		} catch (err) {
			console.log(err)
		}
	},

	builder(yargs: Argv): Argv {
		return yargs.option('file', {
			describe: 'entry file to run the test',
			coerce: file => {
				const fileErr = checkFile(file as string)
				if (fileErr) throw fileErr
				return file
			},
		})
	},
}

export default cmd
