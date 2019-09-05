import { step, TestSettings, By } from '@flood/element'

export const settings: TestSettings = {
	// userAgent: 'flood-chrome-test',
	// loopCount: 1,

	waitUntil: 'visible',
}

export default () => {
	step('Start', async browser => {
		// visit instructs the browser to launch, open a page, and navigate to <%= url %>
		await browser.visit('<%= url %>')
		await browser.takeScreenshot()
	})

	// browser keyword can be shorthanded as "b" or anything that is descriptive to you.
	step('Step 2 find first heading', async b => {
		// Note the use of await here, this is the async/await pattern https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
		// and is required everytime you talk to the browser
		let firstHeading = await b.findElement(By.css('h1,h2,h3,p'))
		await b.highlightElement(firstHeading)
		let h1Text = await firstHeading.text()

		// You can use console.log to write out to the command line
		console.log(h1Text)
	})
}
