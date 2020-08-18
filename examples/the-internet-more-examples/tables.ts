import { step, Until, By, TestSettings, Browser, ElementHandle, Locator } from '@flood/element'
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
	step(
		'Test: Go to the Data Tables page',
		async (browser: Browser): Promise<void> => {
			await browser.visit(`${URL}/tables`)
			// Until.titleIs example
			await browser.wait(Until.titleIs('The Internet'))
		},
	)

	step(
		'Test: findElements example',
		async (browser: Browser): Promise<void> => {
			// ElementHandle.findElements(locator: Locator) example
			const tables: ElementHandle[] = await browser.findElements(By.css('.tablesorter'))
			const table1Id: string = await tables[0].getProperty('id')
			const table2Id: string = await tables[1].getProperty('id')
			assert(table1Id === 'table1', 'The id of table 1 must be correct')
			assert(table2Id === 'table2', 'The id of table 2 must be correct')
		},
	)

	step(
		'Test: Do some sort action with tablesorter',
		async (browser: Browser): Promise<void> => {
			const table: Locator = By.id('table2')
			const tableEl: ElementHandle = await browser.findElement(table)
			const headers: ElementHandle[] = await tableEl.findElements(By.css('.header'))

			const rows: ElementHandle[] = await tableEl.findElements(By.css('tbody tr'))
			const cellsOfFirstRow: ElementHandle[] = await rows[0].findElements(By.tagName('td'))
			const lastName: string = await cellsOfFirstRow[0].text()
			const firstActionEdit: ElementHandle = await rows[0].findElement(By.partialLinkText('edit'))
			const firstActionDelete: ElementHandle = await rows[0].findElement(
				By.partialLinkText('delete'),
			)

			await firstActionEdit.click()
			await browser.wait(Until.urlIs(`${URL}/tables#edit`))
			await browser.wait(2)
			await browser.takeScreenshot()

			await firstActionDelete.click()
			await browser.wait(Until.urlIs(`${URL}/tables#delete`))
			await browser.wait(2)
			await browser.takeScreenshot()

			await headers[0].click()
			await browser.wait(1)

			// By.js() example
			const newFirstCell: ElementHandle = await browser.findElement(
				By.js(() => {
					return document
						.getElementById('table2')
						.getElementsByTagName('tbody')[0]
						.getElementsByClassName('last-name')[0]
				}),
			)

			// Until.elementTextDoesNotMatch example
			await browser.wait(Until.elementTextDoesNotMatch(newFirstCell, new RegExp(lastName)))
			const newLastName: string = await newFirstCell.text()

			assert(newLastName !== lastName, 'The new last name must be different from the old one.')
			await browser.wait(2)
		},
	)
}
