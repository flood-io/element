import Interceptor from './Interceptor'
import { DogfoodServer } from '../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Response, Page } from 'puppeteer'

type InterceptedResponse = [Error[], Response | null]

const testIntercept = async (page: Page, domains: string[]): Promise<InterceptedResponse> => {
	let intercept = new Interceptor(domains)
	await intercept.attach(page)

	let errors = []
	let response = null

	try {
		response = await page.goto('http://localhost:1337/wait.html')
	} catch (err) {
		errors.push(err)
	}

	await intercept.detach(page)

	return [errors, response]
}

describe('Network/Interceptor', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		await dogfoodServer.start()
		puppeteer = await launchPuppeteer()
	})

	let dogfoodServer = new DogfoodServer()
	let puppeteer: testPuppeteer

	afterAll(async () => {
		await dogfoodServer.close()
		await puppeteer.close()
	})

	test('accepts requests without any blocking', async () => {
		let { page } = puppeteer

		let [errors, response] = await testIntercept(page, ['*.google.com'])
		expect(response!.ok()).toBeTruthy()
		expect(errors).toHaveLength(0)
	})

	test('blocks star matches against domains', async () => {
		let { page } = puppeteer

		let [errors, response] = await testIntercept(page, ['*host'])
		expect(response).toBeNull()
		expect(errors).toHaveLength(1)
		expect(errors[0].message).toBe('net::ERR_FAILED at http://localhost:1337/wait.html')
	})

	test('blocks requests on specific ports', async () => {
		let { page } = puppeteer

		let [errors, response] = await testIntercept(page, ['*:1337'])
		expect(response).toBeNull()
		expect(errors).toHaveLength(1)
		expect(errors[0].message).toBe('net::ERR_FAILED at http://localhost:1337/wait.html')
	})
})
