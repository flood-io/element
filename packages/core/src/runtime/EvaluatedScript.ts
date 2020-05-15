import { NodeVM } from 'vm2'
import Faker from 'faker'
import nodeAssert from 'assert'
import { EventEmitter } from 'events'

import fs from 'fs'
import { promisify } from 'util'
const exists = promisify(fs.exists)

import {
	Step,
	StepDefinition,
	TestFn,
	StepOptions,
	normalizeStepOptions,
	extractOptionsAndCallback,
} from './Step'
import { SuiteDefinition } from './types'
import Test from './Test'
import { mustCompileFile } from '../TestScript'
import { TestScriptError, TestScriptErrorMapper } from '../TestScriptError'
import { ITestScript } from '../ITestScript'
import { DEFAULT_SETTINGS, ConcreteTestSettings, normalizeSettings, TestSettings } from './Settings'
import { RuntimeEnvironment } from '../runtime-environment/types'
import { expect } from '../utils/Expect'

import { Until } from '../page/Until'
import { By } from '../page/By'
import { MouseButtons, Device, Key, userAgents } from '../page/Enums'

import { TestDataSource, TestDataFactory } from '../test-data/TestData'
import { BoundTestDataLoaders } from '../test-data/TestDataLoaders'
import { EvaluatedScriptLike } from './EvaluatedScriptLike'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('element:runtime:eval-script')

// TODO work out the right type for floodElementActual
function createVirtualMachine(floodElementActual: any, root?: string): NodeVM {
	const vm = new NodeVM({
		// console: 'redirect',
		console: 'inherit',
		sandbox: {},
		wrapper: 'commonjs',
		sourceExtensions: ['js', 'ts'],

		require: {
			builtin: ['*'],
			external: true,
			context: 'sandbox',
			root,

			mock: {
				'@flood/element': floodElementActual,
				faker: Faker,
				assert: nodeAssert,
			},
		},
	})
	vm.sandbox.process.env = process.env
	return vm
}

export class EvaluatedScript implements TestScriptErrorMapper, EvaluatedScriptLike {
	public steps: Step[]
	public settings: ConcreteTestSettings

	private vm: NodeVM

	constructor(public runEnv: RuntimeEnvironment, public script: ITestScript, lazyEval = false) {
		if (!lazyEval) {
			this.evaluate()
		}
	}

	// TestScriptErrorMapper implementation
	public static async mustCompileFile(
		path: string,
		runEnv: RuntimeEnvironment,
	): Promise<EvaluatedScript> {
		if (!(await exists(path))) {
			throw new Error(`unable to compile script: no script found at path ${path}`)
		}

		return new EvaluatedScript(runEnv, await mustCompileFile(path))
	}

	public isScriptError(error: Error): boolean {
		return this.script.isScriptError?.apply(this, error) ?? false
	}
	public maybeLiftError(error: Error): Error {
		return this.script?.maybeLiftError?.apply(this, error) ?? false
	}
	public liftError(error: Error): TestScriptError {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.script.liftError!(error)
	}
	public filterAndUnmapStack(stack: string | Error | undefined): string[] {
		return this.script?.filterAndUnmapStack?.apply(this, stack)
	}

	public bindTest(test: Test): void {
		if (this.vm === undefined)
			throw new Error('bindTest: no vm created - script must be evaluated first')

		const { reporter } = test

		// hack because the vm2 typings don't include their EventEmitteryness
		const eevm = (this.vm as any) as EventEmitter
		;['log', 'info', 'error', 'dir', 'trace'].forEach(key =>
			eevm.on(`console.${key}`, (message, ...args) =>
				reporter.testScriptConsole(key, message, ...args),
			),
		)
	}

	public async beforeTestRun(): Promise<void> {
		await this.testData.load()
	}

	private _testDataLoaders: TestDataFactory | undefined
	public get testDataLoaders(): TestDataFactory {
		if (this._testDataLoaders === undefined) {
			this._testDataLoaders = new BoundTestDataLoaders(this, this.runEnv.workRoot)
			this._testDataLoaders.fromData([{}])
		}

		return this._testDataLoaders
	}

	private _testData: TestDataSource<any>
	public set testData(testDataSource: TestDataSource<any>) {
		this._testData = testDataSource
		this._testData.setInstanceID(this.sequence.toString())
	}

	public get testData(): TestDataSource<any> {
		return this._testData
	}

	public get sequence(): number {
		return this.runEnv.stepEnv().SEQUENCE
	}

	public evaluate(): EvaluatedScript {
		debug('evaluating')

		// Clear existing steps
		const steps: Step[] = []

		// establish base settings
		let rawSettings = DEFAULT_SETTINGS

		const ENV = this.runEnv.stepEnv()

		// closes over steps: Step[]
		function captureStep(args: any[]) {
			// name: string, fn: (driver: Browser) => Promise<void>
			let name: string
			let fn: TestFn
			let options: StepOptions = {}

			if (args.length === 3) {
				;[name, options, fn] = args
				options = normalizeStepOptions(options)
			} else {
				;[name, fn] = args
			}

			console.assert(typeof name === 'string', 'Step name must be a string')
			if (steps.find(({ name: stepName }) => name === stepName)) {
				console.warn(`Duplicate step name: ${name}, skipping step`)
				return
			}

			steps.push({ fn, name, options })
		}

		// re-scope this for captureSuite to close over:
		const evalScope = this as EvaluatedScript

		type WithDataCallback = (this: null, s: StepDefinition) => void

		// closes over evalScope (this) and ENV
		const captureSuite: SuiteDefinition = Object.assign(
			(
				callback: (this: null, s: StepDefinition) => void,
			): ((this: null, s: StepDefinition) => void) => {
				return callback
			},
			{
				withData: <T>(data: TestDataSource<T>, callback: WithDataCallback) => {
					evalScope.testData = expect(data, 'TestData is not present')
					return callback
				},
			},
		)

		const stepNomal = (name: string, ...optionsOrFn: any[]) => {
			const [option, fn] = extractOptionsAndCallback(optionsOrFn)
			captureStep([name, option, fn])
		}

		const stepOnce = (name: string, ...optionsOrFn: any[]) => {
			const [option, fn] = extractOptionsAndCallback(optionsOrFn)
			captureStep([name, { ...option, once: true }, fn])
		}

		const step = (() => {
			const step: any = stepNomal
			const once = stepOnce
			step.once = once
			return step
		})()

		const context = {
			setup: (setupSettings: TestSettings) => {
				Object.assign(rawSettings, setupSettings)
			},

			ENV,

			// Supports either 2 or 3 args
			step,

			// Actual implementation of @flood/chrome
			By,
			Until,
			Device,
			MouseButtons,
			TestData: this.testDataLoaders,
			Key,
			userAgents,
			suite: captureSuite,
		}

		this.vm = createVirtualMachine(context, this.script.scriptRoot)

		// manually extract test name and desc from the script
		rawSettings.name = this.script.testName
		rawSettings.description = this.script.testDescription

		const result = this.vm.run(this.script.vmScript)
		debug('eval %O', result)

		// get settings exported from the script
		const scriptSettings = result.settings
		if (scriptSettings) {
			rawSettings = { ...rawSettings, ...scriptSettings }
		}

		const testFn = expect(result.default, 'Test script must export a default function')

		/**
		 * Evaluate default function
		 */
		testFn.apply(null, [])

		// layer up the final settings
		this.settings = {
			...DEFAULT_SETTINGS,
			...normalizeSettings(rawSettings),
		}

		this.steps = steps

		debug('settings', this.settings)
		debug('steps', this.steps)

		return this
	}
}
