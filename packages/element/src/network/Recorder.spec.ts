import { expect } from 'chai'
import 'mocha'
import { DogfoodServer } from '../../tests/support/fixture-server'
// import Reporter from '../Reporter'
import Reporter from '../../tests/support/test-reporter'
import NetworkRecorder from './Recorder'
import Observer from '../runtime/Observer'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'

let dogfoodServer: DogfoodServer = new DogfoodServer()
let puppeteer: testPuppeteer
describe('Recorder', function() {
	this.timeout(30e3)

	beforeEach(async () => {
		puppeteer = await launchPuppeteer()
	})

	afterEach(async () => {
		await puppeteer.close()
	})

	before(async () => {
		await dogfoodServer.start()
	})

	after(async () => {
		await dogfoodServer.close()
	})

	describe('Recorder', () => {
		let recorder: NetworkRecorder

		beforeEach(async () => {
			const reporter = new Reporter()
			recorder = new NetworkRecorder(puppeteer.page)
			let observer = new Observer(reporter, recorder)
			await observer.attachToNetworkRecorder()
			await puppeteer.page.goto('http://localhost:1337/wait.html')
			await recorder.pendingTaskQueue.chain
		})

		it('Captures correct document response code', async () => {
			expect(recorder.entries.length).to.equal(1)
			expect(recorder.documentResponseCode).to.equal(200)
			recorder.reset()
			await puppeteer.page.goto('http://localhost:1337/notfound.html')
			await recorder.pendingTaskQueue.chain
			expect(recorder.documentResponseCode).to.equal(404)
		})

		it('Captures document response time', async () => {
			// NOTE this is non-deterministic & may need to be adjusted (LC)
			expect(recorder.responseTimeForType('Document')).to.be.within(1, 200)
		})

		it('Records network throughput', async () => {
			expect(recorder.networkThroughput()).to.be.greaterThan(0)
		})

		it('Resets everything between tests', async () => {
			// NOTE this is non-deterministic & may need to be adjusted (LC)
			expect(recorder.responseTimeForType('Document')).to.be.within(1, 200)
			expect(recorder.networkThroughput()).to.be.greaterThan(0)
			expect(recorder.documentResponseCode).to.equal(200)
			recorder.reset()
			expect(recorder.responseTimeForType('Document')).to.equal(0)
			expect(recorder.networkThroughput()).to.be.equal(0)
			expect(recorder.documentResponseCode).to.equal(0)
		})

		it('records request headers for document', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.request.headers.map(({ name }) => name).sort()).to.include.members([
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
			expect(document.request.timestamp).to.be.within(now - 1000, now + 1000)
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
