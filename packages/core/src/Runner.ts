import { ConcreteLaunchOptions, PuppeteerClient } from './driver/Puppeteer'
import { Logger } from 'winston'
import Test from './runtime/Test'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { TestObserver } from './runtime/test-observers/Observer'
import { TestSettings, ConcreteTestSettings } from './runtime/Settings'
import { IReporter } from './Reporter'
import { AsyncFactory } from './utils/Factory'
import { CancellationToken } from './utils/CancellationToken'
import { TestScriptError } from './TestScriptError'

export interface TestCommander {
	on(event: 'rerun-test', listener: () => void): this
}

export interface IRunner {
	run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<boolean>
	stop(): Promise<void>
}

function delay(t: number, v?: any) {
	return new Promise(function(resolve) {
		setTimeout(resolve.bind(null, v), t)
	})
}

class Looper {
	public iterations = 0
	private timeout: any
	private cancelled = false
	private loopCount: number

	public done: Promise<void>
	private doneResolve: () => void

	constructor(settings: ConcreteTestSettings, running = true) {
		if (settings.duration > 0) {
			this.timeout = setTimeout(() => {
				this.cancelled = true
			}, settings.duration * 1e3)
		}

		this.loopCount = settings.loopCount
		this.cancelled = !running
		this.done = new Promise(resolve => (this.doneResolve = resolve))
	}

	stop() {
		this.cancelled = true
	}

	async kill(): Promise<void> {
		if (this._killer !== undefined) {
			this._killer()
		}
		this.cancelled = true

		await this.done
	}

	_killer: () => void
	set killer(killCb: () => void) {
		this._killer = killCb
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

		// XXX perhaps call this in a finally to ensure it gets called
		this.doneResolve()

		return this.iterations
	}
}

export class Runner {
	protected looper: Looper
	running = true
	public clientPromise: Promise<PuppeteerClient> | undefined

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

	async run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<boolean> {
		const testScript = await testScriptFactory()

		this.clientPromise = this.launchClient(testScript)

		return this.runTestScript(testScript, this.clientPromise)
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
	): Promise<boolean> {
		if (!this.running) return true

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

			await test.beforeRun()

			const cancelToken = new CancellationToken()
			let result = false

			this.looper = new Looper(settings, this.running)
			this.looper.killer = () => cancelToken.cancel()
			await this.looper.run(async iteration => {
				this.logger.info(`Starting iteration ${iteration}`)

				const startTime = new Date()
				try {
					result = await test.runWithCancellation(iteration, cancelToken)
				} catch (err) {
					this.logger.error(
						`[Iteration: ${iteration}] Error in Runner Loop: ${err.name}: ${err.message}\n${err.stack}`,
					)
					throw err
				}
				const duration = new Date().valueOf() - startTime.valueOf()
				this.logger.info(`Iteration completed in ${duration}ms (walltime)`)
			})

			this.logger.info(`Test completed after ${this.looper.iterations} iterations`)
			return result
		} catch (err) {
			if (err instanceof TestScriptError) {
				this.logger.error('\n' + err.toStringNodeFormat())
			} else {
				this.logger.error(`flood element error: ${err.message}`)
				this.logger.debug(err.stack)
			}

			// if (process.env.NODE_ENV !== 'production') {
			this.logger.debug(err.stack)
			// }
		}

		if (testToCancel !== undefined) {
			await testToCancel.cancel()
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
			this.logger.error('an error occurred in the script')
			this.logger.error(err)
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

	async run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<boolean> {
		this.testScriptFactory = testScriptFactory

		// TODO detect changes in testScript settings affecting the client
		this.clientPromise = this.launchClient(await testScriptFactory())

		this.rerunTest()
		await this.waitUntilStopped()
		// return new Promise<void>((resolve, reject) => {})
		return true
	}
}
