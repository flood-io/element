import { ConcreteLaunchOptions, PuppeteerClient } from './driver/Puppeteer'
import { Logger } from 'winston'
import Test from './runtime/Test'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { TestObserver } from './runtime/test-observers/Observer'
import { TestSettings } from './runtime/Settings'
import { IReporter } from './Reporter'
import { AsyncFactory } from './utils/Factory'
import { CancellationToken } from './utils/CancellationToken'
import { TestScriptError } from './TestScriptError'
import { Looper } from './Looper'
import { RecoverWith, SummaryIteraion, SummaryStep } from './runtime/Step'

export interface TestCommander {
	on(event: 'rerun-test', listener: () => void): this
}

export interface IRunner {
	run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<void>
	stop(): Promise<void>
}

function delay(t: number, v?: any) {
	return new Promise(function(resolve) {
		setTimeout(resolve.bind(null, v), t)
	})
}

export class Runner {
	protected looper: Looper
	running = true
	public clientPromise: Promise<PuppeteerClient> | undefined
	public summaryIteraion: SummaryIteraion[] = []

	constructor(
		private clientFactory: AsyncFactory<PuppeteerClient>,
		protected testCommander: TestCommander | undefined,
		private reporter: IReporter,
		protected logger: Logger,
		private testSettingOverrides: TestSettings,
		private launchOptionOverrides: Partial<ConcreteLaunchOptions>,
		private testObserverFactory: (t: TestObserver) => TestObserver = x => x,
	) {}

	async stop(): Promise<void> {
		this.running = false
		if (this.looper) await this.looper.kill()
		if (this.clientPromise) (await this.clientPromise).close()
		return
	}

	async run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<void> {
		const testScript = await testScriptFactory()

		this.clientPromise = this.launchClient(testScript)

		await this.runTestScript(testScript, this.clientPromise)
	}

	async launchClient(testScript: EvaluatedScript): Promise<PuppeteerClient> {
		const { settings } = testScript

		const options: Partial<ConcreteLaunchOptions> = this.launchOptionOverrides
		options.ignoreHTTPSErrors = settings.ignoreHTTPSErrors
		if (settings.viewport) {
			options.defaultViewport = settings.viewport
			settings.device = null
		}
		if (options.chromeVersion == null) options.chromeVersion = settings.chromeVersion

		if (options.args == null) options.args = []
		if (Array.isArray(settings.launchArgs)) options.args.push(...settings.launchArgs)

		return this.clientFactory(options)
	}

	async runTestScript(
		testScript: EvaluatedScript,
		clientPromise: Promise<PuppeteerClient>,
	): Promise<void> {
		if (!this.running) return

		let testToCancel: Test | undefined

		try {
			const test = new Test(
				await clientPromise,
				testScript,
				this.reporter,
				this.testSettingOverrides,
				this.testObserverFactory,
			)

			testToCancel = test

			const { settings } = test

			if (settings.name) {
				this.logger.debug(`
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

			await test.beforeRun()

			const cancelToken = new CancellationToken()

			this.looper = new Looper(settings, this.running)
			this.looper.killer = () => cancelToken.cancel()
			let startTime = new Date()
			let isRestart = false
			let titleIteration = ''
			await this.looper.run(async iteration => {
				if (isRestart) {
					titleIteration = `Restarting iteration ${iteration}`
				} else {
					if (iteration > 1) {
						console.log('--------------------------------------------')
					}
					test.resetSummarizeStep()
					startTime = new Date()
					titleIteration = `Iteration ${iteration} of ${this.looper.iterations}`
				}
				console.group(titleIteration)
				try {
					await test.runWithCancellation(iteration, cancelToken, this.looper)
				} catch (err) {
					this.logger.debug(
						`[Iteration: ${iteration}] Error in Runner Loop: ${err.name}: ${err.message}\n${err.stack}`,
					)
				} finally {
					this.summaryIteraion[`Iteration ${iteration}`] = test.summarizeStep()
					console.groupEnd()
					if (!this.looper.isRestart) {
						const duration = new Date().valueOf() - startTime.valueOf()
						console.log(`Iteration ${iteration} completed in ${duration}ms (walltime)`)
					}
					isRestart = this.looper.isRestart
				}
			})

			//console.log(this.summaryIteraion)
			await test.runningBrowser?.close()
		} catch (err) {
			if (err instanceof TestScriptError) {
				this.logger.debug('\n' + err.toStringNodeFormat())
			} else {
				this.logger.debug(`flood element error: ${err.message}`)
				this.logger.debug(err.stack)
			}
			// if (process.env.NODE_ENV !== 'production') {
			this.logger.debug(err.stack)
			// }
			throw err
		}

		if (testToCancel !== undefined) {
			await testToCancel.cancel()
		}
	}
	isRestart(iteration: number): boolean {
		const latestSteps: SummaryStep[] = this.summaryIteraion[`Iteration ${iteration}`]
		if (latestSteps) {
			const latestStep: SummaryStep = latestSteps[latestSteps.length - 1]
			if (latestStep.recovery === RecoverWith.RESTART) {
				return true
			}
		}
		return false
	}
}

export class PersistentRunner extends Runner {
	public testScriptFactory: AsyncFactory<EvaluatedScript> | undefined
	public clientPromise: Promise<PuppeteerClient> | undefined
	private stopped = false

	constructor(
		clientFactory: AsyncFactory<PuppeteerClient>,
		testCommander: TestCommander | undefined,
		reporter: IReporter,
		logger: Logger,
		testSettingOverrides: TestSettings,
		launchOptionOverrides: Partial<ConcreteLaunchOptions>,
		testObserverFactory: (t: TestObserver) => TestObserver = x => x,
	) {
		super(
			clientFactory,
			testCommander,
			reporter,
			logger,
			testSettingOverrides,
			launchOptionOverrides,
			testObserverFactory,
		)

		if (this.testCommander !== undefined) {
			this.testCommander.on('rerun-test', () => this.rerunTest())
		}
	}

	rerunTest() {
		this.logger.info('rerun requested')
		setImmediate(() => this.runNextTest())
	}

	async runNextTest() {
		// destructure for type checking (narrowing past undefined)
		const { clientPromise, testScriptFactory } = this
		if (clientPromise === undefined) {
			return
		}
		if (testScriptFactory === undefined) {
			return
		}

		if (this.looper) {
			await this.looper.kill()
		}

		try {
			await this.runTestScript(await testScriptFactory(), clientPromise)
		} catch (err) {
			this.logger.debug('an error occurred in the script')
			this.logger.debug(err)
		}
	}

	async stop() {
		this.stopped = true
		this.running = false
		if (this.looper) this.looper.stop()
	}

	async waitUntilStopped(): Promise<void> {
		if (this.stopped) {
			return
		} else {
			await delay(1000)
			return this.waitUntilStopped()
		}
	}

	async run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<void> {
		this.testScriptFactory = testScriptFactory

		// TODO detect changes in testScript settings affecting the client
		this.clientPromise = this.launchClient(await testScriptFactory())

		this.rerunTest()
		await this.waitUntilStopped()
		// return new Promise<void>((resolve, reject) => {})
	}
}
