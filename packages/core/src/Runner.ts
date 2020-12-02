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
	ITERATION,
	reportRunTest,
	Status,
	StepResult,
	ACTION,
	MEASUREMENT,
} from '@flood/element-report'
import { Looper } from './Looper'
import chalk from 'chalk'
import ms from 'ms'

export interface TestCommander {
	on(event: 'rerun-test', listener: () => void): this
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IRunner {
	run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<void>
	stop(): Promise<void>
	getSummaryIterations(): IterationResult[]
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
	) {}

	async stop(): Promise<void> {
		this.running = false
		if (this.looper) await this.looper.kill()
		if (this.client) await this.client.close()
		return
	}

	async runEvalScript(testScript: EvaluatedScript): Promise<void> {
		this.client = await this.launchClient(testScript)
		await this.runTestScript(testScript, this.client)
	}

	async run(testScriptFactory: AsyncFactory<EvaluatedScript>): Promise<void> {
		const testScript = await testScriptFactory()

		this.client = await this.launchClient(testScript)

		await this.runTestScript(testScript, this.client)
	}

	async launchClient(testScript: EvaluatedScript): Promise<PlaywrightClient> {
		const { settings } = testScript

		let options: Partial<ConcreteLaunchOptions> = this.launchOptionOverrides
		options.ignoreHTTPSError = settings.ignoreHTTPSError
		if (settings.viewport) {
			options.viewport = settings.viewport
			settings.device = null
		}
		if (settings.browser) {
			options.browser = settings.browser
		}
		if (settings.browserLaunchOption) {
			options = { ...options, ...settings.browserLaunchOption }
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
					if (!this.reporter.worker) {
						console.log(`Restarting ${iterationName}`)
					} else {
						this.reporter.sendReport(`Restarting ${iterationName}`, ACTION)
					}
					this.looper.restartLoopDone()
				} else {
					if (!this.reporter.worker) {
						if (iteration > 1) {
							console.log(chalk.grey('--------------------------------------------'))
						}
						startTime = new Date()
						console.log(`${chalk.bold('\u25CC')} ${iterationName} of ${this.looper.loopCount}`)
					} else {
						this.reporter.sendReport(
							JSON.stringify({
								iterationMsg: `${iterationName} ${
									this.looper.loopCount !== -1 ? `of ${this.looper.loopCount}` : ''
								}`,
								iteration,
							}),
							ITERATION,
						)
					}
				}
				try {
					await test.runWithCancellation(iteration, cancelToken, this.looper)
					// eslint-disable-next-line no-empty
				} catch {
				} finally {
					if (!this.looper.isRestart) {
						const summarizedData = this.summarizeIteration(test, iteration, startTime)
						reportTableData.push(summarizedData)
					}
					test.resetSummarizeStep()
				}
			})

			if (!this.reporter.worker) {
				console.log(`Test completed after ${this.looper.loopCount} iterations`)
			}
			await test.runningBrowser?.close()
		} catch (err) {
			throw Error(err)
		} finally {
			if (!this.reporter.worker) {
				const table = reportRunTest(reportTableData)
				console.groupEnd()
				console.log(table)
			}
		}

		if (testToCancel !== undefined) {
			await testToCancel.cancel()
		}
	}

	getIterationName(iteration: number): string {
		return `Iteration ${iteration}`
	}

	summarizeIteration(test: Test, iteration: number, startTime: Date): number[] {
		let passedMessage = '',
			failedMessage = '',
			skippedMessage = '',
			unexecutedMessage = ''
		let passedNo = 0,
			failedNo = 0,
			skippedNo = 0,
			unexecutedNo = 0

		const iterationName: string = this.getIterationName(iteration)
		const duration: number = new Date().valueOf() - startTime.valueOf()
		const stepResult: StepResult[] = test.summarizeStep()
		const iterationResult = {
			name: iterationName,
			duration: duration,
			stepResults: stepResult,
		}
		this.summaryIteration.push(iterationResult)

		stepResult.forEach(step => {
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
					this.reporter.sendReport(
						JSON.stringify({ name: 'skipped', value: skippedNo, iteration }),
						MEASUREMENT,
					)
					break
				case Status.UNEXECUTED:
					unexecutedNo += 1
					unexecutedMessage = chalk(`${unexecutedNo}`, `${Status.UNEXECUTED}`)
					this.reporter.sendReport(
						JSON.stringify({ name: 'unexecuted', value: unexecutedNo, iteration }),
						MEASUREMENT,
					)
					break
			}
		})
		const finallyMessage = chalk(passedMessage, failedMessage, skippedMessage, unexecutedMessage)
		if (!this.reporter.worker) {
			console.log(`${iterationName} completed in ${ms(duration)} (walltime) ${finallyMessage}`)
		}
		return [iteration, passedNo, failedNo, skippedNo, unexecutedNo]
	}

	getSummaryIterations(): IterationResult[] {
		return this.summaryIteration
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
	) {
		super(
			clientFactory,
			testCommander,
			reporter,
			testSettingOverrides,
			launchOptionOverrides,
			testObserverFactory,
		)

		if (this.testCommander !== undefined) {
			this.testCommander.on('rerun-test', async () => this.rerunTest())
		}
	}

	rerunTest() {
		setImmediate(() => this.runNextTest())
	}

	async runNextTest() {
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
			const evaluateScript = await testScriptFactory()
			this.client = await this.launchClient(evaluateScript)
			await this.runTestScript(evaluateScript, this.client)
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
