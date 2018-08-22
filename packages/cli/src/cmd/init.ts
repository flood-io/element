import { Argv, Arguments } from 'yargs'
// import { existsSync } from 'fs'
// import * as path from 'path'
// import { error } from '../utils/out/error'
// import createLogger from '../utils/Logger'
import * as yeomanEnv from 'yeoman-environment'

export const handler = (args: Arguments) => {
	const env = yeomanEnv.createEnv()
	env.register(require.resolve('../generator/test-env'), 'test-env')

	// const { dir, verbose } = args
	// const verboseBool: boolean = !!verbose
	console.log('args', args)

	env.run('test-env')
}

export const command = 'init <dir> [options]'
export const describe = 'Init a test script'
export const builder = (yargs: Argv) => {
	yargs
		.option('verbose', {
			describe: 'Verbose mode',
		})
		.positional('dir', {
			describe: 'the dir to init',
			normalize: true,
		})
		.check(({ file, chrome }) => {
			// if (!file.length) return new Error('Please provide a test script')
			// if (!existsSync(file)) return new Error(`File does not exist '${file}'`)
			// if (chrome && !existsSync(chrome))
			// return new Error(`Chrome executable path does not exist '${chrome}'`)
			return true
		})
}
