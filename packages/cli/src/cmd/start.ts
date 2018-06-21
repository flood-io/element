import * as ora from 'ora'
import { Loader, PuppeteerDriver } from '@flood/element'
import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'
import { error } from '../utils/out/error'

export const main = async (args: Arguments) => {
	const { file } = args
	let spinner
	if (!args.json) spinner = ora(`Launching test '${file}'`).start()

	let loader = new Loader(file, PuppeteerDriver)
	await loader
		.run()
		.then(() => {
			if (!args.json) spinner.succeed('Completed')
		})
		.catch(err => {
			console.error(error(err))
			if (!args.json) spinner.stop()
			process.exit(1)
		})
}

export const command = 'run <file> [options]'
export const describe = 'Run a test script locally'
export const builder = (yargs: Argv) => {
	yargs
		.option('json', {
			describe: 'Return the test output as JSON',
			default: !process.stdout.isTTY,
		})
		.option('chrome', {
			describe: 'Specify a custom Google Chrome executable path',
		})
		.check(({ file, chrome }) => {
			if (!file.length) return new Error('Please provide a test script')
			if (!existsSync(file)) return new Error(`File does not exist '${file}'`)
			if (chrome && !existsSync(chrome))
				return new Error(`Chrome executable path does not exist '${chrome}'`)
			return true
		})
}
export const handler = main
