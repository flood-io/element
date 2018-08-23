import { Argv, Arguments } from 'yargs'
import * as yeomanEnv from 'yeoman-environment'

export const handler = (args: Arguments) => {
	const env = yeomanEnv.createEnv()
	env.register(require.resolve('../generator/test-script'), 'test-script')

	env.run(`test-script ${args.file}`)
}

export const command = 'generate <file> [options]'
export const describe = 'Generate a basic test script from a template'
export const builder = (yargs: Argv) => {
	yargs
		.option('verbose', {
			describe: 'Verbose mode',
		})
		.check(({ file }) => {
			if (!file.length) return new Error('Please provide the path to the test script to write')
			return true
		})
}
