import { Until, TestSettings, step, By, Browser, beforeEach } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'present',
}

export default () => {
	// step(async browser => {
	// 	await browser.visit(url)
	// 	const dialog = await browser.findElement(By.id('modal'))
	// 	const btnClose = await dialog.findElement(By.css('#modal > div.modal > div.modal-footer > p'))
	// 	const dialogSize = await dialog.size()
	// 	await browser.wait(10)

	// 	console.log(`Size of the dialog is ${dialogSize.width}x${dialogSize.height}`)
	// 	assert.strictEqual(await dialog.isDisplayed(), true)

	// 	await btnClose.click()
	// 	await browser.visit(url)
	// 	assert.strictEqual(await dialog.isDisplayed(), false)

	// 	const reactivateLink = await browser.findElement(By.partialLinkText('click'))

	// 	await reactivateLink.click()
	// 	await browser.wait(5)
	// 	await browser.visit(url)
	// 	await browser.wait(5)
	// 	assert.strictEqual(await dialog.isDisplayed(), true)
	// })

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
