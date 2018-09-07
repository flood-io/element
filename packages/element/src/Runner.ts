import { ConcreteLaunchOptions, PuppeteerClient, NullPuppeteerClient } from './driver/Puppeteer'
import { RuntimeEnvironment } from './runtime-environment/types'
import { Logger } from 'winston'
import Test from './runtime/Test'
import { TestObserver } from './runtime/test-observers/Observer'
import { TestSettings, ConcreteTestSettings } from './runtime/Settings'
import { IReporter } from './Reporter'
import { AsyncFactory } from './utils/Factory'
import { TestScriptError, ITestScript } from './TestScript'

class Looper {
	public iterations = 0
	private timeout: NodeJS.Timer
	private cancelled = false
	private loopCount: number

	constructor(settings: ConcreteTestSettings) {
		if (settings.duration > 0) {
			this.timeout = setTimeout(() => {
				this.cancelled = true
			}, settings.duration * 1e3)
		}

		this.loopCount = settings.loopCount
	}

	finish() {
		clearTimeout(this.timeout)
	}

	get continueLoop(): boolean {
		const hasInfiniteLoops = this.loopCount <= 0
		const hasLoopsLeft = this.iterations < this.loopCount

		return !this.cancelled && (hasLoopsLeft || hasInfiniteLoops)
	}

	async run(iterator: (iteration: number) => Promise<void>): Promise<number> {
		while (this.continueLoop) {
			await iterator(++this.iterations)
		}
		this.finish()
		return this.iterations
	}
}

export default class Runner {
	private looper: Looper
	constructor(
		private clientFactory: AsyncFactory<PuppeteerClient>,
		private runEnv: RuntimeEnvironment,
		private reporter: IReporter,
		private logger: Logger,
		private testSettingOverrides: TestSettings,
		private launchOptionOverrides: Partial<ConcreteLaunchOptions>,
		private testObserverFactory: (t: TestObserver) => TestObserver = x => x,
	) {}

	// interrupt() {
	// this.interrupts++
	// }

	// async shutdown(): Promise<void> {
	// this.interrupts++
	// this.logger.info('Shutting down...')
	// // if (this.test) {
	// // await this.test.shutdown()
	// // }

	// if (this.shouldShutdownBrowser) {
	// clearTimeout(this.timeout)
	// this.testContinue = false
	// this.logger.debug('Closing driver: Google Chrome...')
	// try {
	// await this.driver.close()
	// } catch (err) {
	// console.error(`Error while closing browser: ${err}`)
	// }
	// }
	// }

	async stop(): Promise<void> {
		return
	}

	get shouldShutdownBrowser(): boolean {
		return !!this.launchOptionOverrides.headless && !this.launchOptionOverrides.devtools
	}

	async run(testScriptFactory: AsyncFactory<ITestScript>): Promise<void> {
		const testScript = await testScriptFactory()

		const clientPromise = this.launchClient(testScript)

		await this.runTestScript(testScript, clientPromise)
	}

	async launchClient(testScript: ITestScript): Promise<PuppeteerClient> {
		console.log('Runner launch client')

		// evaluate the script so that we can get its settings
		// TODO refactor into EvaluatedTestScript
		const settings = new Test(
			new NullPuppeteerClient(),
			this.runEnv,
			this.reporter,
			this.testObserverFactory,
		).enqueueScript(testScript, this.testSettingOverrides)

		const options: Partial<ConcreteLaunchOptions> = this.launchOptionOverrides
		options.ignoreHTTPSErrors = settings.ignoreHTTPSErrors

		return this.clientFactory(options)
	}

	async runTestScript(
		testScript: ITestScript,
		clientPromise: Promise<PuppeteerClient>,
	): Promise<void> {
		console.log('running test script')
		const test = new Test(await clientPromise, this.runEnv, this.reporter, this.testObserverFactory)
		// this.test = test

		try {
			const settings = test.enqueueScript(testScript, this.testSettingOverrides)

			if (settings.name) {
				this.logger.info(`
*************************************************************
* Loaded test plan: ${settings.name}
* ${settings.description}
*************************************************************
				`)
			}

			if (settings.duration > 0) {
				this.logger.debug(`Test timeout set to ${settings.duration}s`)
			}
			this.logger.debug(`Test loop count set to ${settings.loopCount} iterations`)
			this.logger.debug(`Settings: ${JSON.stringify(settings, null, 2)}`)

			debugger
			await test.beforeRun()

			console.log('looper')
			this.looper = new Looper(settings)
			await this.looper.run(async iteration => {
				this.logger.info(`Starting iteration ${iteration}`)

				let startTime = new Date()
				try {
					await test.run(iteration)
				} catch (err) {
					this.logger.error(
						`[Iteration: ${iteration}] Error in Runner Loop: ${err.name}: ${err.message}\n${
							err.stack
						}`,
					)
					throw err
				}
				let duration = new Date().valueOf() - startTime.valueOf()
				this.logger.info(`Iteration completed in ${duration}ms (walltime)`)
			})

			this.logger.info(`Test completed after ${this.looper.iterations} iterations`)
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

			await test.cancel()
		}
	}
}
