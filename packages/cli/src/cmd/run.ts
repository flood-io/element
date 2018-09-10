// import * as ora from "ora";
import {
	runCommandLine,
	runUntilExit,
	ElementOptions,
	WorkRoot,
	FloodProcessEnv,
	TestCommander,
} from '@flood/element/api'
import { ConsoleReporter } from '../utils/ConsoleReporter'
import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'
import * as path from 'path'
import createLogger from '../utils/Logger'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import chalk from 'chalk'

export const handler = (args: Arguments) => {
	const { file, verbose } = args
	const workRootPath = getWorkRootPath(file, args['work-root'])
	const testDataPath = getTestDataPath(file, args['test-data-root'])

	const verboseBool: boolean = !!verbose

	// TODO set level from verbose
	const logger = createLogger('debug', true)
	const reporter = new ConsoleReporter(logger, verboseBool)

	const opts: ElementOptions = {
		logger: logger,
		testScript: file,
		strictCompilation: args.strict,
		reporter: reporter,
		verbose: verboseBool,
		headless: args.headless,
		devtools: args.devtools,
		chrome: args.chrome,
		sandbox: args.sandbox,

		runEnv: initRunEnv(workRootPath, testDataPath),
		testSettingOverrides: {
			loopCount: args.loopCount,
		},
		persistentRunner: false,
	}

	if (args.fastForward) {
		opts.testSettingOverrides.actionDelay = 1
		opts.testSettingOverrides.stepDelay = 1
	}

	if (args.watch) {
		opts.persistentRunner = true
		opts.testCommander = makeTestCommander(file)
	}

	runUntilExit(() => runCommandLine(opts))

	// let spinner
	// if (!args.json) spinner = ora(`Launching test '${file}'`).start()

	// console.log("awaited");
	// process.exit(0);
}

function makeTestCommander(file: string): TestCommander {
	const commander = new EventEmitter()

	const watcher = watch(file, { persistent: true })
	watcher.on('change', (path, stats) => {
		console.log('change', path)
		if (path === file) {
			console.log('changy')
			commander.emit('rerun-test')
			console.log('after changy')
		}
	})
	return commander
}

// TODO use args to get an override work-dir root
function getWorkRootPath(file: string, root?: string): string {
	const ext = path.extname(file)
	const bare = path.basename(file, ext)

	root = root || path.dirname(file)

	return path.resolve(root, bare, new Date().toISOString())
}

function getTestDataPath(file: string, root?: string): string {
	root = root || path.dirname(file)

	return path.resolve(root)
}

function initRunEnv(root: string, testDataRoot: string) {
	const workRoot = new WorkRoot(root, {
		'test-data': testDataRoot,
	})

	console.info('workRoot', workRoot.root)

	return {
		workRoot,
		stepEnv(): FloodProcessEnv {
			return {
				BROWSER_ID: 1,
				FLOOD_GRID_REGION: 'local',
				FLOOD_GRID_SQEUENCE_ID: 1,
				FLOOD_GRID_SEQUENCE_ID: 1,
				FLOOD_GRID_INDEX: 1,
				FLOOD_GRID_NODE_SEQUENCE_ID: 1,
				FLOOD_NODE_INDEX: 1,
				FLOOD_SEQUENCE_ID: 1,
				FLOOD_PROJECT_ID: 1,
				SEQUENCE: 1,
				FLOOD_LOAD_TEST: false,
			}
		},
	}
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
		.option('watch', {
			describe: 'Watch <file> and rerun the test when it changes.',
		})
		.option('fast-forward', {
			describe: 'Reduces configured action and step wait times to speed up testing.',
		})
		.option('work-root', {
			describe:
				'Specify a custom work root. (Default: a directory named after your test script, and at the same location)',
		})
		.option('test-data-root', {
			describe:
				'Specify a custom path to find test data files. (Default: the same directory as the test script)',
		})
		.option('no-headless', {
			describe:
				'Run in non-headless mode so that you can see what the browser is doing as it runs the test',
		})
		.option('devtools', {
			describe: 'Run in non-headless mode and also open devtools',
		})
		.option('no-sandbox', {
			describe: 'Disable the chrome sandbox - advanced option, mostly necessary on linux',
		})
		.option('loop-count', {
			describe:
				'Override the loopCount setting in the test script. For verification purposes, we override this to 1.',
			type: 'number',
			default: 1,
		})
		.option('strict', {
			describe: 'Compile the script in strict mode. This can be helpful in diagnosing problems.',
		})
		.option('verbose', {
			describe: 'Verbose mode',
		})
		.check(({ file, chrome }) => {
			if (!file.length) return new Error('Please provide a test script')
			if (!existsSync(file)) return new Error(`${chalk.redBright('File does not exist')} '${file}'`)
			// if (chrome && !existsSync(chrome))
			// return new Error(`Chrome executable path does not exist '${chrome}'`)
			return true
		})
}
