import { BROWSER_TYPE, step, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: -1,
	stages: [
		{
			duration: '15s',
			user: 2,
		},
		{
			duration: '15s',
			user: 0,
		},
		{
			duration: '15s',
			user: 4,
		},
	],
	browserType: BROWSER_TYPE.WEBKIT,
}

export default () => {
	step('Test', async browser => {
		await browser.visit('https://google.com', { waitUntil: 'domcontentloaded' })
		await browser.wait(5)
	})
}
