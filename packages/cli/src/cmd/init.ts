import { Argv, Arguments } from 'yargs'
import * as yeomanEnv from 'yeoman-environment'
import { resolve } from 'path'

export const handler = (args: Arguments) => {
	const env = yeomanEnv.createEnv()
	env.register(require.resolve('../generator/test-env'), 'test-env')

	args.dir = resolve(process.cwd(), args.dir)

	env.run(`test-env ${args.dir}`, { 'skip-install': args['skip-install'] })
}

export const command = 'init [dir] [options]'
export const describe =
	'Init a test script and a minimal environment to get you started with Flood Element'
export const builder = (yargs: Argv) => {
	yargs
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
}
