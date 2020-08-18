import { TestSettings, step, By, Until } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	extraHTTPHeaders: {
		Authorization: 'Basic YWRtaW46YWRtaW4=',
	},
}

export default () => {
	step('1 - Authentication info in header', async browser => {
		await browser.visit('https://the-internet.herokuapp.com/basic_auth')
		const msg = await browser.findElement(By.tagName('p'))
		assert.strictEqual(await msg.text(), 'Congratulations! You must have the proper credentials.')
	})

	step('2 - Set authentication info', async browser => {
		await browser.setExtraHTTPHeaders({ Authorization: 'Basic Z3Vlc3Q6Z3Vlc3Q=' })
		await browser.visit('https://jigsaw.w3.org/HTTP/Basic/')
		await browser.wait(Until.elementIsVisible(By.visibleText('Your browser made it!')))
	})
}
