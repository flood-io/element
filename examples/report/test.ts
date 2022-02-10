import { step, TestSettings, RecoverWith, By } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
	screenshotOnFailure: true,
}

export default () => {
	step('test with browser', async (browser) => {
		console.log('Load facebook for the first time')
		await browser.visit('https://www.facebook.com/')
		console.log('Load video for the first time')
		await browser.visit('https://www.youtube.com/watch?v=6fvhLrBrPQI')

		const btnPlay = await browser.findElement(
			By.xpath('//button[@class="ytp-large-play-button ytp-button"]')
		)
		btnPlay.click()
		await browser.takeScreenshot()
	})
	let repeatCount = 0
	step.repeat(4, 'Test repeat step', async (browser) => {
		if (repeatCount < 2) {
			throw new Error('repeat error')
		}
	})
	step.recovery('Test repeat step', { tries: 2 }, async (browser) => {
		repeatCount++
		console.log('recovery repeat')
		return RecoverWith.RESTART
	})
	step('Test normal step', async (browser) => {
		throw new Error()
	})
	step.recovery('Test normal step', async (browser) => {
		console.log('recovery normal step')
		return RecoverWith.CONTINUE
	})
	step('Test normal 1 step', async (browser) => {})
	step.if(
		() => false,
		'Test if step',
		async (browser) => {
			console.log('if')
		}
	)
	step.unless(
		() => false,
		'Test unless step',
		async (browser) => {
			console.log('unless')
		}
	)
	step.once('Test once step', async (browser) => {
		console.log('once')
	})
	step.skip('Test skip step', async (browser) => {
		console.log('skpped')
	})
	let count = 0
	step.while(
		() => count < 3,
		'Test step while',
		async (browser) => {
			if (count < 2) {
				throw new Error('while')
			}
			console.log('Test step while done')
		}
	)
	step.recovery('Test step while', { tries: 2 }, async () => {
		count++
		console.log('recovery while')
		return RecoverWith.RETRY
	})
}
