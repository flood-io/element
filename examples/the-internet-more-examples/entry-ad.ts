import { Until, TestSettings, step, By, Browser, beforeEach } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'present',
}

export default () => {
	beforeEach(async browser => {
		await browser.visit('https://the-internet.herokuapp.com/entry_ad')
	})

	step.once('Size of the dialog', async browser => {
		const dialog = await browser.findElement(By.id('modal'))
		const dialogSize = await dialog.size()
		const btnClose = await dialog.findElement('#modal > div.modal > div.modal-footer > p')

		assert.strictEqual(await btnClose.text(), 'Close')
		console.log(`Size of the dialog is ${dialogSize.width}x${dialogSize.height}`)
	})

	let count = 0

	step.while(
		() => count < 5,
		{ waitUntil: 'present' },
		async (browser: Browser) => {
			const dialog = await browser.findElement(By.id('modal'))
			const btnClose = await dialog.findElement(By.css('#modal > div.modal > div.modal-footer > p'))
			const reEnableLink = await browser.findElement(By.partialLinkText('click'))
			const isDisplayed = await dialog.isDisplayed()

			if (isDisplayed) {
				console.log('Dialog is displayed, closing it')
				await btnClose.click()
			} else {
				console.log('Dialog was closed, reactivating it')
				await reEnableLink.click()
			}
			count += 1
		},
	)
}
