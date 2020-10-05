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
import { resolve, dirname } from 'path'

interface RunCommonArguments extends Arguments, ElementRunArguments {}

async function getAllTestScriptsFromConfiguration(
	args: RunCommonArguments,
): Promise<RunCommonArguments> {
	const fileErr = checkFile(args.configFile, 'Configuration file')
	if (fileErr) throw fileErr
	const { options, paths } = await readConfigFile(args.configFile)

	if (!paths.testPathMatch || !paths.testPathMatch.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const { files, notExistingFiles } = getFilesPattern(paths.testPathMatch)

	return { ...options, paths, testFiles: files.sort(), notExistingFiles: notExistingFiles.sort() }
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
				return
			}
			const myEmitter = new EventEmitter()
			const cache = new ReportCache(myEmitter)
			const opts: ElementOptions = normalizeElementOptions(args, cache)
			await runMultipleUser(opts)
			return
		}
		const runArgs = file ? args : await getAllTestScriptsFromConfiguration(args)
		const result = await runSingleUser(runArgs)

		if (args.export) {
			const root = dirname(file || configFile)
			const dateString = sanitize(new Date().toISOString())
			const reportPath = resolve(root, 'reports', dateString)
			const env = YoEnv.createEnv()

			env.registerStub(ReportGenerator as any, 'report-generator')
			env.run(
				['report-generator'],
				{
					data: JSON.stringify(result, null, '\t'),
					dir: reportPath,
				},
				() => {
					console.log(`Your report has been saved in ${resolve(reportPath, 'index.html')}`)
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
