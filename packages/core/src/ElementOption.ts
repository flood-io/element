import { IReporter, VerboseReporter } from '@flood/element-report'
import { PuppeteerClient } from './driver/Puppeteer'
import { TestCommander } from './Runner'
import { FloodProcessEnv, RuntimeEnvironment } from './runtime-environment/types'
import WorkRoot from './runtime-environment/WorkRoot'
import { ChromeVersion, TestSettings } from './runtime/Settings'
import { TestObserver } from './runtime/test-observers/Observer'
import { AsyncFactory } from './utils/Factory'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { extname, basename, join, dirname, resolve } from 'path'
import sanitize from 'sanitize-filename'
import { Logger } from 'winston'

export interface ElementRunArguments {
	testFiles: string[]
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
	configFile: string
	verbose?: boolean
}

export interface ElementOptions {
	logger: Logger
	runEnv: RuntimeEnvironment
	reporter: IReporter
	clientFactory?: AsyncFactory<PuppeteerClient>
	testScript: string
	strictCompilation: boolean
	headless: boolean
	devtools: boolean
	chromeVersion: ChromeVersion | string | undefined
	sandbox: boolean
	process?: NodeJS.Process
	verbose: boolean
	testSettingOverrides: TestSettings
	testObserverFactory?: (t: TestObserver) => TestObserver
	persistentRunner: boolean
	testCommander?: TestCommander
	failStatusCode: number
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

function setupDelayOverrides(
	args: ElementRunArguments,
	testSettingOverrides: TestSettings,
): TestSettings {
	if (testSettingOverrides == null) testSettingOverrides = {}
	const { actionDelay, stepDelay } = args

	testSettingOverrides.actionDelay = actionDelay && actionDelay > 0 ? actionDelay : 0
	testSettingOverrides.stepDelay = stepDelay && stepDelay > 0 ? stepDelay : 0

	if (args.fastForward) {
		testSettingOverrides.stepDelay = 1
		testSettingOverrides.actionDelay = 1
	} else if (args.slowMo) {
		testSettingOverrides.stepDelay = 10
		testSettingOverrides.actionDelay = 10
	}
	return testSettingOverrides
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

export function normalizeElementOptions(args: ElementRunArguments): ElementOptions {
	const { file, verbose } = args
	const workRootPath = getWorkRootPath(file, args['work-root'])
	const testDataPath = getTestDataPath(file, args['test-data-root'])
	const verboseBool = !!verbose

	const reporter = new VerboseReporter(verboseBool)

	console.info(`workRootPath: ${workRootPath}`)
	console.info(`testDataPath: ${testDataPath}`)

	const opts: ElementOptions = {
		logger: reporter.logger,
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

	return opts
}
