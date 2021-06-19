import { TestSettings, step, By, Device } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'visible',
}

export default () => {
	step.once(async (browser) => {
		await browser.emulateDevice(Device.iPhoneX)
		await browser.setUserAgent('Fake user agent')
		await browser.visit('http://whatsmyuseragent.org/')
		const uaText = await browser.findElement(By.attr('p', 'class', 'intro-text'))
		assert.strictEqual(await uaText.text(), 'Fake user agent')
	})
}
