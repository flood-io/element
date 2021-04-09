import { step, By, Key, Until, TestSettings, TestData, ENV, Browser } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	loopCount: ENV.FLOOD_LOAD_TEST ? -1 : 1,
	clearCache: false,
	clearCookies: false,
	screenshotOnFailure: true,
	actionDelay: '3s',
	stepDelay: '3s',
}

interface Row {
	query: string
	href: string
	count: number
}

TestData.fromCSV('googling-test-data.pass/googling-test-data.csv').shuffle()

export default async () => {
	step('Google Search', async (browser: Browser, row: Row) => {
		assert.ok(row.query, 'row.query is set')
		row.query = String(row.query)
		assert.ok(row.href, 'row.href is set')
		assert.notEqual(row.count, undefined, 'row.count is set')

		console.log('data: ', JSON.stringify(row), 'count', row.count)

		console.log('visiting')
		await browser.visit('http://www.google.com/ncr')

		console.log('finding elt')
		const searchInput = await browser.findElement(By.nameAttr('q'))

		console.log('highlighting')
		await browser.highlightElement(searchInput)
		await browser.takeScreenshot()

		console.log('typing')
		await searchInput.sendKeys(row.query, Key.RETURN)

		await browser.wait(Until.titleIs(`${row.query} - Google Search`))
		await browser.takeScreenshot()
	})

	step('click first result', async (browser: Browser, data: any) => {
		const firstResultLink = await browser.findElement(By.attr('a', 'href', data.href))
		await firstResultLink.click()
		await browser.waitForNavigation()
		await browser.takeScreenshot()
	})
}
