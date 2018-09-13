import { expect } from 'chai'
import 'mocha'
import { VM } from './VM'
import { ITestScript, mustCompileFile } from '../TestScript'
import { join } from 'path'
import testRunEnv from '../../tests/support/test-run-env'
import Test from './Test'
import { NullReporter } from '../reporter/Null'
import { NullPuppeteerClient } from '../driver/Puppeteer'
import { DEFAULT_SETTINGS } from './Settings'

let vmFeaturesTestScript: ITestScript
let noSettingsTestScript: ITestScript

const runEnv = testRunEnv()
const test = new Test(new NullPuppeteerClient(), runEnv, new NullReporter())

function ensureDefined<T>(value: T | undefined | null): T | never {
	if (value === undefined || value === null) {
		throw new Error('value was not defined')
	} else {
		return value
	}
}

describe('VM', () => {
	before(async function() {
		this.timeout(30e3)
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
		it('returns default test settings', async () => {
			let vm = new VM(runEnv, ensureDefined(noSettingsTestScript))
			let { settings } = vm.evaluate(test)

			expect(settings.name).to.equal('Empty test for evaluating defaults')
			expect(settings.description).to.equal('Use this in the test environment.')
			expect(settings.duration).to.equal(DEFAULT_SETTINGS.duration)
			expect(settings.loopCount).to.equal(DEFAULT_SETTINGS.loopCount)
			expect(settings.actionDelay).to.equal(DEFAULT_SETTINGS.actionDelay)
			expect(settings.stepDelay).to.equal(DEFAULT_SETTINGS.stepDelay)
			expect(settings.screenshotOnFailure).to.equal(DEFAULT_SETTINGS.screenshotOnFailure)
			expect(settings.clearCookies).to.equal(DEFAULT_SETTINGS.clearCookies)
			expect(settings.waitTimeout).to.equal(DEFAULT_SETTINGS.waitTimeout)
			expect(settings.responseTimeMeasurement).to.equal(DEFAULT_SETTINGS.responseTimeMeasurement)
			expect(settings.userAgent).to.equal(DEFAULT_SETTINGS.userAgent)

			expect(settings.device).to.equal(DEFAULT_SETTINGS.device)
			expect(settings.ignoreHTTPSErrors).to.equal(DEFAULT_SETTINGS.ignoreHTTPSErrors)
		})

		it('captures test settings', async () => {
			let vm = new VM(runEnv, ensureDefined(vmFeaturesTestScript))
			let { settings, steps } = vm.evaluate(test)

			expect(settings.name).to.equal('Test Script for evaluating VM features')
			expect(settings.description).to.equal('Use this in the test environment.')
			expect(settings.duration).to.equal(30e3)
			expect(settings.waitTimeout).to.equal(5)
			expect(settings.userAgent).to.equal('I AM ROBOT')
			expect(settings.ignoreHTTPSErrors).to.equal(false)

			expect(steps.map(step => step.name)).to.deep.equal(['Step 1', 'Step 2', 'Step 3'])
		})

		it('allows overriding settings per step', async () => {
			let vm = new VM(runEnv, vmFeaturesTestScript)
			let { settings, steps } = vm.evaluate(test)

			expect(settings.waitTimeout).to.equal(5)
			expect(steps[0].stepOptions).to.deep.equal({ waitTimeout: 60 })

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
		}).timeout(30e3)
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
