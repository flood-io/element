import { step, TestSettings, By } from '@flood/element'

export const settings: TestSettings = {
	// userAgent: 'flood-chrome-test',
	// loopCount: 1,

	// Automatically wait for elements before trying to interact with them
	waitUntil: 'visible',
	viewport: {
		height:800,
		width:1280,
	},
}

export default () => {
	step('Start', async browser => {
		// visit instructs the browser to launch, open a page, and navigate to https://amazon.com
		await browser.visit('https://amazon.com')
		await browser.takeScreenshot()
	})

	// browser keyword can be shorthanded as "b" or anything that is descriptive to you.
	step('Step 2 find first heading', async b => {
		// Note the use of await here, this is the async/await pattern https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
		// and is required everytime you talk to the browser
		const firstHeading = await b.findElement(By.css('h1,h2,h3,p'))
		await b.highlightElement(firstHeading)
		const h1Text = await firstHeading.text()

		// You can use console.log to write out to the command line
		console.log(h1Text)
	})
}
