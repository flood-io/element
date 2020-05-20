import { EvaluatedScript } from './EvaluatedScript'
import { mustCompileFile } from '../TestScript'
import { ITestScript } from '../ITestScript'
import { join } from 'path'
import testRunEnv from '../../tests/support/test-run-env'
import { DEFAULT_SETTINGS } from './Settings'

let vmFeaturesTestScript: ITestScript
let noSettingsTestScript: ITestScript

const runEnv = testRunEnv()

function ensureDefined<T>(value: T | undefined | null): T | never {
	if (value === undefined || value === null) {
		throw new Error('value was not defined')
	} else {
		return value
	}
}

describe('EvaluatedScript', () => {
	beforeAll(async () => {
		jest.setTimeout(30e3)
		vmFeaturesTestScript = await mustCompileFile(
			join(__dirname, '../../tests/fixtures/vm-features.ts'),
		)
		noSettingsTestScript = await mustCompileFile(
			join(__dirname, '../../tests/fixtures/test-without-settings.ts'),
		)
		// dogfoodWaitTestScript = await mustCompileFile(
		// join(__dirname, '../../tests/fixtures/dogfood-test-wait.ts'),
		// )
	})

	describe('evaluate', () => {
		test('returns default test settings', async () => {
			const script = new EvaluatedScript(runEnv, ensureDefined(noSettingsTestScript))
			const { settings } = script

			expect(settings.name).toBe('Empty test for evaluating defaults')
			expect(settings.description).toBe('Use this in the test environment.')
			expect(settings.duration).toBe(DEFAULT_SETTINGS.duration)
			expect(settings.loopCount).toBe(DEFAULT_SETTINGS.loopCount)
			expect(settings.actionDelay).toBe(DEFAULT_SETTINGS.actionDelay)
			expect(settings.stepDelay).toBe(DEFAULT_SETTINGS.stepDelay)
			expect(settings.screenshotOnFailure).toBe(DEFAULT_SETTINGS.screenshotOnFailure)
			expect(settings.clearCookies).toBe(DEFAULT_SETTINGS.clearCookies)
			expect(settings.waitTimeout).toBe(DEFAULT_SETTINGS.waitTimeout)
			expect(settings.responseTimeMeasurement).toBe(DEFAULT_SETTINGS.responseTimeMeasurement)
			expect(settings.userAgent).toBe(DEFAULT_SETTINGS.userAgent)

			expect(settings.device).toBe(DEFAULT_SETTINGS.device)
			expect(settings.ignoreHTTPSErrors).toBe(DEFAULT_SETTINGS.ignoreHTTPSErrors)
		})

		test('captures test settings', async () => {
			const { settings, steps } = new EvaluatedScript(runEnv, ensureDefined(vmFeaturesTestScript))

			expect(settings.name).toBe('Test Script for evaluating VM features')
			expect(settings.description).toBe('Use this in the test environment.')
			expect(settings.duration).toBe(30e3)
			expect(settings.waitTimeout).toBe(5)
			expect(settings.userAgent).toBe('I AM ROBOT')
			expect(settings.ignoreHTTPSErrors).toBe(false)

			expect(steps.map(step => step.name)).toEqual(['Step 1', 'Step 2', 'Step 3'])
		})

		test('allows overriding settings per step', async () => {
			const { settings, steps } = new EvaluatedScript(runEnv, vmFeaturesTestScript)

			expect(settings.waitTimeout).toBe(5)
			expect(steps[0].options).toEqual({ waitTimeout: 60 })

			// TODO move to Test.spec ?
			// let actionSpy = Sinon.spy()
			// vm.on(CallbackQueue.BeforeStep, (name, settings) => {
			// if (name === 'Step 1') {
			// actionSpy(settings['waitTimeout'])
			// }
			// })

			// await vm.execute(puppeteer)
			// expect(actionSpy).to.have.been.calledOnce
			// expect(actionSpy).to.have.been.calledWith(60)
		}, 30e3)

		test('returns steps', async () => {
			const script = new EvaluatedScript(runEnv, ensureDefined(vmFeaturesTestScript))
			const { steps } = script

			expect(steps.length).toBe(3)
		})

		// TODO test bindTest
	})

	// TODO move to Test.spec ?
	// describe('execute', () => {
	// it('runs all steps', async () => {
	// let vm = new VM(runEnv, dogfoodWaitTest)
	// vm.evaluate()
	// expect(vm.steps.map(step => step.name)).to.deep.equal(['Dogfood Test Step'])

	// let actionSpy = Sinon.spy()
	// vm.on(CallbackQueue.AfterAction, name => {
	// actionSpy(name)
	// })

	// await vm.execute(puppeteer)

	// expect(actionSpy).to.have.been.calledWith('visit')
	// expect(actionSpy).to.have.been.calledWith('wait')
	// })
	// })
})
