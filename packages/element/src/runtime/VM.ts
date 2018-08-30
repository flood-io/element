import { NodeVM } from 'vm2'
import { Until } from '../page/Until'
import { By } from '../page/By'
import { RuntimeEnvironment } from '../runtime-environment/types'
import { SuiteDefinition } from './types'
import { MouseButtons, Device, Key, userAgents } from '../page/Enums'
import { StepOptions } from './Step'
import * as Faker from 'faker'
import * as nodeAssert from 'assert'
import { IReporter } from '../Reporter'
import { EventEmitter } from 'events'
import { ITestScript } from '../TestScript'
import { DEFAULT_SETTINGS, ConcreteTestSettings, normalizeSettings } from './Settings'
import { expect } from '../utils/Expect'
import { Step, StepFunction, normalizeStepOptions } from './Step'
import { TestDataImpl } from '../test-data/TestData'
import Test from './Test'

// import * as debugFactory from 'debug'
// const debug = debugFactory('element:vm')

export type Opaque = {} | void | null | undefined
export type Factory<T> = new (...args: Opaque[]) => T
export type CallbackFunc = (...args: Opaque[]) => void | Promise<void>

export function unreachable(message = 'unreachable'): Error {
	return new Error(message)
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
	private vm: NodeVM

	constructor(private runEnv: RuntimeEnvironment, private script: ITestScript) {}

	private createVirtualMachine(floodElementActual) {
		this.vm = new NodeVM({
			console: 'redirect',
			sandbox: {},
			require: {
				external: false,
				builtin: [],
				context: 'sandbox',
				mock: {
					'@flood/chrome': floodElementActual,
					'@flood/element': floodElementActual,
					faker: Faker,
					assert: nodeAssert,
				},
			},
		})
	}

	public bindReporter(reporter: IReporter): void {
		// hack because the vm2 typings don't include their EventEmitteryness
		let eevm = (this.vm as any) as EventEmitter
		;['log', 'info', 'error', 'dir', 'trace'].forEach(key =>
			eevm.on(`console.${key}`, (message, ...args) =>
				reporter.testScriptConsole(key, message, ...args),
			),
		)
	}

	// TODO switch to testData/loaders
	public evaluate(test: Test): { settings: ConcreteTestSettings; steps: Step[] } {
		// Clear existing steps
		const steps: Step[] = []

		let rawSettings = DEFAULT_SETTINGS

		const ENV = this.runEnv.stepEnv()

		// closes over steps: Step[]
		const step = (...args: any[]) => {
			// name: string, fn: (driver: Browser) => Promise<void>
			let name: string,
				fn: StepFunction<any>,
				stepOptions: StepOptions = {}

			if (args.length === 3) {
				;[name, stepOptions, fn] = args
				stepOptions = normalizeStepOptions(stepOptions)
			} else {
				;[name, fn] = args
			}

			console.assert(typeof name === 'string', 'Step name must be a string')
			if (steps.find(({ name: stepName }) => name === stepName)) {
				console.warn(`Duplicate step name: ${name}, skipping step`)
				return
			}
			steps.push({ fn, name, stepOptions })
		}

		// closes over test
		function createSuite(): SuiteDefinition {
			const suite = function(callback) {
				return callback
			} as SuiteDefinition
			suite.withData = <T>(data: TestDataImpl<T>, callback) => {
				test.testData = expect(data, 'TestData is not present')
				test.testData.setInstanceID(ENV.SEQUENCE.toString())
				return callback
			}

			return suite
		}

		// let suite = createSuite()

		let context = {
			setup: settings => {
				Object.assign(rawSettings, settings)
			},

			ENV,

			suite: createSuite(),
			// Supports either 2 or 3 args
			step,
			// Actual implementation of @flood/chrome
			By,
			Until,
			Device,
			MouseButtons,
			TestData: test.testDataLoaders,
			Key,
			userAgents,

			test() {
				throw new Error(`test() is no longer supported, please use 'export default suite(...)'`)
			},
		}

		this.createVirtualMachine(context)

		rawSettings.name = this.script.testName
		rawSettings.description = this.script.testDescription

		let result = this.vm.run(this.script.vmScript)

		let { settings } = result
		if (settings) {
			rawSettings = { ...rawSettings, ...settings }
		}

		let testFn = expect(result.default, 'Test script must export a default function')

		/**
		 * Evaluate default function
		 */
		testFn.apply(null, [step])

		settings = {
			...DEFAULT_SETTINGS,
			...normalizeSettings(rawSettings),
		}

		return { settings, steps }
	}

	/**
	 * Utility method for running a step by name
	 * @param name
	 */
	/* public async runStepByName<T>(driver: PuppeteerClient, name: string): Promise<T> {
		console.assert(
			arguments.length === 2,
			'runStepByName(driver, stepName: string) requires a driver as first argument',
		)
		let step = expect(this.steps.find(step => step.name === name), `No step with name "${name}"`)
		let browser = new Browser(
			this.runEnv.workRoot,
			driver,
			this.settings,
			this.willRunCommand.bind(this),
			this.didRunCommand.bind(this),
		)
		browser.settings = { ...this.settings, ...step.stepOptions }
		return step.fn.call(null, browser)
	} */
}
