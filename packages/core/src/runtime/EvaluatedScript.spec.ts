import { EvaluatedScript } from './EvaluatedScript'
import { mustCompileFile } from '../TestScript'
import { ITestScript } from '../interface/ITestScript'
import { join } from 'path'
import testRunEnv from '../../tests/support/test-run-env'

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
	})

	describe('evaluate', () => {
		test('captures test settings', async () => {
			const { settings, steps } = new EvaluatedScript(runEnv, ensureDefined(vmFeaturesTestScript))

			expect(settings.name).toBe('Test Script for evaluating VM features')
			expect(settings.description).toBe('Use this in the test environment.')
			expect(settings.duration).toBe('30s')
			expect(settings.userAgent).toBe('I AM ROBOT')

			expect(steps.map(step => step.name)).toEqual(['Step 1', 'Step 2', 'Step 3'])
		})

		test('allows overriding settings per step', async () => {
			const { steps } = new EvaluatedScript(runEnv, vmFeaturesTestScript)

			expect(steps[0].options).toEqual({ waitTimeout: 60000 })

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
})
