/* eslint-disable @typescript-eslint/no-use-before-define */
import {
	runCommandLine,
	runUntilExit,
	ElementOptions,
	WorkRoot,
	FloodProcessEnv,
	TestCommander,
	TestSettings,
} from '@flood/element-core'

import { ConsoleReporter } from '../utils/ConsoleReporter'
import { Argv, Arguments, CommandModule } from 'yargs'
import createLogger from '../utils/Logger'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { checkFile } from './common'
import sanitize from 'sanitize-filename'
import { extname, basename, join, dirname } from 'path'
import { resolve } from 'url'

interface RunArguments extends Arguments {
	file: string
	strict?: boolean
	headless?: boolean
	devtools?: boolean
	chrome?: string
	sandbox?: boolean
	loopCount?: number
	fastForward?: number
	stepDelay?: number
	actionDelay?: number
	slowMo?: number
	'work-root'?: string
	'test-data-root'?: string
}

function setupDelayOverrides(args: RunArguments, testSettingOverrides: TestSettings) {
	if (testSettingOverrides == null) testSettingOverrides = {}

	if (args.fastForward ?? false) {
		testSettingOverrides.stepDelay = args.fastForward
		testSettingOverrides.actionDelay = args.fastForward
	} else if (args.slowMo ?? false) {
		testSettingOverrides.stepDelay = args.slowMo ?? testSettingOverrides.stepDelay
		testSettingOverrides.actionDelay = args.slowMo ?? testSettingOverrides.actionDelay
	}

	testSettingOverrides.actionDelay = args.actionDelay ?? testSettingOverrides.actionDelay
	testSettingOverrides.actionDelay = args.stepDelay ?? testSettingOverrides.stepDelay

	return testSettingOverrides
}

const cmd: CommandModule = {
	command: 'run <file> [options]',
	describe: 'Run a test script locally',

	handler(args: RunArguments) {
		const { file, verbose } = args
		const workRootPath = getWorkRootPath(file, args['work-root'])
		const testDataPath = getTestDataPath(file, args['test-data-root'])

		const verboseBool = !!verbose

		let logLevel = 'info'
		if (verboseBool) logLevel = 'debug'

		const logger = createLogger(logLevel, true)
		const reporter = new ConsoleReporter(logger, verboseBool)

		logger.info(`workRootPath: ${workRootPath}`)
		logger.info(`testDataPath: ${testDataPath}`)

		const opts: ElementOptions = {
			logger: logger,
			testScript: file,
			strictCompilation: args.strict ?? false,
			reporter: reporter,
			verbose: verboseBool,
			headless: args.headless ?? false,
			devtools: args.devtools ?? false,
			chromeVersion: args.chrome,
			sandbox: args.sandbox ?? false,

			runEnv: initRunEnv(workRootPath, testDataPath),
			testSettingOverrides: {
				loopCount: args.loopCount,
			},
			persistentRunner: false,
		}

		opts.testSettingOverrides = setupDelayOverrides(args, opts.testSettingOverrides)

		if (args.watch) {
			opts.persistentRunner = true
			opts.testCommander = makeTestCommander(file)
		}

		runUntilExit(() => runCommandLine(opts))
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
					'Run the script in fast-forward: override the actionDelay and stepDelay settings to 1 second in the test script. Specify a number to set a different delay.',
				coerce: x => coerceDelay('fast-forward', x, 1),
				conflicts: 'slow-mo',
			})
			.options('slow-mo', {
				group: 'Running the test script:',
				describe:
					'Run the script in slow-motion: Increase the actionDelay and stepDelay settings in the test script to 10 seconds.  Specify a number to set a different delay.',
				coerce: x => coerceDelay('slow-mo', x, 10),
				conflicts: 'fast-forward',
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
				default: 1,
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
			.positional('file', {
				describe: 'the test script to run',
			})
			.check(({ file }) => {
				const fileErr = checkFile(file as string)
				if (fileErr) return fileErr

				return true
			})
	},
}

export default cmd

function makeTestCommander(file: string): TestCommander {
	const commander = new EventEmitter()

	// hax
	// const dir = path.dirname(file)
	// const [first, ...rest] = path.basename(file)
	// const globPath = path.join(dir, `{${first}}${rest.join('')}`)

	// console.log('watching', file, globPath)

	// watch(path.dirname(file)).on('change', (path, stats) => {
	// console.log('changed dir', path, stats)
	// })

	// TODO make this more reliable on linux
	const watcher = watch(file, { persistent: true })
	watcher.on('change', path => {
		if (path === file) {
			commander.emit('rerun-test')
		}
	})
	return commander
}

function getWorkRootPath(file: string, root?: string): string {
	const ext = extname(file)
	const bare = basename(file, ext)

	if (root == null) {
		root = join(dirname(file), 'tmp', 'element-results', bare)
	}

	const dateString = sanitize(new Date().toISOString())

	return resolve(root, dateString)
}

function getTestDataPath(file: string, root?: string): string {
	root = root || dirname(file)

	return dirname(resolve(root, file))
}

function initRunEnv(root: string, testDataRoot: string) {
	const workRoot = new WorkRoot(root, {
		'test-data': testDataRoot,
	})

	return {
		workRoot,
		stepEnv(): FloodProcessEnv {
			return {
				BROWSER_ID: 0,
				FLOOD_GRID_REGION: 'local',
				FLOOD_GRID_SQEUENCE_ID: 0,
				FLOOD_GRID_SEQUENCE_ID: 0,
				FLOOD_GRID_INDEX: 0,
				FLOOD_GRID_NODE_SEQUENCE_ID: 0,
				FLOOD_NODE_INDEX: 0,
				FLOOD_SEQUENCE_ID: 0,
				FLOOD_PROJECT_ID: 0,
				SEQUENCE: 0,
				FLOOD_LOAD_TEST: false,
			}
		},
	}
}

function coerceDelay(desc: string, val: boolean | string | undefined, defaultVal: number): number {
	if (typeof val === 'boolean') {
		if (val) {
			return defaultVal
		} else {
			return -1
		}
	} else if (typeof val === 'string') {
		const coerced = Number(val)
		if (isNaN(coerced)) {
			throw new Error(`Unable to recognise ${desc} value ${val}`)
		}
		return coerced
	} else {
		throw new Error(`Unable to recognise ${desc} value ${val}`)
	}
}
