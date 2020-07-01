import { Argv, Arguments, CommandModule } from 'yargs'

interface CommandArgs extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'config [file]',
	describe: 'Generate a basic test configuration from a template',

	async handler(args: CommandArgs): Promise<void> {
		const { default: yeomanEnv } = await import('yeoman-environment')
		const env = yeomanEnv.createEnv()
		const { default: TestConfigurationGenerator } = await import(
			'../../generator/test-configuration'
		)
		env.registerStub(TestConfigurationGenerator as any, 'element/test-configuration')
		env.run(['element/test-configuration', args.file], () => 'Generated successfully')
	},

	builder(yargs: Argv): Argv {
		return yargs.option('file', {
			describe: 'The file name of the generated config file',
			default: 'element.config.js',
		})
	},
}

export default cmd
