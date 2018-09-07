import { Logger } from 'winston'
import { IReporter } from './Reporter'
import { PuppeteerClient, launch } from './driver/Puppeteer'
import { RuntimeEnvironment } from './runtime-environment/types'
import Runner from './Runner'
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
	watch: boolean
	headless: boolean
	devtools: boolean
	chrome: string | boolean
	sandbox: boolean
	process?: NodeJS.Process
	verbose: boolean
	testSettingOverrides: TestSettings
	testObserverFactory?: (t: TestObserver) => TestObserver
}

export function runUntilExit(fn: () => Promise<void>) {
	fn()
		.then(() => process.exit(0))
		.catch(err => {
			console.error(err)
			process.exit(1)
		})
}

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	let { logger, testScript, clientFactory } = opts

	const runner = new Runner(
		clientFactory || launch,
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
