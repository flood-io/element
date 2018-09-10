import { suite } from '@flood/element'

export default suite(step => {
	step('Test: Start', async browser => {
		await browser.visit('https://challenge.flood.io/')
		await browser.takeScreenshot()
	})
})
