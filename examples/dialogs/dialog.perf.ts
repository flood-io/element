import { Browser, step, Until, Key } from '@flood/element'

export default () => {
	let alertPromise: Promise<any>

	step('Load Example', async (browser: Browser) => {
		alertPromise = new Promise(yeah => browser.page.on('dialog', dialog => yeah(dialog)))
		await browser.visit('https://codepen.io/tim_koopmans/pen/WNbBmxY')
		await browser.takeScreenshot()
	})
	step('Click button', async (browser: Browser) => {
		;(await alertPromise).dismiss()
		await browser.takeScreenshot()
	})
}
