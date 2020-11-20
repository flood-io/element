import Interceptor from './Interceptor'
import { serve } from '../../tests/support/fixture-server'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import { Response, Page } from 'puppeteer'
import { URL } from 'url'

type InterceptedResponse = [Error[], Response | null]

let url = ''

const testIntercept = async (page: Page, domains: string[]): Promise<InterceptedResponse> => {
	const intercept = new Interceptor(domains)
	await intercept.attach(page)

	const errors: any[] = []
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
	let puppeteer: testPuppeteer

	jest.setTimeout(30e3)
	beforeAll(async () => {
		url = await serve('wait.html')
		puppeteer = await launchPuppeteer()
	})

	afterAll(async () => {
		await puppeteer.close()
	})

	test('accepts requests without any blocking', async () => {
		const { page } = puppeteer

		const [errors, response] = await testIntercept(page, ['*.google.com'])
		expect(response.ok()).toBeTruthy()
		expect(errors).toHaveLength(0)
	})

	test('blocks star matches against domains', async () => {
		const { page } = puppeteer

		const [errors, response] = await testIntercept(page, ['*host'])
		expect(response).toBeNull()
		expect(errors).toHaveLength(1)
		expect(errors[0].message).toMatch(/net::ERR_FAILED at http\:\/\/(.+)\/wait.html/)
	})

	test('blocks requests on specific ports', async () => {
		const { page } = puppeteer

		const uri = new URL(url)

		const [errors, response] = await testIntercept(page, [`*:${uri.port}`])
		expect(response).toBeNull()
		expect(errors).toHaveLength(1)
		expect(errors[0].message).toMatch(/net::ERR_FAILED at http\:\/\/(.+)\/wait\.html/)
	})
})
