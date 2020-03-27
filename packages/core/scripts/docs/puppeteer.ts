import { join } from 'path'

export function parsePuppeteer(): any {
	const puppeteerPath = join(__dirname, '../..', 'puppeteer-1.6-docs.json')

	try {
		const puppeteerDoc = require(puppeteerPath)
		const puppeteerTypes = puppeteerDoc.children.find(
			({ name }: any) => name === '"@types/puppeteer/index.d"',
		).children

		// puppeteerTypes.forEach(t => debug('puppeteer.%s', t.name))

		return puppeteerTypes
	} catch (e) {
		console.error('unable to load puppeteer doc json', e)
		return {}
	}
}
