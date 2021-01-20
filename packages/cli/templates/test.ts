import { step, TestSettings, By, beforeAll, afterAll } from '@flood/element'

export const settings: TestSettings = {
	// userAgent: 'flood-chrome-test',
	// loopCount: 1,

	// Automatically wait for elements before trying to interact with them
	waitUntil: 'visible',
}

export default () => {
	beforeAll(async browser => {
		// Run this hook before running the first step
		await browser.wait('500ms')
	})

	afterAll(async browser => {
		// Run this hook after running the last step
		await browser.wait('500ms')
	})

	// If you want to do some actions before/after every single step, use beforeEach/afterEach
	// beforeEach(async browser => {})
	// afterEach(async browser => {})

	step('Start', async browser => {
		// visit instructs the browser to launch, open a page, and navigate to <%= url %>
		await browser.visit('<%= url %>')
		await browser.takeScreenshot()
	})

	// browser keyword can be shorthanded as anything that is descriptive to you.
	step('Step 2 find first heading', async browser => {
		// Note the use of await here, this is the async/await pattern https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
		// and is required everytime you talk to the browser
		const firstHeading = await browser.findElement(By.css('h1,h2,h3,p'))
		const h1Text = await firstHeading.text()

		// You can use console.log to write out to the command line
		console.log(h1Text)
	})
}
