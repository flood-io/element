import { NodeVM } from 'vm2'
import { Sandbox } from './Sandbox'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { PuppeteerClient } from '../types'
import { MouseButtons, Device, Key, userAgents } from '../page/Enums'
import * as debug from 'debug'
import { TestSettings, StepOptions, Flood } from '@flood/chrome'
import * as Faker from 'faker'
import * as nodeAssert from 'assert'
import { IReporter } from '../Reporter'
import { EventEmitter } from 'events'
import { ITestScript } from '../TestScript'
import { DEFAULT_ACTION_WAIT_SECONDS, DEFAULT_STEP_WAIT_SECONDS } from './Test'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'
import { TestData } from '../test-data/TestData'

const debugVM = debug('vm')
const debugVMCallback = debug('vm:callback')

export type Opaque = {} | void | null | undefined
export type Option<T> = T | null
export type Maybe<T> = Option<T> | undefined | void
export type Factory<T> = new (...args: Opaque[]) => T
export type CallbackFunc = (...args: Opaque[]) => void | Promise<void>

export enum CALLBACK_QUEUES {
	PrepareStep = 'prepareStep',
	BeforeStep = 'beforeStep',
	AfterStep = 'afterStep',
	StepSuccess = 'stepSuccess',
	BeforeAction = 'beforeAction',
	AfterAction = 'afterAction',
	Error = 'error',
	Skip = 'skip',
}

export function expect<T>(val: Maybe<T>, message: string): T {
	if (val === null || val === undefined) throw new Error(message)
	return val as T
}

export function unreachable(message = 'unreachable'): Error {
	return new Error(message)
}

async function runCallback(queueName: string, ...args: any[]) {
	let callbacks = expect<CallbackFunc[]>(this.callbacks.get(queueName), 'Unknown queue')
	debugVMCallback(`Run callbacks: ${queueName} with ${args}`)
	for (const fn of callbacks) {
		await fn(...args)
	}
}

function normalizeSettings(settings: TestSettings): TestSettings {
	// Convert user inputted seconds to milliseconds
	if (typeof settings.waitTimeout === 'number' && settings.waitTimeout > 1e3) {
		settings.waitTimeout = settings.waitTimeout / 1e3
	} else if (Number(settings.waitTimeout) === 0) {
		settings.waitTimeout = 30
	}

	// Ensure action delay is stored in seconds (assuming any value greater than 60 seconds would be ms)
	if (typeof settings.actionDelay === 'number' && settings.actionDelay > 60) {
		settings.actionDelay = settings.actionDelay / 1e3
	} else if (Number(settings.actionDelay) === 0) {
		settings.actionDelay = DEFAULT_ACTION_WAIT_SECONDS
	}

	// Ensure step delay is stored in seconds
	if (typeof settings.stepDelay === 'number' && settings.stepDelay > 60) {
		settings.stepDelay = settings.stepDelay / 1e3
	} else if (Number(settings.stepDelay) === 0) {
		settings.actionDelay = DEFAULT_STEP_WAIT_SECONDS
	}

	return settings
}

export interface Step {
	fn: StepFunction
	name: string
	settings?: TestSettings
}

export type StepFunction = (driver: Sandbox, data?: any) => Promise<void>

export const DEFAULT_SETTINGS: TestSettings = {
	duration: -1,
	loopCount: Infinity,
	actionDelay: 2,
	stepDelay: 6,
	screenshotOnFailure: true,
	clearCookies: true,
	clearCache: false,
	waitTimeout: 30,
	responseTimeMeasurement: 'step',
	consoleFilter: ['error', 'warn', 'info', 'log'],
	userAgent: CustomDeviceDescriptors['Chrome Desktop Large'].userAgent,
	device: 'Chrome Desktop Large',
	ignoreHTTPSErrors: false,
}

/**
 * VM is a simpler implementation of the previous stack based VM.
 *
 * VM uses a priority queue to schedule actions for the whole test plan
 * and run them in order. This allows actions to enqueue more actions based on
 * condtional logic such as if statements or loops where the desired state isn't
 * known until a 'test' condition is met.
 *
 * Error handling and synschronisation is handled by the Transaction class.
 *
 * @export
 * @class VM
 * @template Specifier
 */
export class VM {
	public callDuration: number = 0
	public steps: Step[] = []
	public currentSandbox: Sandbox

	private vm: NodeVM
	private settings: TestSettings = DEFAULT_SETTINGS
	private rawSettings: TestSettings = DEFAULT_SETTINGS
	private callbacks: Map<string, CallbackFunc[]> = new Map()
	private skipped: string[] = []
	private errors: Error[] = []
	private skipAll: boolean = false
	private testData: TestData<any>

	constructor(private script: ITestScript) {
		this.callbacks = new Map()
		Object.values(CALLBACK_QUEUES).forEach(queueName => this.callbacks.set(queueName, []))
		this.testData = TestData.fromData([{}]).circular()
	}

	private get hasErrors() {
		return this.errors.length > 0
	}

	public get stepNames(): string[] {
		return this.steps.map(s => s.name)
	}

	private createVirtualMachine(floodChromeActual) {
		this.vm = new NodeVM({
			console: 'redirect',
			sandbox: {},
			require: {
				external: false,
				builtin: [],
				context: 'sandbox',
				mock: {
					'@flood/chrome': floodChromeActual,
					faker: Faker,
					assert: nodeAssert,
				},
			},
		})
	}

	public on(queueName: string, callbackFn: CallbackFunc) {
		let queue = expect(this.callbacks.get(queueName), `Unknown callback queue: ${queueName}`)
		queue.push(callbackFn)
	}

	public off(queueName: string) {
		this.callbacks.delete(queueName)
	}

	public attachReporterToConsole(reporter: IReporter): void {
		// hack because the vm2 typings don't include their EventEmitteryness
		let eevm = (this.vm as any) as EventEmitter
		;['log', 'info', 'error', 'dir', 'trace'].forEach(key =>
			eevm.on(`console.${key}`, (message, ...args) =>
				reporter.testScriptConsole(key, message, ...args),
			),
		)
	}

	public evaluate(): TestSettings {
		// Clear existing steps
		this.steps = []

		this.rawSettings = {}

		let {
			THREAD_ID: BROWSER_ID,
			FLOOD_GRID_REGION,
			FLOOD_GRID_SQEUENCE_ID,
			FLOOD_GRID_INDEX,
			FLOOD_GRID_NODE_SEQUENCE_ID,
			FLOOD_NODE_INDEX,
			FLOOD_SEQUENCE_ID,
			FLOOD_PROJECT_ID,
		} = process.env

		let ENV = {
			BROWSER_ID: Number(BROWSER_ID),
			FLOOD_GRID_REGION,
			FLOOD_GRID_SQEUENCE_ID: Number(FLOOD_GRID_SQEUENCE_ID),
			FLOOD_GRID_INDEX: Number(FLOOD_GRID_INDEX),
			FLOOD_GRID_NODE_SEQUENCE_ID: Number(FLOOD_GRID_NODE_SEQUENCE_ID),
			FLOOD_NODE_INDEX: Number(FLOOD_NODE_INDEX),
			FLOOD_SEQUENCE_ID: Number(FLOOD_SEQUENCE_ID),
			FLOOD_PROJECT_ID: Number(FLOOD_PROJECT_ID),
			SEQUENCE: Number(BROWSER_ID) * Number(FLOOD_GRID_INDEX) * Number(FLOOD_NODE_INDEX),
		}

		const step = (...args: any[]) => {
			// name: string, fn: (driver: Sandbox) => Promise<void>
			let name: string,
				fn: StepFunction,
				settings: TestSettings = {}

			if (args.length === 3) {
				;[name, settings, fn] = args
				settings = normalizeSettings(settings)
			} else {
				;[name, fn] = args
			}

			console.assert(typeof name === 'string', 'Step name must be a string')
			if (this.steps.find(({ name: stepName }) => name === stepName)) {
				console.warn(`Duplicate step name: ${name}, skipping step`)
				return
			}
			this.steps.push({ fn, name, settings })
		}

		let vmScope = this

		function createSuite(): Flood.ISuiteDefinition {
			let suite = function(callback) {
				return callback
			} as Flood.ISuiteDefinition
			suite.withData = <T>(data: TestData<T>, callback) => {
				vmScope.testData = expect(data, 'TestData is not present')
				vmScope.testData.setInstanceID(ENV.SEQUENCE.toString())
				return callback
			}

			return suite
		}

		let suite = createSuite()

		let context = {
			setup: settings => {
				this.rawSettings = { ...{}, ...settings, ...this.rawSettings }
			},

			ENV,

			suite,
			// Supports either 2 or 3 args
			step,
			// Actual implementation of @flood/chrome
			By,
			Until,
			Device,
			MouseButtons,
			TestData,
			Key,
			userAgents,

			test() {
				throw new Error(`test() is no longer supported, please use 'export default suite(...)'`)
			},
		}

		this.createVirtualMachine(context)

		this.rawSettings.name = this.script.testName
		this.rawSettings.description = this.script.testDescription

		let result = this.vm.run(this.script.vmScript)

		let { settings } = result
		if (settings) {
			this.rawSettings = { ...this.rawSettings, ...settings }
		}

		let testFn = expect(result.default, 'Test script must export a default function')

		/**
		 * Evaluate default function
		 */
		testFn.apply(null, [step])

		this.settings = { ...DEFAULT_SETTINGS, ...normalizeSettings(this.rawSettings) }

		return this.settings
	}

	public async execute(driver: PuppeteerClient): Promise<any> {
		this.callDuration = 0
		this.skipped = []
		this.errors = []

		debugVM('execute() start')

		try {
			let sandbox = new Sandbox(
				driver,
				this.settings,
				this.willRunCommand.bind(this),
				this.didRunCommand.bind(this),
				async (err: Error): Promise<void> => {
					console.error('VM: Error running command:', err)
					this.errors.push(err)
				},
			)

			this.currentSandbox = sandbox
			debugVM('running this.before(sandbox)')
			await this.before(sandbox)

			// An error occurred during sandbox setup
			// this could be a runtime bug in the flood-chrome code
			if (this.hasErrors) throw this.errors[0]

			debugVM('Feeding data')
			let testDataRecord = this.testData.feed()
			if (testDataRecord === null) {
				throw new Error('Test data exhausted, consider making it circular?')
				// console.log('Test data exhausted, consider making it circular?')
			} else {
				// console.log(JSON.stringify(testDataRecord))
				debugVM(JSON.stringify(testDataRecord))
			}

			debugVM('running steps')
			for (let step of this.steps) {
				if (this.hasErrors || this.skipAll) {
					await this.willRunStep(step.name, step.settings)
					this.skipped.push(step.name)
					await this.didRunStep(step.name, sandbox.fetchScreenshots())
					continue
				}

				await this.willRunStep(step.name, step.settings)
				let startTime = new Date().valueOf()
				try {
					debugVM(`Run step: ${step.name} ${step.fn.toString()}`)

					sandbox.settings = { ...this.settings, ...step.settings }
					await step.fn.call(null, sandbox, testDataRecord)
				} catch (err) {
					// NOTE: This is probably unreachable now with Sandbox error handling
					// unreachable('Error handling here should never be reached')
					console.log(`Error in step "${step.name}"`, err.stack)
					this.errors.push(err)
				}
				let duration = new Date().valueOf() - startTime
				this.callDuration += duration

				await this.didRunStep(step.name, sandbox.fetchScreenshots())
			}
		} catch (err) {
			// TODO: Cancel future steps if we reach here
			throw err
		}
	}

	/**
	 * Utility method for running a step by name
	 * @param name
	 */
	public async runStepByName<T>(driver: PuppeteerClient, name: string): Promise<T> {
		console.assert(
			arguments.length === 2,
			'runStepByName(driver, stepName: string) requires a driver as first argument',
		)
		let step = expect(this.steps.find(step => step.name === name), `No step with name "${name}"`)
		let sandbox = new Sandbox(
			driver,
			this.settings,
			this.willRunCommand.bind(this),
			this.didRunCommand.bind(this),
			this.didError.bind(this),
		)
		sandbox.settings = { ...this.settings, ...step.settings }
		return step.fn.call(null, sandbox)
	}

	private async willRunStep(name: string, settings: StepOptions): Promise<void> {
		return runCallback.apply(this, [CALLBACK_QUEUES.BeforeStep, name, settings])
	}

	public async loadTestData() {
		debugVM('Loading test data...')
		await this.testData.load()
	}

	/**
	 * Before hook which runs before all test operations, for setting up environment
	 *
	 * This is called by execute()
	 */
	public async before(sandbox: Sandbox): Promise<void> {
		// TODO: Test these hooks!
		if (this.settings.clearCache) await sandbox.clearBrowserCache()
		if (this.settings.clearCookies) await sandbox.clearBrowserCookies()
		if (this.settings.device) await sandbox.emulateDevice(this.settings.device)
		if (this.settings.userAgent) await sandbox.setUserAgent(this.settings.userAgent)
		if (this.settings.disableCache) await sandbox.setCacheDisabled(true)

		this.skipAll = false
		this.skipped = []
		// NOTE that sandbox itself can add errors, so we shouldn't set this.errors=[] here
	}

	private async didRunStep(name: string, screenshots: string[]): Promise<void> {
		if (this.skipped.length > 0) {
			debugVM('didRunStep - skipped', name)
			try {
				// Process skip callbacks
				for (const name of this.skipped) {
					await this.didSkip(name)
				}
				this.skipped = []
			} catch (err) {
				console.error(`Error in skip callbacks`, err)
			}
		} else if (this.hasErrors) {
			debugVM('didRunStep - errors', name)
			this.skipAll = true
			try {
				// Process error callbacks
				for (const err of this.errors) {
					await this.didError(err, name)
				}

				this.errors = []
			} catch (err) {
				console.error(`Error in error callbacks`, err)
			}
		} else {
			debugVM('didRunStep - succeeded', name)
			try {
				await this.didSucceed(name)
			} catch (err) {
				console.error(`Error in stepDidSucceed:`, err)
			}
		}
		return runCallback.apply(this, [CALLBACK_QUEUES.AfterStep, name, screenshots])
	}

	private async willRunCommand(name: string): Promise<void> {
		return runCallback.apply(this, [CALLBACK_QUEUES.BeforeAction, name])
	}

	private async didRunCommand(name: string): Promise<void> {
		return runCallback.apply(this, [CALLBACK_QUEUES.AfterAction, name])
	}

	private async didError(err: Error, name: string) {
		return runCallback.apply(this, [CALLBACK_QUEUES.Error, err, name])
	}
	private async didSucceed(name: string): Promise<void> {
		return runCallback.apply(this, [CALLBACK_QUEUES.StepSuccess, name])
	}

	private async didSkip(name: string) {
		return runCallback.apply(this, [CALLBACK_QUEUES.Skip, name])
	}
}
