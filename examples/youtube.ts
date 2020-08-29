import { step, TestSettings, By, Until } from '@flood/element'

var i = 0

export const settings: TestSettings = {
    loopCount: -1,
    clearCache: true,
    disableCache: true,
    actionDelay: 8,
    stepDelay: 10,
    screenshotOnFailure: true,
    userAgent: 'flood-element-test',
}

export default () => {
	step('01_Home', async browser => {
		await browser.visit('https://www.youtube.com/watch?v=oYTo0jwRfMo')
		
		await browser.takeScreenshot()
	})

	step('02_ClickPlay', async browser => {
		//Click on Play button
		let playBtn = await browser.findElement(By.xpath('//button[@aria-label="Play"]'))
		await playBtn.click()

		await browser.takeScreenshot()
	})

	step('03_Play', async browser => {
		//Take a screenshot every 5 seconds until video finishes

		for (i = 0; i <= 60; i++) {
			await browser.takeScreenshot()
			await browser.wait(5)
		}
		
	})


}
