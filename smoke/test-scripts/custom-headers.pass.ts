import { step, By, Until, TestSettings } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	// loopCount: 1,
	clearCache: false,
	clearCookies: true,
	responseTimeMeasurement: 'step',
	extraHTTPHeaders: {
		'x-hooray': 'hdrcustom',
	},
	actionDelay: '1s',
	stepDelay: '1s',
	name: 'Flood challenge',
	description: 'Flood challenge yeahh',
}

export default async () => {
	step('1. Start', async browser => {
		console.log('before visit')
		const now = new Date().getTime() / 1000
		await browser.visit(`https://flooded.io/headers?bust=${now}`)

		console.log('after visit')
		const body = await browser.findElement('body')
		const text = await body.getProperty('innerHTML')

		assert.ok(text.includes('x-hooray'))
		assert.ok(text.includes('hdrcustom'))

		console.log(text)

		// await browser.wait(Until.partialVisibleText('I AM ROBOT'))
	})
}
