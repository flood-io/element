import { existsSync, statSync } from 'fs'
import {
	WorkRoot,
	FloodProcessEnv,
	TestCommander,
	TestSettings,
	runCommandLine,
	ElementOptions,
} from '@flood/element-core'
import { Arguments } from 'yargs'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { extname, basename, join, dirname, resolve } from 'path'
import sanitize from 'sanitize-filename'
import createLogger from '.././utils/Logger'
import { ConsoleReporter } from '.././utils/ConsoleReporter'

export interface RunCommonArguments extends Arguments {
	file: string
	chrome?: string
	strict?: boolean
	headless?: boolean
	devtools?: boolean
	sandbox?: boolean
	loopCount?: number
	stepDelay?: number
	actionDelay?: number
	fastForward?: boolean
	slowMo?: boolean
	watch?: boolean
	'work-root'?: string
	'test-data-root'?: string
	'fail-status-code': number
}

export function checkFile(file: string, paramName = 'Test script'): Error | undefined {
	if (!file.length) return new Error(`Please provide a ${paramName}`)

	if (!existsSync(file)) return new Error(`${paramName} '${file}' does not exist`)

	const stat = statSync(file)
	if (!stat.isFile() && !stat.isSymbolicLink())
		return new Error(`${paramName} '${file}' is not a file`)
}

export function setupDelayOverrides(args: RunCommonArguments, testSettingOverrides: TestSettings) {
	if (testSettingOverrides == null) testSettingOverrides = {}

	testSettingOverrides.actionDelay = args.actionDelay && args.actionDelay > 0 ? args.actionDelay : 0
	testSettingOverrides.stepDelay = args.stepDelay && args.stepDelay > 0 ? args.stepDelay : 0

	if (args.fastForward) {
		testSettingOverrides.stepDelay = 1
		testSettingOverrides.actionDelay = 1
	} else if (args.slowMo) {
		testSettingOverrides.stepDelay = 10
		testSettingOverrides.actionDelay = 10
	}
	return testSettingOverrides
}

export function getWorkRootPath(file: string, root?: string): string {
	const ext = extname(file)
	const bare = basename(file, ext)

	if (root == null) {
		root = join(dirname(file), 'tmp', 'element-results', bare)
	}

	const dateString = sanitize(new Date().toISOString())

	return resolve(root, dateString)
}

export function getTestDataPath(file: string, root?: string): string {
	root = root || dirname(file)

	// return root
	return resolve(root)
}

export function initRunEnv(root: string, testDataRoot: string) {
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

export function makeTestCommander(file: string): TestCommander {
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

export function runTestScript(args: RunCommonArguments) {
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

	runCommandLine(opts)
}
