import { step, TestSettings, By, TestData, Browser, ElementHandle, Key } from '@flood/element'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
}

interface Data {
	keys: string[]
}

TestData.fromJSON<Data>('data.json')

export default () => {
	let textBox: ElementHandle
	let keys: string[] = []
	let count = 0

	step('Visit', async (browser: Browser, data: Data) => {
		await browser.visit('https://the-internet.herokuapp.com/key_presses')
		assert.strictEqual(await browser.title(), 'The Internet')

		textBox = await browser.findElement(By.id('target'))
		keys = data.keys
		await browser.focus(textBox)
	})

	step.repeat(5, async (browser: Browser) => {
		await browser.press(keys[count])
		count += 1
	})

	step('Test: value of text box vs. result', async (browser) => {
		// clear the value of text box first
		assert.strictEqual(await textBox.getProperty('value'), 'press')
		await browser.clear(textBox)
		assert.strictEqual(await textBox.getProperty('value'), '')

		const result = await browser.findElement(By.id('result'))

		// press a key when the text box is not focused
		await browser.blur(textBox)
		await browser.press('KeyA')
		assert.strictEqual(await textBox.getProperty('value'), '')
		assert.strictEqual(await result.text(), 'You entered: A')

		// press a key combination when the text box is focused
		await browser.focus(textBox)
		await browser.sendKeyCombinations(Key.COMMAND, 'KeyB')
		assert.strictEqual(await textBox.getProperty('value'), '')
		assert.strictEqual(await result.text(), 'You entered: B')
	})

	step('Test: dispose text box', async (browser) => {
		try {
			await textBox.dispose()
			await browser.focus(textBox)
		} catch (e) {
			console.log('Caught an error from focusing on a disposed handle')
		}
	})
}
