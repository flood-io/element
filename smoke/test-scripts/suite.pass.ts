import { suite, TestData, By, Until, TestSettings } from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	// loopCount: 1,
	clearCache: false,
	clearCookies: true,
	responseTimeMeasurement: 'step',
	userAgent: 'I AM ROBOT',
	actionDelay: 1,
	stepDelay: 1,
	name: 'Flood challenge',
	description: 'Flood challenge yeahh',
}

const expectedPlanet = 'mars'
const data1 = TestData.fromData([{ hello: expectedPlanet }])
const data2 = TestData.fromData([{ hello: 'world' }])

export default suite.withData(data1, async step => {
	step('suitey', async (browser, data) => {
		console.log('data', JSON.stringify(data))
		assert.equal(expectedPlanet, data.hello)
	})
})
