import { Argv, Arguments } from 'yargs'
import { resolve } from 'path'
import TestEnvGenerator from '../generator/test-env/index'
import { CommandModule } from 'yargs'

const cmd: CommandModule = {
	command: 'init [dir] [options]',
	describe: 'Init a test script and a minimal environment to get you started with Flood Element',

	handler(args: Arguments) {
		const yeomanEnv = require('yeoman-environment')
		const env = yeomanEnv.createEnv()
		env.register(TestEnvGenerator, 'test-env')

		args.dir = resolve(process.cwd(), args.dir)

		env.run(['test-env', args.dir], { 'skip-install': args['skip-install'] })
	},

	builder(yargs: Argv): Argv {
		return yargs
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.option('skip-install', {
				describe: 'Skip yarn/npm install',
			})
			.positional('dir', {
				describe: 'the dir to init',
				default: process.cwd(),
				normalize: true,
			})
	},
}

export default cmd
