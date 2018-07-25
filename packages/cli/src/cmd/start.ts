// import * as ora from "ora";
import { runCommandLine, runUntilExit, ElementOptions } from '@flood/element'
import { ConsoleReporter } from '../utils/ConsoleReporter'
import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'
// import { error } from '../utils/out/error'
import createLogger from '../utils/Logger'

export const handler = (args: Arguments) => {
	const { file } = args

	const logger = createLogger('debug', true, '')
	const reporter = new ConsoleReporter(logger)

	const opts: ElementOptions = {
		logger: logger,
		testScript: file,
		reporter: reporter,
		// TODO console reporter
	}

	runUntilExit(() => runCommandLine(opts))

	// let spinner
	// if (!args.json) spinner = ora(`Launching test '${file}'`).start()

	// console.log("awaited");
	// process.exit(0);
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
