import { ConcreteLaunchOptions, PlaywrightClient } from './driver/Playwright'
import Test from './runtime/Test'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { TestObserver } from './runtime/test-observers/TestObserver'
import { TestSettings } from './runtime/Settings'
import { AsyncFactory } from './utils/Factory'
import { CancellationToken } from './utils/CancellationToken'
import {
	IReporter,
	IterationResult,
	ReportCache,
	reportRunTest,
	Status,
	StepResult,
} from '@flood/element-report'
import { Looper } from './Looper'
import chalk from 'chalk'

export interface TestCommander {
	on(event: 'rerun-test', listener: () => void): this
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
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
	public client: PlaywrightClient | undefined
	public summaryIteration: IterationResult[] = []

	constructor(
		private clientFactory: AsyncFactory<PlaywrightClient>,
		protected testCommander: TestCommander | undefined,
		private reporter: IReporter,
		private testSettingOverrides: TestSettings,
		private launchOptionOverrides: Partial<ConcreteLaunchOptions>,
		private testObserverFactory: (t: TestObserver) => TestObserver = x => x,
		private cache: ReportCache,
	) {}

	async stop(): Promise<void> {
		this.running = false
		if (this.looper) await this.looper.kill()
		if (this.client) (await this.client).close()
		return
	}

	async run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<void> {
		const testScript = await testScriptFactory()

		this.client = await this.launchClient(testScript)

		await this.runTestScript(testScript, this.client)
	}

	async launchClient(testScript: EvaluatedScript): Promise<PlaywrightClient> {
		const { settings } = testScript

		const options: Partial<ConcreteLaunchOptions> = this.launchOptionOverrides
		options.ignoreHTTPSError = settings.ignoreHTTPSError
		if (settings.viewport) {
			options.viewport = settings.viewport
			settings.device = null
		}
		if (settings.browserType) {
			options.browserType = settings.browserType
		}
		if (options.args == null) options.args = []
		if (Array.isArray(settings.launchArgs)) options.args.push(...settings.launchArgs)

		return this.clientFactory(options, settings)
	}

	async runTestScript(testScript: EvaluatedScript, client: PlaywrightClient): Promise<void> {
		if (!this.running) return

		let testToCancel: Test | undefined
		const reportTableData: number[][] = []

		try {
			const test = new Test(
				client,
				testScript,
				this.reporter,
				this.testSettingOverrides,
				this.testObserverFactory,
			)
			testToCancel = test

			const { settings } = test

			if (settings.name) {
				console.info(`
*************************************************************
* Loaded test plan: ${settings.name}
* ${settings.description}
*************************************************************
				`)
			}

			await test.beforeRun()

			const cancelToken = new CancellationToken()

			this.looper = new Looper(settings, this.running)
			this.looper.killer = () => cancelToken.cancel()
			let startTime = new Date()
			await this.looper.run(async (iteration: number, isRestart: boolean) => {
				const iterationName = this.getIterationName(iteration)
				if (isRestart) {
					console.log(`Restarting ${iterationName}`)
					this.looper.restartLoopDone()
				} else {
					if (iteration > 1) {
						console.log(chalk.grey('--------------------------------------------'))
					}
					startTime = new Date()
					console.log(`${chalk.bold('\u25CC')} ${iterationName} of ${this.looper.iterations}`)
				}
				try {
					await test.runWithCancellation(iteration, cancelToken, this.looper)
					// eslint-disable-next-line no-empty
				} catch {
				} finally {
					this.summaryIteration[iterationName] = test.summarizeStep()
					if (!this.looper.isRestart) {
						const summarizedData = this.summarizeIteration(iteration, startTime)
						reportTableData.push(summarizedData)
					}
					test.resetSummarizeStep()
					this.cache.resetCache()
				}
			})

			console.log(`Test completed after ${this.looper.iterations} iterations`)
			await test.runningBrowser?.close()
		} catch (err) {
			throw Error(err)
		} finally {
			const table = reportRunTest(reportTableData)
			console.groupEnd()
			console.log(table)
		}

		if (testToCancel !== undefined) {
			await testToCancel.cancel()
		}
	}

	getIterationName(iteration: number): string {
		return `Iteration ${iteration}`
	}

	summarizeIteration(iteration: number, startTime: Date): number[] {
		let passedMessage = '',
			failedMessage = '',
			skippedMessage = '',
			unexecutedMessage = ''
		let passedNo = 0,
			failedNo = 0,
			skippedNo = 0,
			unexecutedNo = 0
		const steps: StepResult[] = this.summaryIteration[this.getIterationName(iteration)]
		steps.forEach(step => {
			switch (step.status) {
				case Status.PASSED:
					passedNo += 1
					passedMessage = chalk.green(`${passedNo}`, `${Status.PASSED}`)
					break
				case Status.FAILED:
					failedNo += 1
					failedMessage = chalk.red(`${failedNo}`, `${Status.FAILED}`)
					break
				case Status.SKIPPED:
					skippedNo += 1
					skippedMessage = chalk.yellow(`${skippedNo}`, `${Status.SKIPPED}`)
					break
				case Status.UNEXECUTED:
					unexecutedNo += 1
					unexecutedMessage = chalk(`${unexecutedNo}`, `${Status.UNEXECUTED}`)
					break
			}
		})
		const finallyMessage = chalk(passedMessage, failedMessage, skippedMessage, unexecutedMessage)
		const duration = new Date().valueOf() - startTime.valueOf()
		this.summaryIteration[`Iteration ${iteration}`].duration = duration
		console.log(
			`${this.getIterationName(iteration)} completed in ${duration}ms (walltime) ${finallyMessage}`,
		)
		return [iteration, passedNo, failedNo, skippedNo, unexecutedNo]
	}
}

export class PersistentRunner extends Runner {
	public testScriptFactory: AsyncFactory<EvaluatedScript> | undefined
	public client: PlaywrightClient | undefined
	private stopped = false

	constructor(
		clientFactory: AsyncFactory<PlaywrightClient>,
		testCommander: TestCommander | undefined,
		reporter: IReporter,
		testSettingOverrides: TestSettings,
		launchOptionOverrides: Partial<ConcreteLaunchOptions>,
		testObserverFactory: (t: TestObserver) => TestObserver = x => x,
		cache: ReportCache,
	) {
		super(
			clientFactory,
			testCommander,
			reporter,
			testSettingOverrides,
			launchOptionOverrides,
			testObserverFactory,
			cache,
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
		const { client, testScriptFactory } = this
		if (client === undefined) {
			return
		}
		if (testScriptFactory === undefined) {
			return
		}

		if (this.looper) {
			await this.looper.kill()
		}

		try {
			await this.runTestScript(await testScriptFactory(), client)
		} catch (err) {
			console.error(err.message)
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
		this.client = await this.launchClient(await testScriptFactory())

		this.rerunTest()
		await this.waitUntilStopped()
	}
}
