import { Argv, Arguments, CommandModule } from 'yargs'
import { resolve } from 'path'

import runCmd from '../utils/cmd'
import chalk from 'chalk'

const cmd: CommandModule = {
	command: 'init [dir] [options]',
	describe: 'Init a test script and a minimal environment to get you started with Flood Element',

	async handler(args: Arguments) {
		const { default: YoEnv } = await import('yeoman-environment')
		const { default: TestEnvGenerator } = await import('../generator/test-env/index')
		const env = YoEnv.createEnv()
		env.registerStub(TestEnvGenerator, 'element/test-env')
		args.dir = resolve(process.cwd(), args.dir as string)
		env.run(['element/test-env', args.dir], { 'skip-install': args['skip-install'] }, () => {
			console.log(
				chalk`{grey COMPLETED} Run ${runCmd(`cd ${args.dir}`)} and ${runCmd(
					`element run test.ts`,
				)}`,
			)
		})
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
				describe: 'the directory to initialize with an Element test script',
				default: process.cwd(),
				normalize: true,
			})
	},
}

export default cmd
