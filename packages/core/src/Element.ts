import { join } from 'path'
import findRoot from 'find-root'
import { Logger } from 'winston'
import { IReporter } from './Reporter'
import { PuppeteerClient, launch } from './driver/Puppeteer'
import { RuntimeEnvironment } from './runtime-environment/types'
import { IRunner, Runner, PersistentRunner, TestCommander } from './Runner'
import { mustCompileFile } from './TestScript'
import { TestScriptOptions } from './TestScriptOptions'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { TestSettings, ChromeVersion } from './runtime/Settings'
import { TestObserver } from './runtime/test-observers/Observer'
import { AsyncFactory } from './utils/Factory'

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

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	const { logger, testScript, clientFactory } = opts

	// TODO proper types for args
	let runnerClass: { new (...args: any[]): IRunner }
	if (opts.persistentRunner) {
		runnerClass = PersistentRunner
	} else {
		runnerClass = Runner
	}

	const runner = new runnerClass(
		clientFactory || launch,
		opts.testCommander,
		opts.reporter,
		logger,
		opts.testSettingOverrides,
		{
			headless: opts.headless,
			devtools: opts.devtools,
			sandbox: opts.sandbox,
			chromeVersion: opts.chromeVersion,
			debug: opts.verbose,
		},
		opts.testObserverFactory,
	)

	const installSignalHandlers = true

	if (installSignalHandlers) {
		process.on('SIGINT', async () => {
			logger.debug('Received SIGINT')
			await runner.stop()
		})

		process.once('SIGUSR2', async () => {
			// Usually received by nodemon on file change
			logger.debug('Received SIGUSR2')
			await runner.stop()
			process.kill(process.pid, 'SIGUSR2')
		})
	}

	logger.debug(`Loading test script: ${testScript}`)

	const testScriptOptions: TestScriptOptions = {
		stricterTypeChecking: opts.strictCompilation,
		traceResolution: false,
	}

	const testScriptFactory = async (): Promise<EvaluatedScript> => {
		return new EvaluatedScript(opts.runEnv, await mustCompileFile(testScript, testScriptOptions))
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const pkg = require(join(findRoot(__dirname), 'package.json'))

		console.log(`Running the test with:\n- Element v${pkg.version}\n- Node ${process.version}`)
		await runner.run(testScriptFactory)
	} catch (err) {
		console.log('Element exited with error')
		console.error(err)
		process.exit(opts.failStatusCode)
	}
}
