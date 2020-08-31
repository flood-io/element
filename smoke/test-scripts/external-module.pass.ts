import { step, TestSettings, Device, Browser } from '@flood/element'
import { dirname } from 'path'
import assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	device: Device.iPadLandscape,
	userAgent: 'I AM ROBOT',
	disableCache: true,
	actionDelay: '1s',
	stepDelay: '2s',
	responseTimeMeasurement: 'step',
}

/**
 * Flood Challenge
 * Version: 1.0
 */
export default () => {
	step('external module', async (browser: Browser) => {
		assert.ok(dirname('/foo/bar') == '/foo')
		assert.ok(process.cwd().length > 0)
	})
}
