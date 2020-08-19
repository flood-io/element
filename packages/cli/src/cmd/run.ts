import { Argv, Arguments, CommandModule } from 'yargs'
import { checkFile } from './common'
import { ElementRunArguments, runCommandLine } from '@flood/element-core'

import { join } from 'path'
import glob from 'glob'
import chalk from 'chalk'

interface RunCommonArguments extends Arguments, ElementRunArguments {}

async function readConfigFile(file: string): Promise<any> {
	const rootPath = process.cwd()
	try {
		return await import(join(rootPath, file))
	} catch {
		throw Error('The config file was not structured correctly. Please check and try again')
	}
}

async function getAllTestScriptsFromConfiguration(
	args: RunCommonArguments,
): Promise<RunCommonArguments> {
	const fileErr = checkFile(args.configFile, 'Configuration file')
	if (fileErr) throw fileErr
	const { options, paths } = await readConfigFile(args.configFile)

	if (!paths.testPathMatch || !paths.testPathMatch.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const files: string[] = []
	try {
		files.push(
			...(paths.testPathMatch.reduce(
				(arr: string[], item: string) => arr.concat(glob.sync(item)),
				[],
			) as []),
		)
		if (!files.length) {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
	} catch {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	return { ...options, paths, testFiles: files.sort() }
}

const cmd: CommandModule = {
	command: 'run [file] [options]',
	describe: 'Run [a test script| test scripts with configuration] locally',

	async handler(args: RunCommonArguments): Promise<void> {
		if (!args.file) {
			const configArgs = await getAllTestScriptsFromConfiguration(args)
			await runCommandLine(configArgs)
		} else {
			await runCommandLine(args)
		}
	},
	builder(yargs: Argv): Argv {
		return yargs
			.option('chrome', {
				group: 'Browser:',
				describe:
					'Specify which version of Google Chrome to use. Default: use the puppeteer bundled version. stable: ',
				coerce: chrome => {
					// [not specified] => undefined => use test script value
					// --chrome => override to 'stable'
					// --chrome string => override to <string>
					let chromeVersion: string | undefined
					if (typeof chrome === 'boolean') {
						if (chrome) {
							chromeVersion = 'stable'
						}
					} else {
						chromeVersion = chrome
					}

					return chromeVersion
				},
			})
			.option('no-headless', {
				group: 'Browser:',
				describe:
					'Run in non-headless mode so that you can see what the browser is doing as it runs the test',
			})
			.option('devtools', {
				group: 'Browser:',
				describe: 'Run in non-headless mode and also open devtools',
			})
			.option('no-sandbox', {
				group: 'Browser:',
				describe: 'Disable the chrome sandbox - advanced option, mostly necessary on linux',
			})
			.option('watch', {
				group: 'Running the test script:',
				describe: 'Watch <file> and rerun the test when it changes.',
			})
			.option('fast-forward', {
				group: 'Running the test script:',
				alias: 'ff',
				describe:
					'Run the script in fast-forward: override the actionDelay and stepDelay settings to 1 second in the test script.',
				conflicts: 'slow-mo',
				type: 'boolean',
			})
			.options('slow-mo', {
				group: 'Running the test script:',
				describe:
					'Run the script in slow-motion: Increase the actionDelay and stepDelay settings in the test script to 10 seconds.',
				conflicts: 'fast-forward',
				type: 'boolean',
			})
			.options('step-delay', {
				group: 'Running the test script:',
				describe: 'Override stepDelay test script setting',
				type: 'number',
			})
			.options('action-delay', {
				group: 'Running the test script:',
				describe: 'Override actionDelay test script setting',
				type: 'number',
			})
			.option('loop-count', {
				group: 'Running the test script:',
				describe:
					'Override the loopCount setting in the test script. This is normally overridden to 1 when running via the cli.',
				type: 'number',
			})
			.option('strict', {
				group: 'Running the test script:',
				describe: 'Compile the script in strict mode. This can be helpful in diagnosing problems.',
			})
			.option('work-root', {
				group: 'Paths:',
				describe:
					'Specify a custom work root. (Default: a directory named after your test script, and at the same location)',
			})
			.option('test-data-root', {
				group: 'Paths:',
				describe:
					'Specify a custom path to find test data files. (Default: the same directory as the test script)',
			})
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.option('fail-status-code', {
				describe: 'Exit code when the test fails',
				type: 'number',
				default: 1,
			})
			.positional('file', {
				describe: 'the test script to run',
				coerce: file => {
					const fileErr = checkFile(file as string)
					if (fileErr) throw fileErr
					return file
				},
			})
			.option('config-file', {
				describe: 'Run test scripts with configuration',
				type: 'string',
				default: 'element.config.js',
			})
			.fail((msg, err) => {
				if (err) console.error(chalk.redBright(err.message))
				if (msg) console.error(chalk.redBright(msg))
				process.exit(1)
			})
	},
}

export default cmd
