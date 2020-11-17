import { BROWSER, step, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: -1,
	stages: [
		{
			duration: '15s',
			target: 2,
		},
		{
			duration: '15s',
			target: 0,
		},
		{
			duration: '15s',
			target: 4,
		},
	],
	browser: BROWSER.CHROME,
}

export default () => {
	step('Test', async browser => {
		await browser.visit('https://google.com', { waitUntil: 'domcontentloaded' })
		await browser.wait(5)
	})
}
