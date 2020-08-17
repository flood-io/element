import { ElementHandle } from 'puppeteer'
import { step, Until, By, TestSettings } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	clearCache: false,
	disableCache: false,
	clearCookies: false,
	loopCount: 1,
	duration: 1,
	actionDelay: 2,
	stepDelay: 2,
	waitTimeout: 60,
	screenshotOnFailure: true,
}

const URL = 'https://the-internet.herokuapp.com'

export default () => {
	step('Test: Go to the Data Tables page', async browser => {
		await browser.visit(`${URL}/tables`)
		// Until.titleIs example
		await browser.wait(Until.titleIs('The Internet'))
	})

	step('Test: findElements example', async browser => {
		// findElements example
		const tables = await browser.findElements(By.css('.tablesorter'))
		const table1Id = await tables[0].getProperty('id')
		const table2Id = await tables[1].getProperty('id')
		assert(table1Id === 'table1', 'The id of table 1 must be correct')
		assert(table2Id === 'table2', 'The id of table 2 must be correct')
	})

	step('Test: Do some sort action with tablesorter', async browser => {
		const table1El = await browser.findElement(By.css('#table1'))
		const headers = await table1El.findElements(By.css('.header'))

		const rows = await table1El.findElements(By.css('tbody tr'))
		const cellsOfFirstRow = await rows[0].findElements(By.tagName('td'))
		const lastName = await cellsOfFirstRow[0].text()
		const firstActionEdit = await rows[0].findElement(By.partialLinkText('edit'))
		const firstActionDelete = await rows[0].findElement(By.partialLinkText('delete'))

		await firstActionEdit.click()
		await browser.wait(Until.urlIs(`${URL}/tables#edit`))
		// await browser.wait(5)

		await firstActionDelete.click()
		await browser.wait(Until.urlIs(`${URL}/tables#delete`))
		// await browser.wait(5)

		await headers[0].click()
		await browser.wait(1)
		const newFirstCell = await browser.findElement('#table1 tbody tr td')
		await browser.wait(Until.elementTextDoesNotMatch(newFirstCell, new RegExp(lastName)))
		await browser.wait(5)
	})
}
