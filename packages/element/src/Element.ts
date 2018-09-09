import { Logger } from 'winston'
import { IReporter } from './Reporter'
import { PuppeteerClient, launch } from './driver/Puppeteer'
import { RuntimeEnvironment } from './runtime-environment/types'
import { IRunner, Runner, PersistentRunner, TestCommander } from './Runner'
import { ITestScript, TestScriptOptions, mustCompileFile } from './TestScript'
import { TestSettings } from './runtime/Settings'
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
	chrome: string | boolean
	sandbox: boolean
	process?: NodeJS.Process
	verbose: boolean
	testSettingOverrides: TestSettings
	testObserverFactory?: (t: TestObserver) => TestObserver
	persistentRunner: boolean
	testCommander?: TestCommander
}

export function runUntilExit(fn: () => Promise<void>) {
	fn()
		.then(() => {
			console.log('process exited')
			process.exit(0)
		})
		.catch(err => {
			console.log('process exited - with error')
			console.error(err)
			process.exit(1)
		})
}

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	let { logger, testScript, clientFactory } = opts

	let runnerClass: { new (...args: any[]): IRunner }
	if (opts.persistentRunner) {
		runnerClass = PersistentRunner
	} else {
		runnerClass = Runner
	}

	const runner = new runnerClass(
		clientFactory || launch,
		opts.testCommander,
		opts.runEnv,
		opts.reporter,
		logger,
		opts.testSettingOverrides,
		{
			headless: opts.headless,
			devtools: opts.devtools,
			sandbox: opts.sandbox,
			chrome: opts.chrome,
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

	let testScriptOptions: TestScriptOptions = {
		stricterTypeChecking: opts.strictCompilation,
		traceResolution: false,
	}

	const testScriptFactory = async (): Promise<ITestScript> => {
		return await mustCompileFile(testScript, testScriptOptions)
	}

	await runner.run(testScriptFactory)
}
