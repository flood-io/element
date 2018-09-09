import { step } from '@flood/element'

export const settings = {}

export default () => {
	step('Test: Start', async browser => {
		await browser.visit('https://challenge.flood.io/', { waitUntil: 'networkidle0' })
		await browser.takeScreenshot()
	})
}
