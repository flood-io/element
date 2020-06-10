import { Argv, Arguments, CommandModule } from 'yargs'

interface CommandArgs extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'config [file] [options]',
	describe: 'Generate a basic test configuration from a template',

	async handler(args: CommandArgs): Promise<void> {
		const { default: yeomanEnv } = await import('yeoman-environment')
		const env = yeomanEnv.createEnv()
		const { default: TestConfigurationGenerator } = await import(
			'../../generator/test-configuration'
		)
		env.registerStub(TestConfigurationGenerator as any, 'element/test-configuration')
		env.run(['element/test-configuration', args.file], () => 'Generate success')
	},

	builder(yargs: Argv): Argv {
		return yargs
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.positional('file', {
				describe: 'the file name to generate to a new basic test configuration',
				default: 'element.config.js',
			})
	},
}

export default cmd
