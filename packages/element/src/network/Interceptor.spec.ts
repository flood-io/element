import Interceptor from './Interceptor'
import { serve } from '../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Response, Page } from 'puppeteer'
import { URL } from 'url'

type InterceptedResponse = [Error[], Response | null]

let url: string = ''

const testIntercept = async (page: Page, domains: string[]): Promise<InterceptedResponse> => {
	let intercept = new Interceptor(domains)
	await intercept.attach(page)

	let errors = []
	let response = null

	try {
		response = await page.goto(url)
	} catch (err) {
		errors.push(err)
	}

	await intercept.detach(page)

	return [errors, response]
}

describe('Network/Interceptor', () => {
	jest.setTimeout(30e3)
	beforeAll(async () => {
		url = await serve('wait.html')
		puppeteer = await launchPuppeteer()
	})

	let puppeteer: testPuppeteer

	afterAll(async () => {
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
		expect(errors[0].message).toMatch(/net::ERR_FAILED at http\:\/\/(.+)\/wait.html/)
	})

	test('blocks requests on specific ports', async () => {
		let { page } = puppeteer

		let uri = new URL(url)

		let [errors, response] = await testIntercept(page, [`*:${uri.port}`])
		expect(response).toBeNull()
		expect(errors).toHaveLength(1)
		expect(errors[0].message).toMatch(/net::ERR_FAILED at http\:\/\/(.+)\/wait\.html/)
	})
})
