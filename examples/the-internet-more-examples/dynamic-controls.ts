import { step, TestSettings, Until, By } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	waitUntil: 'visible',
}

export default () => {
	step('Step 1: Add/Remove', async browser => {
		await browser.visit('https://the-internet.herokuapp.com')
		await browser.wait(Until.titleMatches(/([A-Za-z]{3}) ([A-Za-z]{8})/))
		await browser.click(By.linkText('Dynamic Controls'))
		await browser.wait(
			Until.urlMatches(
				/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}[dynamic_controls]/,
			),
		)
		const btnRemove = By.xpath('//*[@id="checkbox-example"]/button')
		const message = By.id('message')

		await browser.click(btnRemove)
		await browser.wait(Until.elementTextIs(message, "It's gone!"))
		await browser.click(btnRemove)
		await browser.wait(Until.elementTextIsNot(message, "It's gone!"))
		const checkbox = await browser.findElement(By.id('checkbox'))

		assert.strictEqual(await checkbox.isSelectable(), true, 'should be a checkbox')
		await checkbox.click()
		assert.strictEqual(await checkbox.isSelected(), true, 'should be checked')
	})
	step('Step 2: Enable/Disable', async browser => {
		const input = await browser.findElement(By.attr('input', 'type', 'text'))
		const btnEnable = await browser.findElement(By.xpath('//*[@id="input-example"]/button'))

		assert.strictEqual(await input.isEnabled(), false, 'input is disabled')
		await btnEnable.click()
		await browser.wait(Until.elementIsEnabled(input))
		await btnEnable.click()
		await browser.wait(Until.elementIsDisabled(input))
		assert.strictEqual(await input.isEnabled(), false, 'input is disabled again')
	})
}
