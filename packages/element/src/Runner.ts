import { ITestRunner, Browser } from './types'
import Logger from './utils/Logger'
import Test from './runtime/Test'
import Reporter from './reporter/Influx'
import { Factory } from './runtime/VM'
import { LaunchOptions } from 'puppeteer'
import { TestScriptError, ITestScript } from './TestScript'

export default class Runner implements ITestRunner {
	private driver: Browser
	private timeout: any
	private testContinue: boolean = true
	private test: Test

	constructor(Driver: Factory<Browser>, private logger: Logger) {
		this.driver = new Driver()
	}

	private async shutdown(exitCode: number = 0) {
		this.logger.info('Shutting down...')
		await this.test.after()
		clearTimeout(this.timeout)
		this.testContinue = false
		this.logger.debug('Closing driver: Google Chrome...')
		try {
			;(await this.driver) && this.driver.close()
		} catch (err) {
			console.error(`Error while closing browser: ${err}`)
		}
		process.exit(exitCode)
	}

	async run(testScript: ITestScript): Promise<void> {
		let interupts = 0

		process.on('SIGINT', async () => {
			this.logger.debug('Received SIGINT')
			interupts++
			await this.shutdown()
		})

		process.once('SIGUSR2', async () => {
			// Usually received by nodemon on file change
			this.logger.debug('Received SIGUSR2')
			interupts++
			this.shutdown().then(() => process.kill(process.pid, 'SIGUSR2'))
		})

		let reporter = new Reporter(this.logger)
		let test = new Test(reporter)
		this.test = test

		try {
			let settings = test.enqueueScript(testScript)
			let options: LaunchOptions = {
				ignoreHTTPSErrors: settings.ignoreHTTPSErrors,
			}

			this.driver.launch(options)
			test.attachDriver(await this.driver.client())

			let iterations = 0

			if (settings.name) {
				this.logger.info(`
*************************************************************
* Loaded test plan: ${settings.name}
* ${settings.description}
*************************************************************
				`)
			}

			if (settings) {
				if (settings.hasOwnProperty('duration') && settings.duration && settings.duration > 0) {
					this.timeout = setTimeout(() => {
						this.testContinue = false
					}, settings.duration * 1e3)
					this.logger.debug(`Test timeout set to ${settings.duration}s`)
				}

				if (settings.hasOwnProperty('loopCount')) {
					this.logger.debug(`Test loop count set to ${settings.loopCount} iterations`)
				}

				this.logger.debug(`Settings: ${JSON.stringify(settings, null, 2)}`)
			}

			// for (let [k, v] of Object.entries(settings)) {
			// 	this.logger.debug(`Setting: ${k}: ${v}`)
			// }

			await test.before()

			const testLoopContinue = () => {
				if (this.testContinue === false) return
				this.testContinue = interupts === 0
				if (this.testContinue === false) return

				if (Number(settings.loopCount) > 0) {
					this.testContinue = iterations < Number(settings.loopCount)
				}
			}

			while (this.testContinue) {
				iterations++
				this.logger.info(`Starting iteration ${iterations}`)

				let startTime = new Date()
				try {
					await test.run(iterations)
				} catch (err) {
					this.logger.error(
						`[Iteration: ${iterations}] Error in Runner Loop: ${err.name}: ${err.message}\n${
							err.stack
						}`,
					)
					throw err
				}
				let duration = new Date().valueOf() - startTime.valueOf()
				this.logger.info(`Iteration completed in ${duration}ms (walltime)`)
				testLoopContinue()
			}

			this.logger.info(`Test completed after ${iterations} iterations`)
			await test.after()
			return
		} catch (err) {
			if (err instanceof TestScriptError) {
				this.logger.error('\n' + err.toStringNodeFormat())
			} else {
				this.logger.error('internal flood-chrome error')
			}

			// if (process.env.NODE_ENV !== 'production') {
			this.logger.debug(err.stack)
			// }

			await test.after()
			await this.shutdown(1)
		}
	}
}
