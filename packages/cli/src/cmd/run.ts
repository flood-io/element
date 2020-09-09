import { Argv, Arguments, CommandModule } from 'yargs'
import { checkFile } from './common'
import {
	WorkRoot,
	FloodProcessEnv,
	TestCommander,
	TestSettings,
	runCommandLine,
	ElementOptions,
	DEFAULT_ACTION_DELAY,
	DEFAULT_STEP_DELAY,
	DEFAULT_STEP_DELAY_FAST_FORWARD,
	DEFAULT_ACTION_DELAY_FAST_FORWARD,
	DEFAULT_STEP_DELAY_SLOW_MO,
	DEFAULT_ACTION_DELAY_SLOW_MO,
} from '@flood/element-core'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { extname, basename, join, dirname, resolve } from 'path'
import sanitize from 'sanitize-filename'
import createLogger from '.././utils/Logger'
import { ConsoleReporter } from '.././utils/ConsoleReporter'
import chalk from 'chalk'
import ms from 'ms'

import { getFilesPattern, readConfigFile } from '../utils/compile'

interface RunCommonArguments extends Arguments {
	file: string
	chrome?: string
	strict?: boolean
	headless?: boolean
	devtools?: boolean
	sandbox?: boolean
	loopCount?: number
	stepDelay?: string | number
	actionDelay?: string | number
	fastForward?: boolean
	slowMo?: boolean
	watch?: boolean
	'work-root'?: string
	'test-data-root'?: string
	'fail-status-code': number
	configFile: string
}

function isNumber(value: string): boolean {
	const numberPattern = /^[0-9]+$/
	return numberPattern.test(value)
}

function setupDelayOverrides(
	args: RunCommonArguments,
	testSettingOverrides: TestSettings,
): TestSettings {
	if (testSettingOverrides == null) testSettingOverrides = {}
	let { actionDelay, stepDelay } = args

	if (actionDelay) {
		//received from the terminal so the value is always string, it is necessary to check the user wants to enter the string or number
		if (!isNumber(actionDelay as string)) actionDelay = ms(actionDelay as string)
		else {
			if (actionDelay < 0) actionDelay = DEFAULT_ACTION_DELAY
			else if (actionDelay < 1e3) actionDelay = (actionDelay as number) * 1e3
		}
		testSettingOverrides.actionDelay = actionDelay
	}

	if (stepDelay) {
		//received from the terminal so the value is always string, it is necessary to check the user wants to enter the string or number
		if (!isNumber(stepDelay as string)) stepDelay = ms(stepDelay as string)
		else {
			if (stepDelay < 0) stepDelay = DEFAULT_STEP_DELAY
			else if (stepDelay < 1e3) stepDelay = (stepDelay as number) * 1e3
		}
		testSettingOverrides.stepDelay = stepDelay
	}

	if (args.fastForward) {
		testSettingOverrides.stepDelay = DEFAULT_STEP_DELAY_FAST_FORWARD
		testSettingOverrides.actionDelay = DEFAULT_ACTION_DELAY_FAST_FORWARD
	} else if (args.slowMo) {
		testSettingOverrides.stepDelay = DEFAULT_STEP_DELAY_SLOW_MO
		testSettingOverrides.actionDelay = DEFAULT_ACTION_DELAY_SLOW_MO
	}
	return testSettingOverrides
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

	// return root
	return resolve(root)
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

function makeTestCommander(file: string): TestCommander {
	const commander = new EventEmitter()
	// TODO make this more reliable on linux
	const watcher = watch(file, { persistent: true })
	watcher.on('change', path => {
		if (path === file) {
			commander.emit('rerun-test')
		}
	})
	return commander
}

async function runTestScript(args: RunCommonArguments): Promise<void> {
	const { file, verbose } = args
	const workRootPath = getWorkRootPath(file, args['work-root'])
	const testDataPath = getTestDataPath(file, args['test-data-root'])

	const verboseBool = !!verbose

	const logLevel = verboseBool ? 'debug' : 'info'

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
		headless: args.headless ?? true,
		devtools: args.devtools ?? false,
		chromeVersion: args.chrome,
		sandbox: args.sandbox ?? true,

		runEnv: initRunEnv(workRootPath, testDataPath),
		testSettingOverrides: {},
		persistentRunner: false,
		failStatusCode: args['fail-status-code'],
	}

	if (args.loopCount) {
		opts.testSettingOverrides.loopCount = args.loopCount
	}
	opts.testSettingOverrides = setupDelayOverrides(args, opts.testSettingOverrides)

	if (args.watch) {
		opts.persistentRunner = true
		opts.testCommander = makeTestCommander(file)
	}

	await runCommandLine(opts)
}

async function runTestScriptWithConfiguration(args: RunCommonArguments): Promise<void> {
	const fileErr = checkFile(args.configFile, 'Configuration file')
	if (fileErr) throw fileErr
	const { options, paths } = await readConfigFile(args.configFile)

	if (!paths.testPathMatch || !paths.testPathMatch.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const files: string[] = getFilesPattern(paths.testPathMatch)
	console.info(
		'The following test scripts that matched the testPathMatch pattern are going to be executed:',
	)
	for (const file of files.sort()) {
		const arg: RunCommonArguments = {
			...options,
			...paths,
			file,
		}
		await runTestScript(arg)
	}
	console.info('Test running with the config file has finished')
}

const cmd: CommandModule = {
	command: 'run [file] [options]',
	describe: 'Run [a test script| test scripts with configuration] locally',

	async handler(args: RunCommonArguments): Promise<void> {
		if (args.file) {
			await runTestScript(args)
		} else {
			await runTestScriptWithConfiguration(args)
		}
		process.exit(0)
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
			.fail((msg, err) => {
				if (err) console.error(chalk.redBright(err.message))
				if (msg) console.error(chalk.redBright(msg))
				process.exit(1)
			})
	},
}

export default cmd
