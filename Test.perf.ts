import { step, TestSettings, Key } from '@flood/element'
import { getName } from './Utils'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
	step('Start', async browser => {
		await browser.visit('https://www.google.com.vn')
		await browser.sendKeys(getName())
		await browser.sendKeys(Key.ENTER)
		await browser.wait(5)
	})
}
