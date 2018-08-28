import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'

const main = async (args: Arguments) => {
	console.log(`PLAN file: ${args.file}`)
}

export const command = 'plan <file> [options]'
export const describe = 'Output the test script plan without executing it.'
export const builder = (yargs: Argv) => {
	yargs
		.option('json', {
			describe: 'Return the test output as JSON',
			default: !process.stdout.isTTY,
		})
		.check(({ file }) => {
			if (!file.length) return new Error('Please provide a test script')
			if (!existsSync(file)) return new Error(`File does not exist '${file}'`)
			return true
		})
}
export const handler = main
