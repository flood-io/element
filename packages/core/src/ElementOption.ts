import { IReporter, VerboseReporter, BaseReporter, ReportCache } from '@flood/element-report'
import { TestCommander } from './Runner'
import { FloodProcessEnv, RuntimeEnvironment } from './runtime-environment/types'
import WorkRoot from './runtime-environment/WorkRoot'
import { TestSettings } from './runtime/Settings'
import { TestObserver } from './runtime/test-observers/TestObserver'
import { AsyncFactory } from './utils/Factory'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { extname, basename, join, dirname, resolve } from 'path'
import sanitize from 'sanitize-filename'
import { PlaywrightClient } from './driver/Playwright'
import { BrowserType } from './page/types'
import ms from 'ms'

export interface ElementRunArguments {
	testFiles: string[]
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
	verbose?: boolean
	browser: BrowserType
	export?: boolean
	notExistingFiles: string[]
	mu: boolean
}

export interface ElementOptions {
	runEnv: RuntimeEnvironment
	reporter: IReporter
	clientFactory?: AsyncFactory<PlaywrightClient>
	testScript: string
	strictCompilation: boolean
	headless: boolean
	devtools: boolean
	sandbox: boolean
	process?: NodeJS.Process
	verbose: boolean
	testSettingOverrides: TestSettings
	testObserverFactory?: (t: TestObserver) => TestObserver
	persistentRunner: boolean
	testCommander?: TestCommander
	failStatusCode: number
	browser: BrowserType
	export?: boolean
}

export interface ElementConfig {
	options: ElementOptions
	paths: {
		workRoot: string
		testDataRoot: string
		testPathMatch: string[]
	}
	flood?: {
		hosted: boolean
		vu: number
		duration: number
		rampup: number
		regions: string[]
	}
	testSettings?: TestSettings
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
	return resolve(root)
}

function setupDelayOverrides(
	args: ElementRunArguments,
	testSettingOverrides: TestSettings,
): TestSettings {
	if (testSettingOverrides == null) testSettingOverrides = {}
	const { actionDelay, stepDelay } = args

	if (typeof actionDelay === 'string' && actionDelay) {
		testSettingOverrides.actionDelay = ms(actionDelay)
	} else if (typeof actionDelay === 'number') {
		testSettingOverrides.actionDelay = actionDelay
	}

	if (typeof stepDelay === 'string' && stepDelay) {
		testSettingOverrides.stepDelay = ms(stepDelay)
	} else if (typeof stepDelay === 'number') {
		testSettingOverrides.stepDelay = stepDelay
	}

	if (args.fastForward) {
		testSettingOverrides.stepDelay = 1000
		testSettingOverrides.actionDelay = 1000
	} else if (args.slowMo) {
		testSettingOverrides.stepDelay = 10000
		testSettingOverrides.actionDelay = 10000
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
		if (resolve(path) === resolve(file)) {
			commander.emit('rerun-test')
		}
	})
	return commander
}

export function normalizeElementOptions(
	args: ElementRunArguments,
	cache: ReportCache,
): ElementOptions {
	const { file, verbose } = args
	const workRootPath = getWorkRootPath(file, args['work-root'])
	const testDataPath = getTestDataPath(file, args['test-data-root'])
	const verboseBool = !!verbose

	const reporter = verboseBool ? new VerboseReporter(cache) : new BaseReporter(cache)

	const opts: ElementOptions = {
		testScript: file,
		strictCompilation: args.strict ?? false,
		reporter: reporter,
		verbose: verboseBool,
		headless: args.headless ?? true,
		devtools: args.devtools ?? false,
		sandbox: args.sandbox ?? true,

		runEnv: initRunEnv(workRootPath, testDataPath),
		testSettingOverrides: {},
		persistentRunner: false,
		failStatusCode: args['fail-status-code'],
		browser: args.browser,
		export: args.export,
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
