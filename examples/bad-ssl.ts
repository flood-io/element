import { By, step, setup } from '@flood/element'
import assert from 'assert'

export default () => {
	setup({
		loopCount: 1,
		name: 'Bad SSL',
		consoleFilter: ['info', 'debug'],
		ignoreHTTPSErrors: true,
	})

	step({ waitUntil: 'visible' }, async browser => {
		await browser.visit('https://expired.badssl.com/')
		const header = await browser.findElement(By.partialVisibleText('expired.'))
		assert.strictEqual(await header.tagName(), 'H1')
	})
}
