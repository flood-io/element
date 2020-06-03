import { Argv, Arguments, CommandModule } from 'yargs'

interface CommandArgs extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'generate <file> [options]',
	describe: 'Generate a basic test script from a template',

	async handler(args: CommandArgs) {
		const { default: yeomanEnv } = await import('yeoman-environment')
		const env = yeomanEnv.createEnv()
		const { default: TestScriptGenerator } = await import('../generator/test-script')
		env.registerStub(TestScriptGenerator as any, 'element/test-script')
		env.run(['element/test-script', args.file], () => 'Generate success')
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
