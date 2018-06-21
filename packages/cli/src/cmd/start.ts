import * as ora from 'ora'
import { Loader, PuppeteerDriver } from '@flood/element'
import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'

export const main = async (args: Arguments) => {
	const { file } = args
	let spinner
	if (!args.json) spinner = ora(`Launching test '${file}'`).start()

	let loader = new Loader(file, new PuppeteerDriver())
	// await loader

	await new Promise(yeah => setTimeout(yeah, 2000))
	spinner.succeed('Completed in 2s')
}

export const command = 'run <file> [options]'
export const describe = 'Run a test script locally'
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
