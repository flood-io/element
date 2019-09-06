// import { By } from '@flood/element'
// console.log(By.css('#test'))

import {
	runCommandLine,
	runUntilExit,
	ElementOptions,
	WorkRoot,
	FloodProcessEnv,
	TestCommander,
	TestSettings,
} from '@flood/element'

import { ConsoleReporter } from '../utils/ConsoleReporter'
import { Argv, Arguments, CommandModule } from 'yargs'
import * as path from 'path'
import createLogger from '../utils/Logger'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { checkFile } from './common'
import * as sanitize from 'sanitize-filename'

function setupDelayOverrides(args: Arguments, testSettingOverrides: TestSettings) {
	let stepDelayOverride: number | undefined
	let actionDelayOverride: number | undefined

	if (args.fastForward >= 0) {
		stepDelayOverride = args.fastForward
		actionDelayOverride = args.fastForward
	} else if (args.slowMo >= 0) {
		stepDelayOverride = args.slowMo
		actionDelayOverride = args.slowMo
	}

	if (args.actionDelay !== undefined) {
		actionDelayOverride = args.actionDelay
	}
	if (args.stepDelay !== undefined) {
		stepDelayOverride = args.stepDelay
	}

	if (stepDelayOverride !== undefined) {
		testSettingOverrides.stepDelay = stepDelayOverride
	}
	if (actionDelayOverride !== undefined) {
		testSettingOverrides.actionDelay = actionDelayOverride
	}

	return testSettingOverrides
}

const cmd: CommandModule = {
	command: 'run <file> [options]',
	describe: 'Run a test script locally',

	handler(args: Arguments) {
		const { file, verbose } = args
		const workRootPath = getWorkRootPath(file, args['work-root'])
		const testDataPath = getTestDataPath(file, args['test-data-root'])

		const verboseBool: boolean = !!verbose

		let logLevel = 'info'
		if (verboseBool) logLevel = 'debug'

		const logger = createLogger(logLevel, true)
		const reporter = new ConsoleReporter(logger, verboseBool)

		logger.info(`workRootPath: ${workRootPath}`)
		logger.info(`testDataPath: ${testDataPath}`)

		const opts: ElementOptions = {
			logger: logger,
			testScript: file,
			strictCompilation: args.strict,
			reporter: reporter,
			verbose: verboseBool,
			headless: args.headless,
			devtools: args.devtools,
			chromeVersion: args.chrome,
			sandbox: args.sandbox,

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
			.check(({ file, chrome }) => {
				let fileErr = checkFile(file)
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
	watcher.on('change', (path, stats) => {
		if (path === file) {
			commander.emit('rerun-test')
		}
	})
	return commander
}

function getWorkRootPath(file: string, root?: string): string {
	const ext = path.extname(file)
	const bare = path.basename(file, ext)

	if (root === undefined) {
		root = path.join(path.dirname(file), 'tmp/element-results', bare)
	}

	const dateString = sanitize(new Date().toISOString())

	return path.resolve(root, dateString)
}

function getTestDataPath(file: string, root?: string): string {
	root = root || path.dirname(file)

	return path.resolve(root)
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
