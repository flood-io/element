import { EvaluatedScript } from './EvaluatedScript'
import { mustCompileFile } from '../TestScript'
import { ITestScript } from '../ITestScript'
import { join } from 'path'
import testRunEnv from '../../tests/support/test-run-env'
import { DEFAULT_SETTINGS, normalizeSettings } from './Settings'

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
			const defaultSettings: any = normalizeSettings(DEFAULT_SETTINGS)

			expect(settings.name).toBe('Empty test for evaluating defaults')
			expect(settings.description).toBe('Use this in the test environment.')
			expect(settings.duration).toBe(defaultSettings.duration)
			expect(settings.loopCount).toBe(defaultSettings.loopCount)
			expect(settings.actionDelay).toBe(defaultSettings.actionDelay)
			expect(settings.stepDelay).toBe(defaultSettings.stepDelay)
			expect(settings.screenshotOnFailure).toBe(defaultSettings.screenshotOnFailure)
			expect(settings.clearCookies).toBe(defaultSettings.clearCookies)
			expect(settings.waitTimeout).toBe(defaultSettings.waitTimeout)
			expect(settings.responseTimeMeasurement).toBe(defaultSettings.responseTimeMeasurement)
			expect(settings.userAgent).toBe(defaultSettings.userAgent)
			expect(settings.device).toBe(defaultSettings.device)
			expect(settings.ignoreHTTPSErrors).toBe(defaultSettings.ignoreHTTPSErrors)
		})

		test('captures test settings', async () => {
			const { settings, steps } = new EvaluatedScript(runEnv, ensureDefined(vmFeaturesTestScript))

			expect(settings.name).toBe('Test Script for evaluating VM features')
			expect(settings.description).toBe('Use this in the test environment.')
			expect(settings.duration).toBe(30e3)
			expect(settings.waitTimeout).toBe(5000)
			expect(settings.userAgent).toBe('I AM ROBOT')
			expect(settings.ignoreHTTPSErrors).toBe(false)

			expect(steps.map(step => step.name)).toEqual(['Step 1', 'Step 2', 'Step 3'])
		})

		test('allows overriding settings per step', async () => {
			const { settings, steps } = new EvaluatedScript(runEnv, vmFeaturesTestScript)

			expect(settings.waitTimeout).toBe(5000)
			expect(steps[0].options).toEqual({ waitTimeout: 60000 })
		}, 30e3)

		test('returns steps', async () => {
			const script = new EvaluatedScript(runEnv, ensureDefined(vmFeaturesTestScript))
			const { steps } = script

			expect(steps.length).toBe(3)
		})

		// TODO test bindTest
	})
})
