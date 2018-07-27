import * as Sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { expect, use } from 'chai'
import 'mocha'
import { VM, CallbackQueue } from './VM'
import { ITestScript, mustCompileFile } from '../TestScript'
import { join } from 'path'
import { DogfoodServer } from '../../tests/support/fixture-server'
import testRunEnv from '../../tests/support/test-run-env'
import PuppeteerDriver from '../driver/Puppeteer'
import { PuppeteerClient } from '../types'

let dogfoodServer = new DogfoodServer()
let vmFeaturesScript: ITestScript
let dogfoodWaitTest: ITestScript
let testWithoutSettings: ITestScript
const runEnv = testRunEnv()

use(sinonChai)

let driver: PuppeteerDriver, puppeteer: PuppeteerClient
describe('VM', () => {
	before(async function() {
		this.timeout(30e3)
		vmFeaturesScript = await mustCompileFile(join(__dirname, '../../tests/fixtures/vm-features.ts'))
		testWithoutSettings = await mustCompileFile(
			join(__dirname, '../../tests/fixtures/test-without-settings.ts'),
		)
		dogfoodWaitTest = await mustCompileFile(
			join(__dirname, '../../tests/fixtures/dogfood-test-wait.ts'),
		)
		await dogfoodServer.start()
		driver = new PuppeteerDriver()
		await driver.launch()
		puppeteer = await driver.client()
	})

	after(async () => {
		await dogfoodServer.close()
		await driver.close()
	})

	describe('evaluate', () => {
		it('returns default test settings', async () => {
			let vm = new VM(runEnv, testWithoutSettings)
			let settings = vm.evaluate()
			await vm.loadTestData()

			expect(settings.name).to.equal('Empty test for evaluating defaults')
			expect(settings.description).to.equal('Use this in the test environment.')
			expect(settings.duration).to.equal(-1)
			expect(settings.loopCount).to.equal(Infinity)
			expect(settings.actionDelay).to.equal(2)
			expect(settings.stepDelay).to.equal(6)
			expect(settings.screenshotOnFailure).to.equal(true)
			expect(settings.clearCookies).to.equal(true)
			expect(settings.waitTimeout).to.equal(30)
			expect(settings.responseTimeMeasurement).to.equal('step')
			expect(settings.userAgent).to.equal(
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
			)

			expect(settings.device).to.equal('Chrome Desktop Large')
			expect(settings.ignoreHTTPSErrors).to.equal(false)
		})

		it('captures test settings', async () => {
			let vm = new VM(runEnv, vmFeaturesScript)
			let settings = vm.evaluate()

			expect(settings.name).to.equal('Test Script for evaluating VM features')
			expect(settings.description).to.equal('Use this in the test environment.')
			expect(settings.duration).to.equal(30e3)
			expect(settings.waitTimeout).to.equal(5)
			expect(settings.userAgent).to.equal('I AM ROBOT')
			expect(settings.ignoreHTTPSErrors).to.equal(false)

			expect(vm.steps.map(step => step.name)).to.deep.equal(['Step 1', 'Step 2', 'Step 3'])
		})

		it('allows overriding settings per step', async () => {
			let vm = new VM(runEnv, vmFeaturesScript)
			let settings = vm.evaluate()
			await vm.loadTestData()
			expect(settings.waitTimeout).to.equal(5)
			expect(vm.steps[0].settings).to.deep.equal({ waitTimeout: 60 })

			let actionSpy = Sinon.spy()
			vm.on(CallbackQueue.BeforeStep, (name, settings) => {
				if (name === 'Step 1') {
					actionSpy(settings['waitTimeout'])
				}
			})

			await vm.execute(puppeteer)
			expect(actionSpy).to.have.been.calledOnce
			expect(actionSpy).to.have.been.calledWith(60)
		}).timeout(30e3)
	})

	describe('execute', () => {
		it('runs all steps', async () => {
			let vm = new VM(runEnv, dogfoodWaitTest)
			vm.evaluate()
			await vm.loadTestData()
			expect(vm.steps.map(step => step.name)).to.deep.equal(['Dogfood Test Step'])

			let actionSpy = Sinon.spy()
			vm.on(CallbackQueue.AfterAction, name => {
				actionSpy(name)
			})

			await vm.execute(puppeteer)

			expect(actionSpy).to.have.been.calledWith('visit')
			expect(actionSpy).to.have.been.calledWith('wait')
		})
	})
})
