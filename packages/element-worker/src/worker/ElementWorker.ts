import {
	TestSettings,
	EvaluatedScript,
	PlaywrightClient,
	connectWS,
	AsyncFactory,
	Runner,
	PreCompiledTestScript,
	RuntimeEnvironment,
	WorkRoot,
} from '@flood/element-core'
import createLogger from './Logger'
import { ConsoleReporter } from './ConsoleReporter'
import { AssertionError } from 'assert'
import { existsSync } from 'fs'

export interface WorkerOptions {
	browserURL: string
	testScriptPath: string
	testSettings: TestSettings
	root: string
	testDataRoot: string
}

function assertsValidOptions(options: any): asserts options is WorkerOptions {
	if (typeof options.browserURL != 'string')
		throw new AssertionError({ message: 'browserURL must be a string' })

	if (typeof options.testScriptPath != 'string')
		throw new AssertionError({ message: 'testScriptPath must be a string' })

	if (!existsSync(options.testScriptPath))
		throw new AssertionError({ message: 'testScriptPath does not exist' })

	if (!existsSync(options.root)) throw new AssertionError({ message: 'root does not exist' })

	if (!existsSync(options.testDataRoot))
		throw new AssertionError({ message: 'testDataRoot does not exist' })

	if (options.settings == null) throw new AssertionError({ message: 'testSettings are not valid' })
}

/**
 * Element Worker is a class responsible for simulating a VU during a test run. This work
 * is done by providing the minimum required options to start the Runner and response to
 * start and stop signals from the parent.
 */
export class ElementWorker {
	runner: Runner

	constructor(private workerId: string, private options: WorkerOptions) {
		assertsValidOptions(options)
	}

	async connect(url: string): Promise<PlaywrightClient> {
		return connectWS(url)
	}

	async start() {
		const verboseBool = false
		const logLevel = 'debug'
		const logger = createLogger(logLevel, true)
		const reporter = new ConsoleReporter(logger, verboseBool)

		const launchOptions = {}

		if (this.runner == null)
			this.runner = new Runner(
				this.connectionFactory(),
				undefined,
				reporter,
				logger,
				this.options.testSettings,
				launchOptions,
			)
		return this.runner.run(this.testScriptFactory())
	}

	public async stop() {
		return this.runner.stop()
	}

	private get environment(): RuntimeEnvironment {
		const workRoot = new WorkRoot(this.options.root, {
			'test-data': this.options.testDataRoot,
		})

		return {
			workRoot,
			stepEnv() {
				return {
					BROWSER_ID: this.workerId,
					FLOOD_GRID_REGION: 'local',
					FLOOD_GRID_SQEUENCE_ID: 0,
					FLOOD_GRID_SEQUENCE_ID: 0,
					FLOOD_GRID_INDEX: 0,
					FLOOD_GRID_NODE_SEQUENCE_ID: 0,
					FLOOD_NODE_INDEX: 0,
					FLOOD_SEQUENCE_ID: 0,
					FLOOD_PROJECT_ID: 0,
					SEQUENCE: 0,
					FLOOD_LOAD_TEST: false,
				}
			},
		}
	}

	private testScriptFactory(): AsyncFactory<EvaluatedScript> {
		return () =>
			Promise.resolve(
				new EvaluatedScript(
					this.environment,
					PreCompiledTestScript.fromFile(this.options.testScriptPath),
				),
			)
	}

	private connectionFactory(): AsyncFactory<PlaywrightClient> {
		return () => this.connect(this.options.browserURL)
	}
}
