import { step, TestSettings, Until, By, Device } from '@flood/element'
import * as assert from 'assert'

var setUp = 1

export const settings: TestSettings = {
	clearCache: true,
	disableCache: true,
	waitTimeout: '30s',
	screenshotOnFailure: true,
	stepDelay: '7.5s',
	actionDelay: '7.5s',
}

/**
 * youtube
 * @version 1.0
 */
export default () => {
	step('Test: Start', async browser => {
		if (setUp == 1) {
			console.log('Load video for the first time')
			await browser.visit('https://www.youtube.com/watch?v=6fvhLrBrPQI')

			let btnPlay = await browser.findElement(
				By.xpath('//button[@class="ytp-large-play-button ytp-button"]'),
			)
			btnPlay.click()

			await browser.takeScreenshot()

			setUp = 0
		} else {
			//Video page has already been opened
			//Check to see if the video has finished playing
			try {
				await browser.wait(Until.elementIsVisible(By.xpath('//button[@title="Replay"]')))
				//If the video has finished, restart and reload video page again
				setUp = 1
				await browser.takeScreenshot()
				await console.log('Replaying video next iteration')
			} catch {
				//Video is still playing
				await console.log('Video is still playing')
				await browser.takeScreenshot()
			}
		}
	})
}
