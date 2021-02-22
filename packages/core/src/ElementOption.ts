import { IReporter, VerboseReporter, BaseReporter } from '@flood/element-report'
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
import Spinnies from 'spinnies'
import ms from 'ms'
export interface RunArguments {
	loopCount?: number
	duration?: string | number
	stepDelay?: string | number
	actionDelay?: string | number
	fastForward?: boolean
	slowMo?: boolean
	watch?: boolean
	file?: string
	headless?: boolean
	devtools?: boolean
	sandbox?: boolean
	verbose?: boolean
	browser?: BrowserType
	export?: boolean
	executablePath?: string
	downloadsPath?: string
	showScreenshot?: boolean
}

export interface ElementRunArguments {
	testFiles: string[]
	file: string
	chrome?: string
	strict?: boolean
	headless?: boolean
	devtools?: boolean
	sandbox?: boolean
	loopCount?: number
	duration?: string | number
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
	showScreenshot?: boolean
	notExistingFiles: string[]
	mu: boolean
	runArgs: RunArguments
	testSettings?: TestSettings
	executablePath?: string
	downloadsPath?: string
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
	testSettings: TestSettings
	testSettingOverrides: TestSettings
	testObserverFactory?: (t: TestObserver) => TestObserver
	persistentRunner: boolean
	testCommander?: TestCommander
	failStatusCode: number
	browser: BrowserType
	export?: boolean
	executablePath?: string
	downloadsPath?: string
	showScreenshot?: boolean
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
	const actionDelay = args.runArgs?.actionDelay ?? args.actionDelay
	const stepDelay = args.runArgs?.stepDelay ?? args.stepDelay

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

	if (args.runArgs?.fastForward || args.fastForward) {
		testSettingOverrides.stepDelay = 1000
		testSettingOverrides.actionDelay = 1000
	} else if (args.runArgs?.slowMo || args.slowMo) {
		testSettingOverrides.stepDelay = 10000
		testSettingOverrides.actionDelay = 10000
	}
	return testSettingOverrides
}

function initRunEnv(root: string, testDataRoot: string, testScript: string) {
	const workRoot = new WorkRoot(root, {
		'test-data': testDataRoot,
		'test-script': basename(testScript, extname(testScript)),
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
	spinnies?: Spinnies,
): ElementOptions {
	const { file, verbose, runArgs, testSettings } = args
	const workRootPath = getWorkRootPath(file, args['work-root'])
	const testDataPath = getTestDataPath(file, args['test-data-root'])
	let verboseBool = !!verbose

	if (runArgs?.file && !!runArgs.verbose) verboseBool = !!runArgs.verbose

	const reporter = verboseBool ? new VerboseReporter(spinnies) : new BaseReporter(spinnies)

	let opts: ElementOptions = {
		testScript: file,
		strictCompilation: args.strict ?? false,
		reporter: reporter,
		verbose: verboseBool,
		headless: args.headless ?? true,
		devtools: args.devtools ?? false,
		sandbox: args.sandbox ?? true,
		runEnv: initRunEnv(workRootPath, testDataPath, file),
		testSettings: {},
		testSettingOverrides: {},
		persistentRunner: false,
		failStatusCode: args['fail-status-code'],
		browser: args.browser,
		export: args.export,
		executablePath: args.executablePath ?? '',
		downloadsPath: args.downloadsPath ?? '',
		showScreenshot: args.showScreenshot ?? false,
	}

	opts.testSettings = { ...testSettings }

	if (args.loopCount) {
		opts.testSettings.loopCount = args.loopCount
	}

	if (args.duration) {
		opts.testSettings.duration = args.duration
	}

	if (args.stepDelay) {
		opts.testSettings.stepDelay = args.stepDelay
	}

	if (args.actionDelay) {
		opts.testSettings.actionDelay = args.actionDelay
	}

	if (runArgs?.file) {
		const { loopCount, duration } = runArgs
		if (loopCount !== undefined) opts.testSettingOverrides.loopCount = loopCount
		if (duration !== undefined) opts.testSettingOverrides.duration = duration
		opts = { ...opts, ...runArgs }
	}

	opts.testSettingOverrides = setupDelayOverrides(args, opts.testSettingOverrides)

	if ((runArgs?.file && runArgs?.watch) || args.watch) {
		opts.persistentRunner = true
		opts.testCommander = makeTestCommander(file)
	}

	return opts
}
