import { Logger } from 'winston'
import PuppeteerDriver from './driver/Puppeteer'
import { IReporter } from './Reporter'
import { Browser } from './types'
import Runner from './Runner'
import { ITestScript, mustCompileFile } from './TestScript'

export interface ElementOptions {
	logger: Logger
	reporter: IReporter
	testScript: string
	driver?: { new (): Browser }
	process?: NodeJS.Process
}

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	let { logger, testScript, driver } = opts

	if (!driver) driver = PuppeteerDriver

	const runner = new Runner(driver, opts.reporter, logger)

	process.on('SIGINT', async () => {
		logger.debug('Received SIGINT')
		await runner.shutdown()
	})

	process.once('SIGUSR2', async () => {
		// Usually received by nodemon on file change
		logger.debug('Received SIGUSR2')
		runner.shutdown().then(() => process.kill(process.pid, 'SIGUSR2'))
	})

	logger.debug(`Loading test script: ${testScript}`)

	try {
		const testScriptObj: ITestScript = await mustCompileFile(testScript)
		await runner.run(testScriptObj)
		return
	} catch (err) {
		console.error(err)
		process.exit(1)
	}
}
