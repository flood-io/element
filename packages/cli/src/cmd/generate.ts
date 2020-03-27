import { Argv, Arguments, CommandModule } from 'yargs'

const cmd: CommandModule = {
	command: 'generate <file> [options]',
	describe: 'Generate a basic test script from a template',

	async handler(args: Arguments) {
		const { default: yeomanEnv } = await import('yeoman-environment')
		const env = yeomanEnv.createEnv()
		env.register(require.resolve('../generator/test-script'), 'test-script')
		env.run(() => `test-script ${args.file}`)
	},

	builder(yargs: Argv) {
		return yargs
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.check(({ file }) => {
				if (!(file as string).length)
					return new Error('Please provide the path to the test script to write')
				return true
			})
	},
}

export default cmd
