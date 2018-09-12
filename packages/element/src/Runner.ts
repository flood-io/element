import { ConcreteLaunchOptions, PuppeteerClient, NullPuppeteerClient } from './driver/Puppeteer'
import { RuntimeEnvironment } from './runtime-environment/types'
import { Logger } from 'winston'
import Test from './runtime/Test'
import { TestObserver } from './runtime/test-observers/Observer'
import { TestSettings, ConcreteTestSettings } from './runtime/Settings'
import { IReporter } from './Reporter'
import { AsyncFactory } from './utils/Factory'
import { CancellationToken } from './utils/CancellationToken'
import { TestScriptError, ITestScript } from './TestScript'

export interface TestCommander {
	on(event: 'rerun-test', listener: () => void): this
}

export interface IRunner {
	run(testScriptFactory: AsyncFactory<ITestScript>): Promise<void>
	stop(): Promise<void>
}

function delay(t: number, v?: any) {
	return new Promise(function(resolve) {
		setTimeout(resolve.bind(null, v), t)
	})
}

class Looper {
	public iterations = 0
	private timeout: NodeJS.Timer
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
		private runEnv: RuntimeEnvironment,
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

	async run(testScriptFactory: AsyncFactory<ITestScript>): Promise<void> {
		const testScript = await testScriptFactory()

		this.clientPromise = this.launchClient(testScript)

		await this.runTestScript(testScript, this.clientPromise)
	}

	async launchClient(testScript: ITestScript): Promise<PuppeteerClient> {
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

		if (options.chromeVersion === undefined) {
			options.chromeVersion = settings.chromeVersion
		}

		return this.clientFactory(options)
	}

	async runTestScript(
		testScript: ITestScript,
		clientPromise: Promise<PuppeteerClient>,
	): Promise<void> {
		if (!this.running) return

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

			await test.beforeRun()

			const cancelToken = new CancellationToken()

			console.log('looper')
			this.looper = new Looper(settings, this.running)
			this.looper.killer = () => cancelToken.cancel()
			await this.looper.run(async iteration => {
				this.logger.info(`Starting iteration ${iteration}`)

				let startTime = new Date()
				try {
					await test.runWithCancellation(iteration, cancelToken)
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

export class PersistentRunner extends Runner {
	public testScriptFactory: AsyncFactory<ITestScript> | undefined
	public clientPromise: Promise<PuppeteerClient> | undefined
	private stopped = false

	constructor(
		clientFactory: AsyncFactory<PuppeteerClient>,
		testCommander: TestCommander | undefined,
		runEnv: RuntimeEnvironment,
		reporter: IReporter,
		logger: Logger,
		testSettingOverrides: TestSettings,
		launchOptionOverrides: Partial<ConcreteLaunchOptions>,
		testObserverFactory: (t: TestObserver) => TestObserver = x => x,
	) {
		super(
			clientFactory,
			testCommander,
			runEnv,
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

		console.log('persistent runner got a command: rerun')
		if (this.looper) {
			console.log('re-run')

			await this.looper.kill()

			console.log('looper finished')

			// ;(await clientPromise).reopenPage()
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

	async run(testScriptFactory: AsyncFactory<ITestScript>): Promise<void> {
		this.testScriptFactory = testScriptFactory

		// TODO detect changes in testScript settings affecting the client
		this.clientPromise = this.launchClient(await testScriptFactory())

		this.rerunTest()
		await this.waitUntilStopped()
		// return new Promise<void>((resolve, reject) => {})
	}
}
