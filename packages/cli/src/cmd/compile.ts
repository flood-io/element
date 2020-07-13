import { Argv, CommandModule } from 'yargs'
import { webpackCompiler } from '../utils/compile'

const cmd: CommandModule = {
	command: 'compile [dir] [options]',
	describe: 'Compile extenal deb',

	async handler() {
		try {
			const result = await webpackCompiler('Test.perf.ts')
			console.log(result)
		} catch (err) {
			console.log(err)
		}
	},

	builder(yargs: Argv): Argv {
		return yargs.option('verbose', {
			describe: 'Verbose mode',
		})
	},
}

export default cmd
