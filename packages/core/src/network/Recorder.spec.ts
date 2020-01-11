import { serve } from '../../tests/support/fixture-server'
import Reporter from '../../tests/support/test-reporter'
import NetworkRecorder from './Recorder'
import Observer from '../runtime/Observer'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'

let puppeteer: testPuppeteer
describe('Recorder', () => {
	jest.setTimeout(30e3)

	beforeEach(async () => {
		puppeteer = await launchPuppeteer()
	})

	afterEach(async () => {
		await puppeteer.close()
	})

	describe('Recorder', () => {
		let recorder: NetworkRecorder

		beforeEach(async () => {
			const reporter = new Reporter()
			recorder = new NetworkRecorder(puppeteer.page)
			let observer = new Observer(reporter, recorder)
			await observer.attachToNetworkRecorder()
			let url = await serve('wait.html')
			await puppeteer.page.goto(url)
			await recorder.pendingTaskQueue.chain
		})

		test('Captures correct document response code', async () => {
			expect(recorder.entries.length).toBe(1)
			expect(recorder.documentResponseCode).toBe(200)
			recorder.reset()
			let url = await serve('notfound.html')
			await puppeteer.page.goto(url)
			await recorder.pendingTaskQueue.chain
			expect(recorder.documentResponseCode).toBe(404)
		})

		test('Captures document response time', async () => {
			expect(recorder.responseTimeForType('Document')).toBeGreaterThanOrEqual(1)
			// NOTE this is non-deterministic & may need to be adjusted (LC)
			expect(recorder.responseTimeForType('Document')).toBeLessThanOrEqual(200)
		})

		test('Records network throughput', async () => {
			expect(recorder.networkThroughput()).toBeGreaterThan(0)
		})

		test('Resets everything between tests', async () => {
			expect(recorder.responseTimeForType('Document')).toBeGreaterThanOrEqual(1)
			// NOTE this is non-deterministic & may need to be adjusted (LC)
			expect(recorder.responseTimeForType('Document')).toBeLessThanOrEqual(200)
			expect(recorder.networkThroughput()).toBeGreaterThan(0)
			expect(recorder.documentResponseCode).toBe(200)
			recorder.reset()
			expect(recorder.responseTimeForType('Document')).toBe(0)
			expect(recorder.networkThroughput()).toBe(0)
			expect(recorder.documentResponseCode).toBe(0)
		})

		test('records request headers for document', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.request.headers.map(({ name }) => name).sort()).toEqual(
				expect.arrayContaining([
					'Accept',
					'Accept-Encoding',
					'Connection',
					'Host',
					'Upgrade-Insecure-Requests',
					'User-Agent',
				]),
			)
		})

		test('records response headers for document', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.response.headers.map(({ name }) => name).sort()).toEqual([
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

		test('records document time', async () => {
			expect(recorder.timeToFirstByteForType('Document')).toBeGreaterThan(0)
			let [document] = recorder.entriesForType('Document')

			let now = new Date().valueOf()
			expect(document.request.timestamp).toBeGreaterThanOrEqual(now - 1000)
			expect(document.request.timestamp).toBeLessThanOrEqual(now + 1000)
			expect(document.response.timestamp).toBeGreaterThan(document.request.timestamp)
		})

		test('records document request url', async () => {
			let [document] = recorder.entriesForType('Document')
			expect(document.request.url).toMatch(/http\:\/\/(.+)\/wait\.html/)
		})

		test.skip('records response body', async () => {
			// This is pending because we've disabled response body capture
			let [document] = recorder.entriesForType('Document')
			expect(document.response.content.text).toEqual(expect.arrayContaining(['<html>']))
		})
	})
})
