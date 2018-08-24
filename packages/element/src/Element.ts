import { Logger } from 'winston'
import PuppeteerDriver from './driver/Puppeteer'
import { IReporter } from './Reporter'
import { RuntimeEnvironment } from './runtime-environment/types'
import { Browser } from './types'
import Runner from './Runner'
import { ITestScript, TestScriptOptions, mustCompileFile } from './TestScript'
import { TestSettings } from './runtime/Settings'

export interface ElementOptions {
	logger: Logger
	runEnv: RuntimeEnvironment
	reporter: IReporter
	testScript: string
	driver?: { new (): Browser }
	headless: boolean
	devtools: boolean
	chrome: string | boolean
	sandbox: boolean
	process?: NodeJS.Process
	verbose: boolean
	testSettingOverrides: TestSettings
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
	let { logger, testScript, driver } = opts

	if (!driver) driver = PuppeteerDriver

	const runner = new Runner(opts.runEnv, driver, opts.reporter, logger, opts.testSettingOverrides, {
		headless: opts.headless,
		devtools: opts.devtools,
		sandbox: opts.sandbox,
		chrome: opts.chrome,
	})

	process.on('SIGINT', async () => {
		logger.debug('Received SIGINT')
		await runner.shutdown()
	})

	process.once('SIGUSR2', async () => {
		// Usually received by nodemon on file change
		logger.debug('Received SIGUSR2')
		await runner.shutdown()
		process.kill(process.pid, 'SIGUSR2')
	})

	logger.debug(`Loading test script: ${testScript}`)

	let testScriptOptions: TestScriptOptions = {
		stricterTypeChecking: false,
		traceResolution: false,
	}

	const testScriptObj: ITestScript = await mustCompileFile(testScript, testScriptOptions)
	await runner.run(testScriptObj)
}
