import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
import PuppeteerDriver from '../driver/Puppeteer'
import { mustCompileFile } from '../TestScript'
import Test from '../runtime/Test'
import { join } from 'path'
// import Reporter from '../Reporter'
import Reporter from '../../tests/support/test-reporter'
import testRunEnv from '../../tests/support/test-run-env'
import { Page } from 'puppeteer'
import { PuppeteerClient } from '../types'
import NetworkRecorder from './Recorder'
import Observer from '../runtime/Observer'

let dogfoodServer: DogfoodServer = new DogfoodServer()
let driver: PuppeteerDriver, puppeteer: PuppeteerClient, page: Page
describe('Recorder', function() {
	this.timeout(30e3)

	beforeEach(async () => {
		driver = new PuppeteerDriver()
		await driver.launch()
		puppeteer = await driver.client()
		page = puppeteer.page
	})

	afterEach(async () => {
		await driver.close()
	})

	before(async () => {
		await dogfoodServer.start()
	})

	after(async () => {
		await dogfoodServer.close()
	})

	it('records network entries', async () => {
		const reporter = new Reporter()
		const runEnv = testRunEnv()

		let test = new Test(runEnv, reporter)
		let script = await mustCompileFile(join(__dirname, '../../tests/fixtures/dogfood-test-wait.ts'))
		test.enqueueScript(script)
		test.prepare()
		test.attachDriver(puppeteer)

		await test.before()
		await test.run()

		let responseTimeMeasurements = reporter.measurements.filter(
			({ measurement }) => measurement === 'response_time',
		)
		let responseTime = responseTimeMeasurements
			.map(m => Number(m.value))
			.reduce((sum, n) => sum + n, 0)
		expect(responseTime).to.be.greaterThan(1)

		// Network recorder should now be reset
		expect(test.networkRecorder.entries.length).to.equal(0)
	}).timeout(30e3)

	describe('Recorder', () => {
		let recorder: NetworkRecorder

		beforeEach(async () => {
			recorder = new NetworkRecorder(page)
			let observer = new Observer(recorder)
			await observer.attach()
			await page.goto('http://localhost:1337/wait.html')
			await recorder.pendingTaskQueue.chain
		})

		it('Captures correct document response code', async () => {
			expect(recorder.entries.length).to.equal(1)
			expect(recorder.documentResponseCode).to.equal(200)
			recorder.reset()
			await page.goto('http://localhost:1337/notfound.html')
			await recorder.pendingTaskQueue.chain
			expect(recorder.documentResponseCode).to.equal(404)
		})

		it('Captures document response time', async () => {
			// NOTE this is non-deterministic & may need to be adjusted (LC)
			expect(recorder.responseTimeForType('Document')).to.be.within(1, 100)
		})

		it('Records network throughput', async () => {
			expect(recorder.networkThroughput()).to.be.greaterThan(0)
		})

		it('Resets everything between tests', async () => {
			// NOTE this is non-deterministic & may need to be adjusted (LC)
			expect(recorder.responseTimeForType('Document')).to.be.within(1, 100)
			expect(recorder.networkThroughput()).to.be.greaterThan(0)
			expect(recorder.documentResponseCode).to.equal(200)
			recorder.reset()
			expect(recorder.responseTimeForType('Document')).to.equal(0)
			expect(recorder.networkThroughput()).to.be.equal(0)
			expect(recorder.documentResponseCode).to.equal(0)
		})

		it('records request headers for document', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.request.headers.map(({ name }) => name).sort()).to.deep.equal([
				'Accept',
				'Accept-Encoding',
				'Connection',
				'Host',
				'Upgrade-Insecure-Requests',
				'User-Agent',
			])
		})

		it('records response headers for document', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.response.headers.map(({ name }) => name).sort()).to.deep.equal([
				'Accept-Ranges',
				'Cache-Control',
				'Connection',
				'Content-Length',
				'Content-Type',
				'Date',
				'ETag',
				'Last-Modified',
				'X-Powered-By',
			])
		})

		it('records document time', async () => {
			expect(recorder.timeToFirstByteForType('Document')).to.greaterThan(0)
			let [document] = recorder.entriesForType('Document')

			let now = new Date().valueOf()
			expect(document.request.timestamp).to.be.within(now - 100, now)
			expect(document.response.timestamp).to.be.greaterThan(document.request.timestamp)
		})

		it('records document request url', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.request.url).to.equal('http://localhost:1337/wait.html')
		})

		it.skip('records response body', async () => {
			// This is pending because we've disabled response body capture
			let [document] = recorder.entriesForType('Document')
			expect(document.response.content.text).to.contains('<html>')
		})
	})
})
