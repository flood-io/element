import { Argv, Arguments, CommandModule } from 'yargs'
import { checkFile } from './common'
import {
	ElementRunArguments,
	runCommandLine as runSingleUser,
	normalizeElementOptions,
	ElementOptions,
} from '@flood/element-core'
import { runCommandLine as runMultipleUser } from '@flood/element-scheduler'
import chalk from 'chalk'
import { EventEmitter } from 'events'
import { ReportCache } from '@flood/element-report'
import { getFilesPattern, readConfigFile } from '../utils/run'
import YoEnv from 'yeoman-environment'
import ReportGenerator from '../generator/test-report'
import sanitize from 'sanitize-filename'
import { resolve, dirname, basename, extname, join } from 'path'

interface RunCommonArguments extends Arguments, ElementRunArguments {}

async function getConfigurationFromConfig(args: RunCommonArguments): Promise<RunCommonArguments> {
	const {
		file,
		configFile,
		loopCount,
		duration,
		slowMo,
		fastForward,
		stepDelay,
		actionDelay,
		watch,
	} = args
	const fileErr = checkFile(configFile, 'Configuration file')
	if (fileErr) throw fileErr
	const configFileFromArgs: any = await readConfigFile(configFile)
	const { options, paths, testSettings } = configFileFromArgs
	let testFiles: string[]
	let notExistingFiles: string[]

	if (file) {
		testFiles = [file]
		notExistingFiles = []
	} else {
		if (!paths.testPathMatch || !paths.testPathMatch.length) {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
		const filesPattern = getFilesPattern(paths.testPathMatch)
		testFiles = filesPattern.files.sort()
		notExistingFiles = filesPattern.notExistingFiles.sort()
	}

	return {
		...options,
		testSettings,
		testFiles,
		notExistingFiles,
		runArgs: {
			loopCount,
			duration,
			slowMo,
			fastForward,
			stepDelay,
			actionDelay,
			watch,
			file,
		},
	}
}

const cmd: CommandModule = {
	command: 'run [file] [options]',
	describe: 'Run [a test script| test scripts with configuration] locally',

	async handler(args: RunCommonArguments): Promise<void> {
		const { file, mu, configFile } = args
		if (mu) {
			if (!file) {
				console.log(
					chalk.redBright(
						`The mode 'running the test with a config file' does not support running with multiple users`,
					),
				)
				process.exit(0)
			}
			const myEmitter = new EventEmitter()
			const cache = new ReportCache(myEmitter)
			const opts: ElementOptions = normalizeElementOptions(args, cache)
			await runMultipleUser(opts)
			process.exit(0)
		}
		const runArgs = await getConfigurationFromConfig(args)
		if (runArgs.fastForward && runArgs.slowMo) {
			console.error(chalk.redBright(`Arguments fast-forward and slow-mo are mutually exclusive`))
			process.exit(0)
		}

		const result = await runSingleUser(runArgs)

		if (args.export) {
			let root: string
			if (file) {
				const fileName = basename(file, extname(file))
				root = join(dirname(file), 'reports', fileName)
			} else {
				root = join(dirname(configFile), 'reports')
			}

			const dateString = sanitize(new Date().toISOString())
			const reportPath = resolve(root, dateString)
			const env = YoEnv.createEnv()

			env.registerStub(ReportGenerator as any, 'report-generator')
			env.run(
				['report-generator'],
				{
					data: JSON.stringify(result, null, '\t'),
					dir: reportPath,
				},
				() => {
					console.log(`Your report has been saved in ${reportPath}`)
				},
			)
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
			.option('browser-type', {
				group: 'Browser:',
				describe: 'Run in a specific browser',
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
				type: 'string',
			})
			.options('action-delay', {
				group: 'Running the test script:',
				describe: 'Override actionDelay test script setting',
				type: 'string',
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
			.option('mu', {
				describe: 'Run test scripts with multiple users',
				type: 'boolean',
				default: false,
			})
			.option('export', {
				describe: 'Export a HTML report after the test finished running',
				type: 'boolean',
			})
			.fail((msg, err) => {
				if (err) console.error(chalk.redBright(err.message))
				if (msg) console.error(chalk.redBright(msg))
				process.exit(1)
			})
	},
}

export default cmd
