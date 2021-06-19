import { TestSettings, step, By } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step(async (browser) => {
		await browser.authenticate('admin', 'admin')
		await browser.visit('https://the-internet.herokuapp.com/digest_auth')
		const msg = await browser.findElement(By.tagName('p'))
		assert.strictEqual(await msg.text(), 'Congratulations! You must have the proper credentials.')
	})
}
